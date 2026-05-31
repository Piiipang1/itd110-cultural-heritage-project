import { NavLink } from "react-router-dom";
import { FaHome, FaLandmark, FaPlus, FaUsers, FaCalendarAlt, FaChartBar, FaGlobe, } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { FaSignOutAlt } from "react-icons/fa";


function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      isActive
        ? "bg-[#556B2F] text-white"
        : "text-white hover:bg-[#556B2F]"
    }`;

  return (
    <aside className="hidden lg:block w-64 min-h-screen bg-[#3E2F26] dark:bg-slate-950 text-white fixed left-0 top-0 p-6 shadow-xl transition-colors duration-200">
      <div className="mb-10 border-b border-white/20 pb-4">
        <h1 className="text-2xl font-bold text-[#F4D58D]">Heritage DB</h1>
        <p className="text-sm text-gray-300 mt-1">Cultural Registry System</p>
      </div>

      <nav className="flex flex-col gap-3">
        <NavLink to="/dashboard" className={linkClass}>
          <FaHome />
          Dashboard
        </NavLink>

        <NavLink to="/heritage-records" className={linkClass}>
          <FaLandmark />
          Heritage Records
        </NavLink>

        <NavLink to="/add-heritage" className={linkClass}>
          <FaPlus />
          Add Heritage
        </NavLink>

        <NavLink to="/custodians" className={linkClass}>
          <FaUsers />
          Custodians
        </NavLink>

        <NavLink to="/festivals" className={linkClass}>
          <FaCalendarAlt />
          Festivals
        </NavLink>

        <NavLink to="/reports" className={linkClass}>
          <FaChartBar />
          Reports
        </NavLink>

        <NavLink to="/public-listings" className={linkClass}>
          <FaGlobe />
          Public Listings
        </NavLink>

        <button
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-red-700 transition">
          <FaSignOutAlt />Logout
        </button>
      </nav>

    
    </aside>
  );
}

export default Sidebar;