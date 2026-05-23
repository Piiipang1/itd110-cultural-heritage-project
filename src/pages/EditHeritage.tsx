import { useEffect, useState } from "react";
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate, useParams, Link } from "react-router-dom";
import type { Custodian } from "../types/Custodian";
import type { Festival } from "../types/Festival";
import type { HeritageItem } from "../types/HeritageItem";

function EditHeritage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    province: "",
    municipality: "",
    latitude: "",
    longitude: "",
    description: "",
    culturalSignificance: "",
    preservationStatus: "",
    imageUrl: "",
    custodianId: "",
    festivalIds: [] as string[],
    relatedHeritageIds: [] as string[],
  });

  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [heritageItems, setHeritageItems] = useState<HeritageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecord = async () => {
    if (!id) return;
    try {
      const docRef = doc(db, "heritageItems", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          name: data.name || "",
          type: data.type || "",
          province: data.province || "",
          municipality: data.municipality || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          description: data.description || "",
          culturalSignificance: data.culturalSignificance || "",
          preservationStatus: data.preservationStatus || "",
          imageUrl: data.imageUrl || "",
          custodianId: data.custodianId || "",
          festivalIds: Array.isArray(data.festivalIds) ? data.festivalIds : [],
          relatedHeritageIds: Array.isArray(data.relatedHeritageIds) ? data.relatedHeritageIds : [],
        });
      }

      const custSnap = await getDocs(collection(db, "custodians"));
      const festSnap = await getDocs(collection(db, "festivals"));
      const itemsSnap = await getDocs(collection(db, "heritageItems"));

      setCustodians(custSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Custodian[]);
      setFestivals(festSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Festival[]);
      setHeritageItems(itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as HeritageItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFestivalToggle = (fid: string) => {
    const list = formData.festivalIds.includes(fid)
      ? formData.festivalIds.filter(id => id !== fid)
      : [...formData.festivalIds, fid];
    setFormData({ ...formData, festivalIds: list });
  };

  const handleRelatedToggle = (rid: string) => {
    const list = formData.relatedHeritageIds.includes(rid)
      ? formData.relatedHeritageIds.filter(id => id !== rid)
      : [...formData.relatedHeritageIds, rid];
    setFormData({ ...formData, relatedHeritageIds: list });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    await updateDoc(doc(db, "heritageItems", id), {
      ...formData,
    });

    navigate("/heritage-records");
  };

  if (loading) return <p>Loading record...</p>;

  // Exclude current item from related selection to avoid self-linking
  const otherItems = heritageItems.filter(item => item.id !== id);

  return (
    <div>
      <h1>Edit Heritage Record</h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/heritage-records">
          <button>Back to List</button>
        </Link>
      </div>

      <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "600px" }}>
        <label>
          Name
          <input name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }} />
        </label>

        <label>
          Type
          <select name="type" value={formData.type} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }}>
            <option value="">Select Type</option>
            <option value="Tangible">Tangible</option>
            <option value="Intangible">Intangible</option>
            <option value="Natural">Natural</option>
            <option value="Mixed">Mixed</option>
          </select>
        </label>

        <label>
          Province
          <input name="province" value={formData.province} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }} />
        </label>

        <label>
          City/Municipality
          <input name="municipality" value={formData.municipality} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }} />
        </label>

        <label>
          Latitude
          <input name="latitude" value={formData.latitude} onChange={handleChange} style={{ width: "100%", marginTop: "0.4rem" }} />
        </label>

        <label>
          Longitude
          <input name="longitude" value={formData.longitude} onChange={handleChange} style={{ width: "100%", marginTop: "0.4rem" }} />
        </label>

        <label>
          Description
          <textarea name="description" value={formData.description} onChange={handleChange} required style={{ width: "100%", height: "100px", marginTop: "0.4rem" }} />
        </label>

        <label>
          Cultural Significance
          <textarea
            name="culturalSignificance"
            value={formData.culturalSignificance}
            onChange={handleChange}
            required
            style={{ width: "100%", height: "100px", marginTop: "0.4rem" }}
          />
        </label>

        <label>
          Preservation Status
          <select name="preservationStatus" value={formData.preservationStatus} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }}>
            <option value="">Select Preservation Status</option>
            <option value="Good">Good</option>
            <option value="Needs Preservation">Needs Preservation</option>
            <option value="Endangered">Endangered</option>
            <option value="Restored">Restored</option>
          </select>
        </label>

        <label>
          Image URL
          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={{ width: "100%", marginTop: "0.4rem" }} />
        </label>

        {/* Relational Inputs */}
        <label>
          Custodian Organization
          <select name="custodianId" value={formData.custodianId} onChange={handleChange} style={{ width: "100%", marginTop: "0.4rem" }}>
            <option value="">Select Custodian</option>
            {custodians.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label>Link Festivals & Events</label>
          <div style={{ maxHeight: "120px", overflowY: "auto", border: "1px solid #ccc", padding: "0.5rem" }}>
            {festivals.length === 0 ? <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>No festivals available.</p> :
              festivals.map(f => (
                <label key={f.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "normal", cursor: "pointer", padding: "0.2rem 0" }}>
                  <input
                    type="checkbox"
                    checked={formData.festivalIds.includes(f.id!)}
                    onChange={() => handleFestivalToggle(f.id!)}
                  />
                  {f.name}
                </label>
              ))
            }
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label>Link Related Heritage Items</label>
          <div style={{ maxHeight: "120px", overflowY: "auto", border: "1px solid #ccc", padding: "0.5rem" }}>
            {otherItems.length === 0 ? <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>No other heritage items available.</p> :
              otherItems.map(item => (
                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "normal", cursor: "pointer", padding: "0.2rem 0" }}>
                  <input
                    type="checkbox"
                    checked={formData.relatedHeritageIds.includes(item.id!)}
                    onChange={() => handleRelatedToggle(item.id!)}
                  />
                  {item.name}
                </label>
              ))
            }
          </div>
        </div>

        <button type="submit">Update Record</button>
      </form>
    </div>
  );
}

export default EditHeritage;