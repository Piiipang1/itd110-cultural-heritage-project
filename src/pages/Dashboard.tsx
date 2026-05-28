import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { FaLandmark, FaUsers, FaCalendarAlt, FaExclamationTriangle, } from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const [totalHeritage, setTotalHeritage] = useState(0);
  const [totalCustodians, setTotalCustodians] = useState(0);
  const [totalFestivals, setTotalFestivals] = useState(0);
  const [endangeredCount, setEndangeredCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const heritageSnap = await getDocs(collection(db, "heritageItems"));
      const custodiansSnap = await getDocs(collection(db, "custodians"));
      const festivalsSnap = await getDocs(collection(db, "festivals"));

      setTotalHeritage(heritageSnap.size);
      setTotalCustodians(custodiansSnap.size);
      setTotalFestivals(festivalsSnap.size);

      const endangered = heritageSnap.docs.filter(
        (doc) => doc.data().preservationStatus === "Endangered"
      );

      setEndangeredCount(endangered.length);
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[#3E2F26]">
          Cultural Heritage Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage heritage records, custodians, festivals, and reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Heritage Records</p>
              <h2 className="text-4xl font-bold text-[#3E2F26] mt-2">
                {totalHeritage}
              </h2>
            </div>
            <div className="bg-yellow-100 p-4 rounded-full">
              <FaLandmark className="text-3xl text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Custodians</p>
              <h2 className="text-4xl font-bold text-[#3E2F26] mt-2">
                {totalCustodians}
              </h2>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <FaUsers className="text-3xl text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Festivals</p>
              <h2 className="text-4xl font-bold text-[#3E2F26] mt-2">
                {totalFestivals}
              </h2>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <FaCalendarAlt className="text-3xl text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Endangered</p>
              <h2 className="text-4xl font-bold text-[#3E2F26] mt-2">
                {endangeredCount}
              </h2>
            </div>
            <div className="bg-red-100 p-4 rounded-full">
              <FaExclamationTriangle className="text-3xl text-red-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-[#3E2F26] mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/add-heritage")}
            className="bg-[#556B2F] hover:bg-[#445523] text-white py-4 rounded-xl font-semibold transition"
          >
            Add Heritage Record
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="bg-[#3E2F26] hover:bg-[#2A1F1A] text-white py-4 rounded-xl font-semibold transition"
          >
            View Reports
          </button>

          <button
            onClick={() => navigate("/public-listings")}
            className="bg-[#C8A96B] hover:bg-[#b8944f] text-white py-4 rounded-xl font-semibold transition"
          >
            Public Listings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;