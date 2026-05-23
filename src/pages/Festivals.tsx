import { useEffect, useState, useMemo } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import type { Festival } from "../types/Festival";

export default function Festivals() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    type: "",
    description: "",
  });

  const fetchFestivals = async () => {
    try {
      const snap = await getDocs(collection(db, "festivals"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Festival[];
      setFestivals(list);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to fetch festivals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFestivals();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.type) {
      setMessage("Please fill in required fields (Name, Date, and Type).");
      return;
    }

    try {
      await addDoc(collection(db, "festivals"), {
        ...formData,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
      setMessage("Festival added successfully!");
      setFormData({
        name: "",
        date: "",
        location: "",
        type: "",
        description: "",
      });
      void fetchFestivals();
    } catch (err: any) {
      console.error(err);
      setMessage("Error adding festival: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this festival? This will also remove the association from any linked heritage records."
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "festivals", id));

      const heritageSnap = await getDocs(collection(db, "heritageItems"));
      const batch = writeBatch(db);
      let updatedCount = 0;

      heritageSnap.forEach((itemDoc) => {
        const data = itemDoc.data();
        if (Array.isArray(data.festivalIds) && data.festivalIds.includes(id)) {
          const newFestivalIds = data.festivalIds.filter((fid: string) => fid !== id);
          batch.update(doc(db, "heritageItems", itemDoc.id), {
            festivalIds: newFestivalIds
          });
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        await batch.commit();
      }

      setMessage("Festival deleted.");
      void fetchFestivals();
    } catch (err: any) {
      console.error(err);
      setMessage("Error deleting festival: " + err.message);
    }
  };

  const filteredFestivals = useMemo(() => {
    return festivals.filter((f) => {
      const q = searchText.trim().toLowerCase();
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.date.toLowerCase().includes(q)
      );
    });
  }, [festivals, searchText]);

  if (loading) return <p>Loading festivals...</p>;

  return (
    <div>
      <h1>Festivals & Events</h1>

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
        <Link to="/dashboard">
          <button>Back to Dashboard</button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* Form Container */}
        <div style={{ flex: "1 1 300px" }}>
          <h2>Add Festival/Event</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <input
              name="name"
              placeholder="Event Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />

            <input
              name="date"
              placeholder="Date / Occurrence"
              value={formData.date}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />

            <select name="type" value={formData.type} onChange={handleChange} required style={{ width: "100%" }}>
              <option value="">Select Type</option>
              <option value="Religious">Religious</option>
              <option value="Cultural">Cultural</option>
              <option value="Historical">Historical</option>
              <option value="Seasonal">Seasonal</option>
            </select>

            <input
              name="location"
              placeholder="Location/Venue"
              value={formData.location}
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

            <button type="submit">Save Festival</button>
          </form>
          {message && <p>{message}</p>}
        </div>

        {/* List Container */}
        <div style={{ flex: "2 2 500px" }}>
          <h2>Registered Festivals & Events</h2>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search festivals"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {filteredFestivals.length === 0 ? (
            <p>No festivals or events found.</p>
          ) : (
            <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Date / Occurrence</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFestivals.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <strong>{f.name}</strong>
                      {f.description && <div style={{ fontSize: "0.85rem", color: "#666" }}>{f.description}</div>}
                    </td>
                    <td>{f.type}</td>
                    <td>{f.date}</td>
                    <td>{f.location || "—"}</td>
                    <td>
                      <button onClick={() => handleDelete(f.id!)}>Delete</button>
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
