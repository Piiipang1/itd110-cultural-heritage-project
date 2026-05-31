import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import type { HeritageItem } from "../types/HeritageItem";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";

function HeritageRecords() {
  const [records, setRecords] = useState<HeritageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchRecords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "heritageItems"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HeritageItem[];

      setRecords(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "heritageItems", id));
    fetchRecords();
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((record) =>
    record.name.toLowerCase().includes(searchText.toLowerCase()) ||
    record.province.toLowerCase().includes(searchText.toLowerCase()) ||
    record.municipality.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) return <p className="text-gray-600">Loading records...</p>;

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3E2F26] dark:text-slate-100">
          Heritage Records
        </h1>

        <p className="text-gray-600 dark:text-slate-300 mt-2">
          Manage cultural heritage items and preservation details.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#3E2F26] dark:text-slate-100">Heritage Records</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-2">
            Manage cultural heritage items and preservation information.
          </p>
        </div>

        <Link
          to="/add-heritage"
          className="flex items-center gap-2 bg-[#556B2F] hover:bg-[#445523] text-white px-5 py-3 rounded-xl font-semibold transition shadow"
        >
          <FaPlus />
          Add Record
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 bg-[#F8F5F0] dark:bg-slate-700 px-4 py-3 rounded-xl mb-6">
          <FaSearch className="text-gray-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, province, or municipality..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-transparent outline-none w-full text-gray-700 dark:text-slate-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#3E2F26] dark:bg-slate-900 text-white">
                <th className="p-4 rounded-tl-xl">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Province</th>
                <th className="p-4">Municipality</th>
                <th className="p-4">Status</th>
                <th className="p-4 rounded-tr-xl">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-slate-400">
                    No heritage records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 dark:border-slate-700 hover:bg-[#F8F5F0] dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="p-4">
                      {record.imageUrl ? (
                        <img
                          src={record.imageUrl}
                          alt={record.name}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-400 dark:text-slate-400">
                          No Img
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-semibold text-[#3E2F26] dark:text-slate-100">
                      {record.name}
                    </td>

                    <td className="p-4">{record.type}</td>
                    <td className="p-4">{record.province}</td>
                    <td className="p-4">{record.municipality}</td>

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-semibold">
                        {record.preservationStatus}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/edit-heritage/${record.id}`}
                          className="bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition"
                        >
                          <FaEdit />
                        </Link>

                        <button
                          onClick={() => handleDelete(record.id!)}
                          className="bg-red-100 text-red-700 p-3 rounded-lg hover:bg-red-200 transition"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HeritageRecords;