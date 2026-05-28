import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

      setTimeout(() => {
        navigate("/heritage-records");
      }, 1000);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3E2F26]">
          Add Heritage Record
        </h1>
        <p className="text-gray-600 mt-2">
          Register a new cultural heritage item in the system.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        {message && (
          <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-xl font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#3E2F26] mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heritage Name
                </label>
                <input
                  name="name"
                  placeholder="Enter heritage name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heritage Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="Tangible">Tangible</option>
                  <option value="Intangible">Intangible</option>
                  <option value="Natural">Natural</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Province
                </label>
                <input
                  name="province"
                  placeholder="Enter province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City/Municipality
                </label>
                <input
                  name="municipality"
                  placeholder="Enter city or municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#3E2F26] mb-4">
              Location Coordinates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  name="latitude"
                  placeholder="Example: 7.9986"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  name="longitude"
                  placeholder="Example: 124.2928"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#3E2F26] mb-4">
              Cultural Details
            </h2>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the heritage item"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cultural Significance
                </label>
                <textarea
                  name="culturalSignificance"
                  placeholder="Explain the importance of this heritage item"
                  value={formData.culturalSignificance}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#3E2F26] mb-4">
              Status and Media
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preservation Status
                </label>
                <select
                  name="preservationStatus"
                  value={formData.preservationStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="Good">Good</option>
                  <option value="Needs Preservation">Needs Preservation</option>
                  <option value="Endangered">Endangered</option>
                  <option value="Restored">Restored</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  name="imageUrl"
                  placeholder="Paste image link here"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/heritage-records")}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#556B2F] hover:bg-[#445523] text-white font-semibold shadow transition"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHeritage;