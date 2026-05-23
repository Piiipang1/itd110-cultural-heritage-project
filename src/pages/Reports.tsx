import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import type { HeritageItem } from "../types/HeritageItem";
import type { Custodian } from "../types/Custodian";
import type { Festival } from "../types/Festival";
import "./Reports.css";

type TabOption = "overview" | "categories" | "regions";

export default function Reports() {
  const [records, setRecords] = useState<HeritageItem[]>([]);
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabOption>("overview");

  // Columns visibility for printing
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    type: true,
    location: true,
    status: true,
    custodian: true,
    festivals: true,
    coords: false,
    description: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsSnap = await getDocs(collection(db, "heritageItems"));
        const custSnap = await getDocs(collection(db, "custodians"));
        const festSnap = await getDocs(collection(db, "festivals"));

        setRecords(
          itemsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as HeritageItem[]
        );

        setCustodians(
          custSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Custodian[]
        );

        setFestivals(
          festSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Festival[]
        );
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Map utilities for relational names
  const custodianMap = useMemo(() => {
    const map = new Map<string, string>();
    custodians.forEach((c) => {
      if (c.id) map.set(c.id, c.name);
    });
    return map;
  }, [custodians]);

  const festivalMap = useMemo(() => {
    const map = new Map<string, string>();
    festivals.forEach((f) => {
      if (f.id) map.set(f.id, f.name);
    });
    return map;
  }, [festivals]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const total = records.length;
    let tangible = 0;
    let intangible = 0;
    let natural = 0;
    let mixed = 0;

    let good = 0;
    let needsPres = 0;
    let endangered = 0;
    let restored = 0;

    const provinceCounts: { [key: string]: number } = {};
    const municipalityCounts: { [key: string]: number } = {};

    records.forEach((item) => {
      // Classification Count
      const type = String(item.type || "").trim();
      if (type === "Tangible") tangible++;
      else if (type === "Intangible") intangible++;
      else if (type === "Natural") natural++;
      else if (type === "Mixed") mixed++;

      // Status Count
      const status = String(item.preservationStatus || "").trim();
      if (status === "Good") good++;
      else if (status === "Needs Preservation") needsPres++;
      else if (status === "Endangered") endangered++;
      else if (status === "Restored") restored++;

      // Regions Count
      if (item.province) {
        provinceCounts[item.province] = (provinceCounts[item.province] || 0) + 1;
      }
      if (item.municipality) {
        const fullLoc = `${item.municipality}, ${item.province || ""}`;
        municipalityCounts[fullLoc] = (municipalityCounts[fullLoc] || 0) + 1;
      }
    });

    return {
      total,
      tangible,
      intangible,
      natural,
      mixed,
      good,
      needsPres,
      endangered,
      restored,
      provinces: Object.entries(provinceCounts).sort((a, b) => b[1] - a[1]),
      municipalities: Object.entries(municipalityCounts).sort((a, b) => b[1] - a[1]),
    };
  }, [records]);

  const toggleColumn = (col: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <h3>Generating Analytics Reports...</h3>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header */}
      <header className="reports-header">
        <div>
          <h1>📊 System Reports & Analytics</h1>
          <p style={{ margin: "0.2rem 0 0 0" }}>System metrics, status analysis, and regional distributions</p>
        </div>
        <div className="header-actions">
          <button className="btn-nav primary" onClick={handlePrint}>
            🖨️ Print Report
          </button>
          {auth.currentUser ? (
            <Link to="/dashboard" className="btn-nav">
              🖥️ Back to Dashboard
            </Link>
          ) : (
            <Link to="/public-listings" className="btn-nav">
              🏛️ Back to Directory
            </Link>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📋 Directory Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          🏷️ Classification & Status
        </button>
        <button
          className={`tab-btn ${activeTab === "regions" ? "active" : ""}`}
          onClick={() => setActiveTab("regions")}
        >
          📍 Regional Distribution
        </button>
      </nav>

      {/* High-level Summary Cards */}
      <section className="metrics-summary">
        <div className="metric-card">
          <span className="metric-label">Total Heritage Items</span>
          <span className="metric-value">{stats.total}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Endangered Sites</span>
          <span className="metric-value" style={{ color: "#c62828" }}>
            {stats.endangered}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Tangible / Intangible</span>
          <span className="metric-value" style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>
            🏺 {stats.tangible} / 🎭 {stats.intangible}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Registered Custodians</span>
          <span className="metric-value">{custodians.length}</span>
        </div>
      </section>

      {/* Tab 1: Directory Overview & Printable List */}
      {activeTab === "overview" && (
        <section className="overview-tab-section">
          {/* Columns Visibility Selection */}
          <div className="columns-toggle-section">
            <div className="columns-toggle-title">Select Columns to Show on Report Printout</div>
            <div className="columns-toggle-grid">
              <label>
                <input
                  type="checkbox"
                  checked={visibleColumns.type}
                  onChange={() => toggleColumn("type")}
                />
                Classification
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={visibleColumns.location}
                  onChange={() => toggleColumn("location")}
                />
                Location
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={visibleColumns.status}
                  onChange={() => toggleColumn("status")}
                />
                Status
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={visibleColumns.custodian}
                  onChange={() => toggleColumn("custodian")}
                />
                Custodian
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={visibleColumns.festivals}
                  onChange={() => toggleColumn("festivals")}
                />
                Festivals
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={visibleColumns.coords}
                  onChange={() => toggleColumn("coords")}
                />
                Coordinates
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={visibleColumns.description}
                  onChange={() => toggleColumn("description")}
                />
                Description
              </label>
            </div>
          </div>

          {/* Table list */}
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  {visibleColumns.name && <th>Heritage Name</th>}
                  {visibleColumns.type && <th>Classification</th>}
                  {visibleColumns.location && <th>Location</th>}
                  {visibleColumns.status && <th>Preservation Status</th>}
                  {visibleColumns.custodian && <th>Custodian</th>}
                  {visibleColumns.festivals && <th>Associated Festivals</th>}
                  {visibleColumns.coords && <th>Coordinates</th>}
                  {visibleColumns.description && <th>Description</th>}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", color: "#7a6b57" }}>
                      No heritage records available in the system database.
                    </td>
                  </tr>
                ) : (
                  records.map((item) => {
                    const custName = item.custodianId ? custodianMap.get(item.custodianId) : "—";
                    const fNames = Array.isArray(item.festivalIds)
                      ? item.festivalIds.map((fid) => festivalMap.get(fid)).filter(Boolean)
                      : [];

                    return (
                      <tr key={item.id}>
                        {visibleColumns.name && <td><strong>{item.name}</strong></td>}
                        {visibleColumns.type && <td>{item.type}</td>}
                        {visibleColumns.location && (
                          <td>
                            {item.municipality && `${item.municipality}, `}
                            {item.province}
                          </td>
                        )}
                        {visibleColumns.status && <td>{item.preservationStatus}</td>}
                        {visibleColumns.custodian && <td>{custName}</td>}
                        {visibleColumns.festivals && <td>{fNames.join(", ") || "—"}</td>}
                        {visibleColumns.coords && (
                          <td style={{ fontSize: "0.85rem" }}>
                            Lat: {item.latitude || "—"} <br />
                            Long: {item.longitude || "—"}
                          </td>
                        )}
                        {visibleColumns.description && (
                          <td style={{ fontSize: "0.85rem", maxWidth: "250px" }}>{item.description}</td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 2: Category-based Reports */}
      {activeTab === "categories" && (
        <section className="categories-tab-section">
          <div className="report-grid-two">
            {/* Classification Analysis */}
            <div className="report-section-card">
              <h3>🏷️ Classification Distribution</h3>
              <div className="category-bars-container">
                {[
                  { name: "Tangible", count: stats.tangible, class: "tangible" },
                  { name: "Intangible", count: stats.intangible, class: "intangible" },
                  { name: "Natural", count: stats.natural, class: "natural" },
                  { name: "Mixed", count: stats.mixed, class: "mixed" },
                ].map((cat) => {
                  const pct = stats.total > 0 ? (cat.count / stats.total) * 100 : 0;
                  return (
                    <div className="category-bar-group" key={cat.name}>
                      <div className="category-bar-label">
                        <span>{cat.name}</span>
                        <span>
                          {cat.count} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className={`progress-bar-fill fill-${cat.class}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preservation Status Analysis */}
            <div className="report-section-card">
              <h3>🛡️ Preservation Status</h3>
              <div className="category-bars-container">
                {[
                  { name: "Good", count: stats.good, class: "good" },
                  { name: "Needs Preservation", count: stats.needsPres, class: "needs" },
                  { name: "Endangered", count: stats.endangered, class: "endangered" },
                  { name: "Restored", count: stats.restored, class: "restored" },
                ].map((stat) => {
                  const pct = stats.total > 0 ? (stat.count / stats.total) * 100 : 0;
                  return (
                    <div className="category-bar-group" key={stat.name}>
                      <div className="category-bar-label">
                        <span>{stat.name}</span>
                        <span>
                          {stat.count} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className={`progress-bar-fill fill-${catToClass(stat.name)}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {stats.endangered > 0 && (
                <div className="endangered-alert-box">
                  ⚠️ <strong>Notice:</strong> There are {stats.endangered} endangered heritage site(s) requiring urgent attention and funding.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Region-based Reports */}
      {activeTab === "regions" && (
        <section className="regions-tab-section">
          <div className="report-grid-two">
            {/* Province Distribution */}
            <div className="report-section-card">
              <h3>🗺️ Distribution by Province</h3>
              <div className="region-list">
                {stats.provinces.length === 0 ? (
                  <p style={{ color: "#7a6b57" }}>No regional data logged.</p>
                ) : (
                  stats.provinces.map(([provName, count]) => (
                    <div className="region-list-item" key={provName}>
                      <span className="region-name">{provName}</span>
                      <span className="region-count">
                        {count} item{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* City/Municipality Distribution */}
            <div className="report-section-card">
              <h3>🏙️ Distribution by City / Municipality</h3>
              <div className="region-list">
                {stats.municipalities.length === 0 ? (
                  <p style={{ color: "#7a6b57" }}>No municipal data logged.</p>
                ) : (
                  stats.municipalities.slice(0, 8).map(([munName, count]) => (
                    <div className="region-list-item" key={munName}>
                      <span className="region-name">{munName}</span>
                      <span className="region-count">{count}</span>
                    </div>
                  ))
                )}
              </div>
              {stats.municipalities.length > 8 && (
                <p style={{ fontSize: "0.85rem", color: "#7a6b57", marginTop: "1rem", fontStyle: "italic" }}>
                  Showing top 8 locations. Expand full printout for full municipal directories.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function catToClass(statusName: string) {
  switch (statusName) {
    case "Good":
      return "good";
    case "Needs Preservation":
      return "needs";
    case "Endangered":
      return "endangered";
    case "Restored":
      return "restored";
    default:
      return "good";
  }
}
