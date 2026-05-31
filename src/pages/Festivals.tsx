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
import type { Festival } from "../types/Festival";
import { FaCalendarAlt, FaSearch, FaTrash } from "react-icons/fa";

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
    } catch {
      setMessage("Failed to fetch festivals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchFestivals();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

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

    if (!formData.name || !formData.date || !formData.type) {
      setMessage("Please fill in required fields.");
      return;
    }

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
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this festival?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "festivals", id));

    const heritageSnap = await getDocs(collection(db, "heritageItems"));
    const batch = writeBatch(db);

    heritageSnap.forEach((itemDoc) => {
      const data = itemDoc.data();

      if (
        Array.isArray(data.festivalIds) &&
        data.festivalIds.includes(id)
      ) {
        const newFestivalIds = data.festivalIds.filter(
          (fid: string) => fid !== id
        );

        batch.update(doc(db, "heritageItems", itemDoc.id), {
          festivalIds: newFestivalIds,
        });
      }
    });

    await batch.commit();

    setMessage("Festival deleted.");
    void fetchFestivals();
  };

  const filteredFestivals = useMemo(() => {
    return festivals.filter((f) => {
      const q = searchText.trim().toLowerCase();

      if (!q) return true;

      return (
        f.name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.date.toLowerCase().includes(q)
      );
    });
  }, [festivals, searchText]);

  if (loading) {
    return <p className="text-gray-600">Loading festivals...</p>;
  }

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3E2F26] dark:text-slate-100">
          Festivals & Events
        </h1>

        <p className="text-gray-600 dark:text-slate-300 mt-2">
          Manage cultural festivals and heritage celebrations.
        </p>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3E2F26] dark:text-slate-100">
          Festivals & Events
        </h1>

        <p className="text-gray-600 dark:text-slate-300 mt-2">
          Manage cultural festivals and heritage events.
        </p>
      </div>

      {message && (
        <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-xl font-semibold">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* FORM */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 p-3 rounded-full">
              <FaCalendarAlt />
            </div>

            <h2 className="text-2xl font-bold text-[#3E2F26] dark:text-slate-100">
              Add Festival
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              name="name"
              placeholder="Festival Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <input
              name="location"
              placeholder="Festival Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            >
              <option value="">Select Type</option>
              <option value="Religious">Religious</option>
              <option value="Cultural">Cultural</option>
              <option value="Historical">Historical</option>
              <option value="Community">Community</option>
            </select>

            <textarea
              name="description"
              placeholder="Festival Description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />

            <button
              type="submit"
              className="w-full bg-[#556B2F] hover:bg-[#445523] text-white py-3 rounded-xl font-semibold shadow transition"
            >
              Save Festival
            </button>
          </form>
        </div>

        {/* TABLE */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 p-6">

          <h2 className="text-2xl font-bold text-[#3E2F26] dark:text-slate-100 mb-5">
            Registered Festivals
          </h2>

          <div className="flex items-center gap-3 bg-[#F8F5F0] dark:bg-slate-700 px-4 py-3 rounded-xl mb-6">
            <FaSearch className="text-gray-500 dark:text-slate-400" />

            <input
              type="text"
              placeholder="Search festivals..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-700 dark:text-slate-200"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead>
                <tr className="bg-[#3E2F26] dark:bg-slate-900 text-white">
                  <th className="p-4 rounded-tl-xl">Festival</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 rounded-tr-xl">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredFestivals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-gray-500 dark:text-slate-400"
                    >
                      No festivals found.
                    </td>
                  </tr>
                ) : (
                  filteredFestivals.map((festival) => (
                    <tr
                      key={festival.id}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-[#F8F5F0] dark:hover:bg-slate-700/50 transition"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-[#3E2F26] dark:text-slate-100">
                          {festival.name}
                        </p>

                        {festival.description && (
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            {festival.description}
                          </p>
                        )}
                      </td>

                      <td className="p-4">{festival.date}</td>

                      <td className="p-4">
                        {festival.location || "—"}
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 font-semibold">
                          {festival.type}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(festival.id!)}
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