import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const form = document.getElementById("heritageForm");
const tbody = document.getElementById("heritageList");
const itemCount = document.getElementById("itemCount");
const totalCountEl = document.getElementById("totalCount");
const tangibleCountEl = document.getElementById("tangibleCount");
const intangibleCountEl = document.getElementById("intangibleCount");
const recentCountEl = document.getElementById("recentCount");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const resetFormBtn = document.getElementById("resetForm");
const confirmModal = document.getElementById("confirmModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const toastEl = document.getElementById("toast");
const loadingEl = document.getElementById("loadingSpinner");

const heritageRef = collection(db, "heritage_items");

let records = [];
let pendingDeleteId = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.querySelector("#name").value.trim();
  const type = document.querySelector("#type").value.trim();
  const origin = document.querySelector("#origin").value.trim();
  const description = document.querySelector("#description").value.trim();

  try {
    await addDoc(heritageRef, { name, type, origin, description, createdAt: new Date() });
    showToast("Record added successfully.");
    form.reset();
    loadData();
  } catch (err) {
    showToast("Unable to add record.", true);
    console.error(err);
  }
});

resetFormBtn?.addEventListener("click", () => form.reset());

cancelDeleteBtn?.addEventListener("click", () => {
  pendingDeleteId = null;
  confirmModal.classList.add("hidden");
});

confirmDeleteBtn?.addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  try {
    await deleteData(pendingDeleteId);
    showToast("Record deleted.");
  } catch (err) {
    showToast("Failed to delete.", true);
    console.error(err);
  }
  pendingDeleteId = null;
  confirmModal.classList.add("hidden");
});

searchInput?.addEventListener("input", () => renderRows());
filterType?.addEventListener("change", () => renderRows());

async function loadData() {
  loadingEl?.classList.remove("hidden");
  tbody.innerHTML = "";
  try {
    const snapshot = await getDocs(heritageRef);
    records = [];
    snapshot.forEach((s) => records.push({ id: s.id, data: s.data() }));

    const total = records.length;
    itemCount.textContent = `${total} item${total !== 1 ? "s" : ""}`;
    totalCountEl && (totalCountEl.textContent = total);

    // counts
    const intangibleCount = records.filter(r => String(r.data.type || "").toLowerCase().includes("intangible")).length;
    const tangibleCount = total - intangibleCount;
    tangibleCountEl && (tangibleCountEl.textContent = tangibleCount);
    intangibleCountEl && (intangibleCountEl.textContent = intangibleCount);

    // recently added (by createdAt)
    const withTs = records.map(r => ({...r, ts: getTimestampValue(r.data.createdAt)}));
    withTs.sort((a,b) => b.ts - a.ts);
    const recent = withTs.slice(0,5);
    recentCountEl && (recentCountEl.textContent = recent.length);

    renderRows();
  } finally {
    loadingEl?.classList.add("hidden");
  }
}

function renderRows() {
  const q = searchInput?.value.trim().toLowerCase() || "";
  const filter = filterType?.value || "all";
  tbody.innerHTML = "";

  const filtered = records.filter(r => {
    const d = r.data;
    if (filter === "tangible" && String(d.type || "").toLowerCase().includes("intangible")) return false;
    if (filter === "intangible" && !String(d.type || "").toLowerCase().includes("intangible")) return false;
    if (!q) return true;
    return [d.name, d.type, d.origin, d.description].some(v => String(v || "").toLowerCase().includes(q));
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <span>🏛️</span>
            No matching heritage items.
          </div>
        </td>
      </tr>`;
    return;
  }

  filtered.forEach(r => {
    const d = r.data;
    const isIntangible = String(d.type || "").toLowerCase().includes("intangible");
    const badgeClass = isIntangible ? "badge intangible" : "badge";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escHtml(d.name)}</strong></td>
      <td><span class="${badgeClass}">${escHtml(d.type)}</span></td>
      <td>${escHtml(d.origin)}</td>
      <td class="col-desc">${escHtml(d.description || "—")}</td>
      <td><button class="del-btn">Delete</button></td>
    `;

    const delBtn = tr.querySelector(".del-btn");
    delBtn.addEventListener("click", () => {
      pendingDeleteId = r.id;
      confirmModal.classList.remove("hidden");
    });

    tbody.appendChild(tr);
  });
}

async function deleteData(id) {
  await deleteDoc(doc(db, "heritage_items", id));
  await loadData();
}

function showToast(message, isError = false) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.style.background = isError ? 'rgba(173,43,43,0.95)' : getComputedStyle(document.documentElement).getPropertyValue('--accent-2') || '#b3874a';
  toastEl.classList.remove('hidden');
  setTimeout(() => toastEl.classList.add('hidden'), 3000);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function getTimestampValue(createdAt) {
  if (!createdAt) return 0;
  if (createdAt.seconds) return createdAt.seconds * 1000;
  if (typeof createdAt?.toDate === 'function') return createdAt.toDate().getTime();
  if (createdAt instanceof Date) return createdAt.getTime();
  if (typeof createdAt === 'string') return new Date(createdAt).getTime();
  return 0;
}

loadData();