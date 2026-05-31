import { useEffect, useState, useMemo } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import type { Custodian } from "../types/Custodian";
import { FaSearch, FaTrash, FaUsers } from "react-icons/fa";

export default function Custodians() {
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    officialRepresentative: "",
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
    } catch {
      setMessage("Failed to fetch custodians.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCustodians();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      setMessage("Please fill in required fields.");
      return;
    }

    await addDoc(collection(db, "custodians"), {
      ...formData,
      createdBy: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
    });

    setMessage("Custodian added successfully!");
    setFormData({
      name: "",
      type: "",
      officialRepresentative: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      description: "",
      establishedYear: "",
    });

    void fetchCustodians();
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this custodian?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "custodians", id));

    const heritageSnap = await getDocs(collection(db, "heritageItems"));
    const batch = writeBatch(db);

    heritageSnap.forEach((itemDoc) => {
      const data = itemDoc.data();
      if (data.custodianId === id) {
        batch.update(doc(db, "heritageItems", itemDoc.id), {
          custodianId: "",
        });
      }
    });

    await batch.commit();

    setMessage("Custodian deleted.");
    void fetchCustodians();
  };

  const filteredCustodians = useMemo(() => {
    return custodians.filter((c) => {
      const q = searchText.trim().toLowerCase();
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.address || "").toLowerCase().includes(q) ||
        (c.contactEmail || "").toLowerCase().includes(q)
      );
    });
  }, [custodians, searchText]);

  if (loading) return <p className="text-gray-600">Loading custodians...</p>;

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3E2F26]">
          Custodian Organizations
        </h1>

        <p className="text-gray-600 mt-2">
          Manage organizations responsible for heritage preservation.
        </p>
      </div>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3E2F26]">
          Custodian Organizations
        </h1>
        <p className="text-gray-600 mt-2">
          Manage institutions responsible for cultural heritage preservation.
        </p>
      </div>

      {message && (
        <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-xl font-semibold">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 text-green-700 p-3 rounded-full">
              <FaUsers />
            </div>
            <h2 className="text-2xl font-bold text-[#3E2F26]">
              Add Custodian
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Organization Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            >
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
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <input
              name="contactPhone"
              placeholder="Contact Phone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />
            <input
              name="officialRepresentative"
              placeholder="Official Representative"
              value={formData.officialRepresentative}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <input
              name="address"
              placeholder="Office Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <input
              name="establishedYear"
              placeholder="Established Year"
              value={formData.establishedYear}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <button
              type="submit"
              className="w-full bg-[#556B2F] hover:bg-[#445523] text-white py-3 rounded-xl font-semibold shadow transition"
            >
              Save Custodian
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-[#3E2F26] mb-5">
            Registered Custodians
          </h2>

          <div className="flex items-center gap-3 bg-[#F8F5F0] px-4 py-3 rounded-xl mb-6">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search custodians..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-700"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#3E2F26] text-white">
                  <th className="p-4 rounded-tl-xl">Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Representative</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Established</th>
                  <th className="p-4 rounded-tr-xl">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustodians.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No custodian organizations found.
                    </td>
                  </tr>
                ) : (
                  filteredCustodians.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 hover:bg-[#F8F5F0] transition"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-[#3E2F26]">{c.name}</p>
                        {c.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {c.description}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-semibold">
                          {c.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <div>{c.contactEmail || "—"}</div>
                        <div>{c.contactPhone || ""}</div>
                      </td>
                      <td className="p-4">{c.officialRepresentative || "—"}</td>
                      <td className="p-4">{c.address || "—"}</td>
                      <td className="p-4">{c.establishedYear || "—"}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(c.id!)}
                          className="bg-red-100 text-red-700 p-3 rounded-lg hover:bg-red-200 transition"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}