import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import type { HeritageItem } from "../types/HeritageItem";
import type { Custodian } from "../types/Custodian";
import type { Festival } from "../types/Festival";
import DarkModeToggle from "../components/DarkModeToggle";
import "./PublicListings.css";

export default function PublicListings() {
  const [records, setRecords] = useState<HeritageItem[]>([]);
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal detail state
  const [selectedItem, setSelectedItem] = useState<HeritageItem | null>(null);

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
        console.error("Error loading public data:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Maps for relations
  const custodianMap = useMemo(() => {
    const map = new Map<string, Custodian>();
    custodians.forEach((c) => {
      if (c.id) map.set(c.id, c);
    });
    return map;
  }, [custodians]);

  const festivalMap = useMemo(() => {
    const map = new Map<string, Festival>();
    festivals.forEach((f) => {
      if (f.id) map.set(f.id, f);
    });
    return map;
  }, [festivals]);

  const heritageMap = useMemo(() => {
    const map = new Map<string, HeritageItem>();
    records.forEach((r) => {
      if (r.id) map.set(r.id, r);
    });
    return map;
  }, [records]);

  // Unique filter values derived from records
  const uniqueValues = useMemo(() => {
    const types = new Set<string>();
    const provinces = new Set<string>();
    const statuses = new Set<string>();

    records.forEach((r) => {
      if (r.type) types.add(r.type);
      if (r.province) provinces.add(r.province);
      if (r.preservationStatus) statuses.add(r.preservationStatus);
    });

    return {
      types: Array.from(types).sort(),
      provinces: Array.from(provinces).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchText.trim().toLowerCase()) ||
        (r.municipality && r.municipality.toLowerCase().includes(searchText.trim().toLowerCase())) ||
        (r.province && r.province.toLowerCase().includes(searchText.trim().toLowerCase()));
      const matchesType = typeFilter === "" || r.type === typeFilter;
      const matchesProvince = provinceFilter === "" || r.province === provinceFilter;
      const matchesStatus = statusFilter === "" || r.preservationStatus === statusFilter;

      return matchesSearch && matchesType && matchesProvince && matchesStatus;
    });
  }, [records, searchText, typeFilter, provinceFilter, statusFilter]);

  const resetFilters = () => {
    setSearchText("");
    setTypeFilter("");
    setProvinceFilter("");
    setStatusFilter("");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <h3>Loading Cultural Heritage Directory...</h3>
      </div>
    );
  }

  // Get active items for detailed view modal
  const selectedCustodian = selectedItem?.custodianId ? custodianMap.get(selectedItem.custodianId) : null;
  const selectedFestivals = selectedItem?.festivalIds
    ? selectedItem.festivalIds.map((fid) => festivalMap.get(fid)).filter((f): f is Festival => !!f)
    : [];
  const selectedRelated = selectedItem?.relatedHeritageIds
    ? selectedItem.relatedHeritageIds.map((rid) => heritageMap.get(rid)).filter((h): h is HeritageItem => !!h)
    : [];

  return (
    <div className="min-h-screen bg-[#FDFBF8] dark:bg-slate-900 transition-colors duration-200">
      <div className="public-listings-container">
        {/* Header */}
      <header className="public-header">
        <div>
          <h1>🏛️ Cultural Heritage Registry</h1>
          <p style={{ margin: "0.2rem 0 0 0" }}>Public Repository of Heritage Sites, Custodians & Festivals</p>
        </div>
        <div className="header-actions">
          <div style={{ display: "flex", alignItems: "center", marginRight: "1rem" }}>
            <DarkModeToggle />
          </div>
          <Link to="/reports" className="btn-nav">
            📊 Reports & Analytics
          </Link>
          {auth.currentUser ? (
            <Link to="/dashboard" className="btn-nav primary">
              🖥️ Admin Dashboard
            </Link>
          ) : (
            <Link to="/" className="btn-nav primary">
              🔑 Portal Login
            </Link>
          )}
        </div>
      </header>

      {/* Filters Section */}
      <section className="filters-bar">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Directory</label>
            <input
              type="text"
              placeholder="Search by name, province, city..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Classification</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              {uniqueValues.types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Region / Province</label>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Provinces</option>
              {uniqueValues.provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Preservation Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              {uniqueValues.statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchText || typeFilter || provinceFilter || statusFilter) && (
          <div style={{ textAlign: "right", marginTop: "1rem" }}>
            <button onClick={resetFilters} className="btn-reset">
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Cards Display Grid */}
      <main className="cards-grid">
        {filteredRecords.length === 0 ? (
          <div className="empty-listing">
            <span>🔍</span>
            <h3>No Records Found</h3>
            <p>We couldn't find any heritage items matching your filters. Try resetting your search parameters.</p>
          </div>
        ) : (
          filteredRecords.map((item) => {
            const itemTypeClass = `type-${item.type ? item.type.toLowerCase() : "tangible"}`;
            const itemStatusClass = `status-${item.preservationStatus ? item.preservationStatus.toLowerCase().replace(/\s+/g, "-") : "good"}`;

            return (
              <article className="heritage-card" key={item.id}>
                <div className="card-image-wrapper">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="card-image" />
                  ) : (
                    <div className="card-image-placeholder">
                      🏛️
                      <span>{item.type || "Heritage"}</span>
                    </div>
                  )}
                </div>

                <div className="card-content">
                  <div className="location-tag">
                    📍 {item.municipality}, {item.province}
                  </div>
                  <h3>{item.name}</h3>

                  <div className="card-badges">
                    <span className={`badge-tag ${itemTypeClass}`}>{item.type}</span>
                    <span className={`badge-tag ${itemStatusClass}`}>{item.preservationStatus}</span>
                  </div>

                  <p className="card-description">{item.description}</p>

                  <button className="btn-card" onClick={() => setSelectedItem(item)}>
                    View Details →
                  </button>
                </div>
              </article>
            );
          })
        )}
      </main>

      {/* Details Overlay Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
              ✕
            </button>

            {/* Modal Image Header */}
            <div className="modal-hero-image">
              {selectedItem.imageUrl ? (
                <img src={selectedItem.imageUrl} alt={selectedItem.name} />
              ) : (
                <div className="modal-hero-placeholder">🏛️</div>
              )}
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="modal-header-info">
                <h2>{selectedItem.name}</h2>
                <div className="card-badges">
                  <span className={`badge-tag type-${selectedItem.type?.toLowerCase()}`}>
                    {selectedItem.type}
                  </span>
                  <span className={`badge-tag status-${selectedItem.preservationStatus?.toLowerCase().replace(/\s+/g, "-")}`}>
                    {selectedItem.preservationStatus}
                  </span>
                  <span className="badge-tag" style={{ background: "#F8F5F0", color: "#7a6b57" }}>
                    📍 {selectedItem.municipality}, {selectedItem.province}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="modal-section">
                <h4>Description</h4>
                <p>{selectedItem.description}</p>
              </div>

              {/* Cultural Significance */}
              <div className="modal-section">
                <h4>Cultural Significance</h4>
                <p>{selectedItem.culturalSignificance}</p>
              </div>

              {/* Coordinates */}
              <div className="modal-section">
                <h4>Geographic Location</h4>
                <div className="coords-grid">
                  <div className="coord-item">
                    <strong>Latitude:</strong> {selectedItem.latitude || "Not specified"}
                  </div>
                  <div className="coord-item">
                    <strong>Longitude:</strong> {selectedItem.longitude || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Relational Information: Custodian */}
              {selectedCustodian && (
                <div className="relational-box">
                  <h4>🛡️ Preservation Custodian</h4>
                  <div className="custodian-detail">
                    <span className="custodian-name">{selectedCustodian.name}</span>
                    <p style={{ fontSize: "0.9rem", color: "#5A4A40", margin: "0.2rem 0 0.8rem 0" }}>
                      {selectedCustodian.description || "Custodian organization dedicated to local preservation."}
                    </p>
                    <div className="custodian-meta">
                      <span><strong>Classification:</strong> {selectedCustodian.type}</span>
                      {selectedCustodian.contactEmail && <span><strong>Email:</strong> {selectedCustodian.contactEmail}</span>}
                      {selectedCustodian.contactPhone && <span><strong>Contact #:</strong> {selectedCustodian.contactPhone}</span>}
                      {selectedCustodian.address && <span><strong>Office Address:</strong> {selectedCustodian.address}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Relational Information: Festivals */}
              {selectedFestivals.length > 0 && (
                <div className="relational-box">
                  <h4>🎉 Linked Festivals & Cultural Events</h4>
                  <div className="festivals-list">
                    {selectedFestivals.map((fest) => (
                      <div className="festival-item" key={fest.id}>
                        <div className="festival-name">{fest.name}</div>
                        <div className="festival-date-loc">
                          📅 {fest.date} | 📍 {fest.location} ({fest.type})
                        </div>
                        {fest.description && (
                          <p style={{ fontSize: "0.85rem", color: "#7a6b57", marginTop: "0.25rem" }}>
                            {fest.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relational Information: Related Items */}
              {selectedRelated.length > 0 && (
                <div className="relational-box">
                  <h4>🔗 Related Heritage Items</h4>
                  <div className="related-items-list">
                    {selectedRelated.map((hItem) => (
                      <span className="related-item-badge" key={hItem.id}>
                        🏛️ {hItem.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
