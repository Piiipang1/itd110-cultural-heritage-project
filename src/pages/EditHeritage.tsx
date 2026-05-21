import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate, useParams } from "react-router-dom";

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
  });

  const fetchRecord = async () => {
    if (!id) return;

    const docRef = doc(db, "heritageItems", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setFormData(docSnap.data() as any);
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    await updateDoc(doc(db, "heritageItems", id), {
      ...formData,
    });

    navigate("/heritage-records");
  };

  return (
    <div>
      <h1>Edit Heritage Record</h1>

      <form onSubmit={handleUpdate}>
        <input name="name" value={formData.name} onChange={handleChange} required />

        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="">Select Type</option>
          <option value="Tangible">Tangible</option>
          <option value="Intangible">Intangible</option>
          <option value="Natural">Natural</option>
          <option value="Mixed">Mixed</option>
        </select>

        <input name="province" value={formData.province} onChange={handleChange} required />
        <input name="municipality" value={formData.municipality} onChange={handleChange} required />
        <input name="latitude" value={formData.latitude} onChange={handleChange} />
        <input name="longitude" value={formData.longitude} onChange={handleChange} />

        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <textarea
          name="culturalSignificance"
          value={formData.culturalSignificance}
          onChange={handleChange}
          required
        />

        <select name="preservationStatus" value={formData.preservationStatus} onChange={handleChange} required>
          <option value="">Select Preservation Status</option>
          <option value="Good">Good</option>
          <option value="Needs Preservation">Needs Preservation</option>
          <option value="Endangered">Endangered</option>
          <option value="Restored">Restored</option>
        </select>

        <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} />

        <button type="submit">Update Record</button>
      </form>
    </div>
  );
}

export default EditHeritage;