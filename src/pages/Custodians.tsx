import { useEffect, useState, useMemo } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import type { Custodian } from "../types/Custodian";

export default function Custodians() {
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    description: "",
    establishedYear: "",
  });

  const fetchCustodians = async () => {
    try {
      const snap = await getDocs(collection(db, "custodians"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Custodian[];
      setCustodians(list);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to fetch custodians.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustodians();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      setMessage("Please fill in required fields (Name and Type).");
      return;
    }

    try {
      await addDoc(collection(db, "custodians"), {
        ...formData,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
      setMessage("Custodian added successfully!");
      setFormData({
        name: "",
        type: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        description: "",
        establishedYear: "",
      });
      void fetchCustodians();
    } catch (err: any) {
      console.error(err);
      setMessage("Error adding custodian: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this custodian? This will also remove references on associated heritage records."
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "custodians", id));

      const heritageSnap = await getDocs(collection(db, "heritageItems"));
      const batch = writeBatch(db);
      let updatedCount = 0;

      heritageSnap.forEach((itemDoc) => {
        const data = itemDoc.data();
        if (data.custodianId === id) {
          batch.update(doc(db, "heritageItems", itemDoc.id), {
            custodianId: ""
          });
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        await batch.commit();
      }

      setMessage("Custodian deleted.");
      void fetchCustodians();
    } catch (err: any) {
      console.error(err);
      setMessage("Error deleting custodian: " + err.message);
    }
  };

  const filteredCustodians = useMemo(() => {
    return custodians.filter((c) => {
      const q = searchText.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q)
      );
    });
  }, [custodians, searchText]);

  if (loading) return <p>Loading custodians...</p>;

  return (
    <div>
      <h1>Custodian Organizations</h1>

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
        <Link to="/dashboard">
          <button>Back to Dashboard</button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* Form Container */}
        <div style={{ flex: "1 1 300px" }}>
          <h2>Add Custodian</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <input
              name="name"
              placeholder="Organization Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />

            <select name="type" value={formData.type} onChange={handleChange} required style={{ width: "100%" }}>
              <option value="">Select Type</option>
              <option value="Government">Government</option>
              <option value="NGO">NGO</option>
              <option value="Private">Private</option>
              <option value="Community">Community</option>
            </select>

            <input
              type="email"
              name="contactEmail"
              placeholder="Contact Email"
              value={formData.contactEmail}
              onChange={handleChange}
              style={{ width: "100%" }}
            />

            <input
              name="contactPhone"
              placeholder="Contact Phone"
              value={formData.contactPhone}
              onChange={handleChange}
              style={{ width: "100%" }}
            />

            <input
              name="address"
              placeholder="Office Address"
              value={formData.address}
              onChange={handleChange}
              style={{ width: "100%" }}
            />

            <input
              name="establishedYear"
              placeholder="Established Year"
              value={formData.establishedYear}
              onChange={handleChange}
              style={{ width: "100%" }}
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              style={{ width: "100%", height: "80px" }}
            />

            <button type="submit">Save Custodian</button>
          </form>
          {message && <p>{message}</p>}
        </div>

        {/* List Container */}
        <div style={{ flex: "2 2 500px" }}>
          <h2>Registered Custodians</h2>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search custodians"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {filteredCustodians.length === 0 ? (
            <p>No custodian organizations found.</p>
          ) : (
            <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Contact Info</th>
                  <th>Address</th>
                  <th>Established</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustodians.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      {c.description && <div style={{ fontSize: "0.85rem", color: "#666" }}>{c.description}</div>}
                    </td>
                    <td>{c.type}</td>
                    <td>
                      <div>{c.contactEmail || "—"}</div>
                      <div>{c.contactPhone || ""}</div>
                    </td>
                    <td>{c.address || "—"}</td>
                    <td>{c.establishedYear || "—"}</td>
                    <td>
                      <button onClick={() => handleDelete(c.id!)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
