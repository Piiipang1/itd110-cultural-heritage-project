import { useState, useEffect } from "react";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import type { Custodian } from "../types/Custodian";
import type { Festival } from "../types/Festival";
import type { HeritageItem } from "../types/HeritageItem";

function AddHeritage() {
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
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const custSnap = await getDocs(collection(db, "custodians"));
                const festSnap = await getDocs(collection(db, "festivals"));
                const itemsSnap = await getDocs(collection(db, "heritageItems"));

                setCustodians(custSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Custodian[]);
                setFestivals(festSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Festival[]);
                setHeritageItems(itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as HeritageItem[]);
            } catch (err) {
                console.error("Error loading relations:", err);
            } finally {
                setLoading(false);
            }
        };
        void loadData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
    };

    const handleFestivalToggle = (id: string) => {
        const list = formData.festivalIds.includes(id)
            ? formData.festivalIds.filter(fid => fid !== id)
            : [...formData.festivalIds, id];
        setFormData({ ...formData, festivalIds: list });
    };

    const handleRelatedToggle = (id: string) => {
        const list = formData.relatedHeritageIds.includes(id)
            ? formData.relatedHeritageIds.filter(rid => rid !== id)
            : [...formData.relatedHeritageIds, id];
        setFormData({ ...formData, relatedHeritageIds: list });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await addDoc(collection(db, "heritageItems"), {
                ...formData,
                createdBy: auth.currentUser?.uid,
                createdAt: serverTimestamp(),
            });

            setMessage("Heritage record added successfully!");
            setFormData({
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
                festivalIds: [],
                relatedHeritageIds: [],
            });

            setTimeout(() => {
                navigate("/heritage-records");
            }, 1000);
        } catch (error: any) {
            setMessage(error.message);
        }
    };

    if (loading) return <p>Loading form relations...</p>;

    return (
        <div>
            <h1>Add Heritage Record</h1>

            <div style={{ marginBottom: "1.5rem" }}>
                <Link to="/dashboard">
                    <button>Back to Dashboard</button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "600px" }}>
                <label>
                    Name *
                    <input name="name" placeholder="Heritage Name" value={formData.name} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }}/>
                </label>

                <label>
                    Type *
                    <select name="type" value={formData.type} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }}>
                        <option value="">Select Type</option>
                        <option value="Tangible">Tangible</option>
                        <option value="Intangible">Intangible</option>
                        <option value="Natural">Natural</option>
                        <option value="Mixed">Mixed</option>
                    </select>
                </label>

                <label>
                    Province *
                    <input name="province" placeholder="Province" value={formData.province} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }}/>
                </label>

                <label>
                    City/Municipality *
                    <input name="municipality" placeholder="City/Municipality" value={formData.municipality} onChange={handleChange} required style={{ width: "100%", marginTop: "0.4rem" }}/>
                </label>

                <label>
                    Latitude
                    <input name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} style={{ width: "100%", marginTop: "0.4rem" }}/>
                </label>

                <label>
                    Longitude
                    <input name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} style={{ width: "100%", marginTop: "0.4rem" }}/>
                </label>

                <label>
                    Description *
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required style={{ width: "100%", height: "100px", marginTop: "0.4rem" }}/>
                </label>

                <label>
                    Cultural Significance *
                    <textarea name="culturalSignificance" placeholder="Cultural Significance" value={formData.culturalSignificance} onChange={handleChange} required style={{ width: "100%", height: "100px", marginTop: "0.4rem" }}/>
                </label>

                <label>
                    Preservation Status *
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
                    <input name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} style={{ width: "100%", marginTop: "0.4rem" }}/>
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
                        {heritageItems.length === 0 ? <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>No other heritage items available.</p> :
                            heritageItems.map(item => (
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

                <button type="submit">Save Record</button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default AddHeritage;