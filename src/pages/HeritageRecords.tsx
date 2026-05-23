import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import type { HeritageItem } from "../types/HeritageItem";
import type { Custodian } from "../types/Custodian";
import type { Festival } from "../types/Festival";

function HeritageRecords() {
  const [records, setRecords] = useState<HeritageItem[]>([]);
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    try {
      const itemsSnap = await getDocs(collection(db, "heritageItems"));
      const custSnap = await getDocs(collection(db, "custodians"));
      const festSnap = await getDocs(collection(db, "festivals"));

      setRecords(
        itemsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HeritageItem[]
      );

      setCustodians(
        custSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Custodian[]
      );

      setFestivals(
        festSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Festival[]
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this record? This will also clean up references to this item.");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "heritageItems", id));

      const batch = writeBatch(db);
      let updatedCount = 0;

      records.forEach((record) => {
        if (record.id !== id && Array.isArray(record.relatedHeritageIds) && record.relatedHeritageIds.includes(id)) {
          const newRelated = record.relatedHeritageIds.filter((rid) => rid !== id);
          batch.update(doc(db, "heritageItems", record.id!), {
            relatedHeritageIds: newRelated,
          });
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        await batch.commit();
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete record.");
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const custodianMap = useMemo(() => {
    const map = new Map<string, string>();
    custodians.forEach((c) => {
      if (c.id) map.set(c.id, c.name);
    });
    return map;
  }, [custodians]);

  const festivalMap = useMemo(() => {
    const map = new Map<string, string>();
    festivals.forEach((f) => {
      if (f.id) map.set(f.id, f.name);
    });
    return map;
  }, [festivals]);

  const heritageMap = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => {
      if (r.id) map.set(r.id, r.name);
    });
    return map;
  }, [records]);

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
        <Link to="/dashboard">
          <button>Back to Dashboard</button>
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
              <th>Custodian</th>
              <th>Linked Festivals</th>
              <th>Related Items</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => {
              const custodianName = record.custodianId ? custodianMap.get(record.custodianId) : null;
              const recordFestivals = Array.isArray(record.festivalIds)
                ? record.festivalIds.map((fid) => festivalMap.get(fid)).filter(Boolean)
                : [];
              const recordRelated = Array.isArray(record.relatedHeritageIds)
                ? record.relatedHeritageIds.map((rid) => heritageMap.get(rid)).filter(Boolean)
                : [];

              return (
                <tr key={record.id}>
                  <td>{record.name}</td>
                  <td>{record.type}</td>
                  <td>{record.province}</td>
                  <td>{record.municipality}</td>
                  <td>{record.preservationStatus}</td>
                  <td>{custodianName || "—"}</td>
                  <td>{recordFestivals.join(", ") || "—"}</td>
                  <td>{recordRelated.join(", ") || "—"}</td>
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
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HeritageRecords;
