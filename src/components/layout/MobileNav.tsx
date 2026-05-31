import { Link } from "react-router-dom";
import { FaBars, FaHome, FaLandmark, FaPlus, FaChartBar } from "react-icons/fa";
import { useState } from "react";

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden bg-[#3E2F26] dark:bg-slate-950 text-white p-4 shadow-md transition-colors duration-200">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-[#F4D58D]">Heritage DB</h1>

        <button onClick={() => setOpen(!open)}>
          <FaBars />
        </button>
      </div>

      {open && (
        <nav className="mt-4 flex flex-col gap-3">
          <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaHome /> Dashboard
          </Link>

          <Link to="/heritage-records" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaLandmark /> Heritage Records
          </Link>

          <Link to="/add-heritage" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaPlus /> Add Heritage
          </Link>

          <Link to="/reports" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <FaChartBar /> Reports
          </Link>
        </nav>
      )}
    </div>
  );
}

export default MobileNav;