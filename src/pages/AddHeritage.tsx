import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

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
        });

        const [message, setMessage] = useState("");

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value});
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
                });

                setTimeout(() => {
                    navigate("/heritage-records");
                }, 1000);
            } catch (error: any) {
                setMessage(error.message);
            }
        };

        return (
            <div>
                <h1>Add Heritage Record</h1>

                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Heritage Name" value={formData.name} onChange={handleChange} required/>

                    <select name="type" value={formData.type} onChange={handleChange} required >
                        <option value="">Select Type</option>
                        <option value="Tangible">Tangible</option>
                        <option value="Intangible">Intangible</option>
                        <option value="Natural">Natural
                        </option>
                        <option value="Mixed">Mixed</option>
                    </select>

                    <input name="province" placeholder="Province" value={formData.province} onChange={handleChange} required/>
                    <input name="municipality" placeholder="City/Municipality" value={formData.municipality} onChange={handleChange} required />
                    <input name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} />
                    <input name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} />

                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required/>

                    <textarea name="culturalSignificance" placeholder="Cultural Significance" value={formData.culturalSignificance} onChange={handleChange} required/>

                    <select name="preservationStatus" value={formData.preservationStatus}
                    onChange={handleChange} required>
                        <option value="">Select Preservation Status</option>
                        <option value="Good">Good</option>
                        <option value="Needs Preservation">Needs Preservation</option>
                        <option value="Endangered">Endangered</option>
                        <option value="Restoredd">Restored</option>
                    </select>

                    <input name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange}/>

                    <button type="submit">Save Record</button>
                </form>

                <p>{message}</p>
            </div>
        );
    }

    export default AddHeritage;