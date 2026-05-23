import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import type { HeritageItem } from "../types/HeritageItem";

function HeritageRecords() {
  const [records, setRecords] = useState<HeritageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchRecords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "heritageItems"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HeritageItem[];

      setRecords(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "heritageItems", id));
    fetchRecords();
  };

  useEffect(() => {
    const loadRecords = async () => {
      await fetchRecords();
    };

    void loadRecords();
  }, []);

  const uniqueValues = useMemo(() => {
    const types = new Set<string>();
    const provinces = new Set<string>();
    const statuses = new Set<string>();

    records.forEach((record) => {
      if (record.type) types.add(record.type);
      if (record.province) provinces.add(record.province);
      if (record.preservationStatus) statuses.add(record.preservationStatus);
    });

    return {
      types: Array.from(types).sort(),
      provinces: Array.from(provinces).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = record.name
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());
      const matchesType = typeFilter === "" || record.type === typeFilter;
      const matchesProvince = provinceFilter === "" || record.province === provinceFilter;
      const matchesStatus = statusFilter === "" || record.preservationStatus === statusFilter;

      return matchesSearch && matchesType && matchesProvince && matchesStatus;
    });
  }, [records, searchText, typeFilter, provinceFilter, statusFilter]);

  const resetFilters = () => {
    setSearchText("");
    setTypeFilter("");
    setProvinceFilter("");
    setStatusFilter("");
  };

  if (loading) return <p>Loading records...</p>;

  return (
    <div>
      <h1>Heritage Records</h1>

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/add-heritage">
          <button>Add New Record</button>
        </Link>
        <button type="button" onClick={resetFilters}>
          Clear / Reset Filters
        </button>
      </div>

      <div style={{ marginBottom: "1.5rem", display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label>
          Search by Name
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search heritage name"
            style={{ width: "100%", marginTop: "0.4rem" }}
          />
        </label>

        <label>
          Type
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: "100%", marginTop: "0.4rem" }}
          >
            <option value="">All Types</option>
            {uniqueValues.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Province
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            style={{ width: "100%", marginTop: "0.4rem" }}
          >
            <option value="">All Provinces</option>
            {uniqueValues.provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>

        <label>
          Preservation Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "100%", marginTop: "0.4rem" }}
          >
            <option value="">All Statuses</option>
            {uniqueValues.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredRecords.length === 0 ? (
        <p>No heritage records match the current search or filter selections.</p>
      ) : (
        <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Province</th>
              <th>Municipality</th>
              <th>Status</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.name}</td>
                <td>{record.type}</td>
                <td>{record.province}</td>
                <td>{record.municipality}</td>
                <td>{record.preservationStatus}</td>
                <td>{record.latitude}</td>
                <td>{record.longitude}</td>
                <td>
                  {record.imageUrl ? (
                    <img src={record.imageUrl} alt={record.name} width="80" />
                  ) : (
                    "No image"
                  )}
                </td>
                <td>
                  <Link to={`/edit-heritage/${record.id}`}>
                    <button>Edit</button>
                  </Link>
                  <button onClick={() => handleDelete(record.id!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HeritageRecords;
