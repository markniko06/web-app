import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.appspot.com",
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa",
  databaseURL: "https://login-b3b32-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Sections and Buttons
const dashboardSection = document.getElementById("dashboardSection");
const listUserSection = document.getElementById("listUserSection");
const historySection = document.getElementById("historySection");
const settingsSection = document.getElementById("settingsSection");

const dashboardBtn = document.getElementById("dashboardBtn");
const listUsersBtn = document.getElementById("listUsersBtn");
const historyBtn = document.getElementById("historyBtn");
const settingsBtn = document.getElementById("settingsBtn");

function hideAllSections() {
  dashboardSection.style.display = "none";
  listUserSection.style.display = "none";
  historySection.style.display = "none";
  settingsSection.style.display = "none";
}

function setActive(btn) {
  document.querySelectorAll(".side-menu.top li").forEach(li => li.classList.remove("active"));
  btn.parentElement.classList.add("active");
}

dashboardBtn.addEventListener("click", () => {
  hideAllSections();
  dashboardSection.style.display = "block";
  setActive(dashboardBtn);
});

listUsersBtn.addEventListener("click", () => {
  hideAllSections();
  listUserSection.style.display = "block";
  setActive(listUsersBtn);
  loadUsers();
});

historyBtn.addEventListener("click", () => {
  hideAllSections();
  historySection.style.display = "block";
  setActive(historyBtn);
  loadLogs();
});

settingsBtn.addEventListener("click", () => {
  hideAllSections();
  settingsSection.style.display = "block";
  setActive(settingsBtn);
});

document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "../login page/index.html");
});

// User List Logic
let usersData = [];
let filteredUsers = [];
let currentPage = 1;
const rowsPerPage = 5;

const userTableBody = document.querySelector("#userTable tbody");

async function loadUsers() {
  const snap = await get(ref(db, "students"));
  usersData = snap.exists() ? Object.entries(snap.val()) : [];
  filteredUsers = [...usersData];
  currentPage = 1;
  renderUserTable();
  renderPagination();
}

function renderUserTable() {
  const start = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(start, start + rowsPerPage);
  userTableBody.innerHTML = "";

  for (const [uid, user] of paginatedUsers) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.fullName || "-"}</td>
      <td>${user.studentID || "-"}</td>
      <td>${user.course || "-"}</td>
      <td>${user.yearSection || "-"}</td>
      <td>
        <button onclick="editUser('${uid}')">Edit</button>
        <button onclick="deleteUser('${uid}')">Delete</button>
      </td>
    `;
    userTableBody.appendChild(row);
  }
}

function renderPagination() {
  const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderUserTable();
      renderPagination();
    });
    container.appendChild(btn);
  }
}

window.editUser = async (uid) => {
  const snap = await get(ref(db, `students/${uid}`));
  if (!snap.exists()) return alert("User not found");

  const user = snap.val();
  const newName = prompt("Edit full name:", user.fullName || "");
  if (newName !== null) {
    await update(ref(db, `students/${uid}`), { fullName: newName });
    alert("User updated");
    loadUsers();
  }
};

window.deleteUser = async (uid) => {
  if (confirm("Are you sure you want to delete this user?")) {
    await remove(ref(db, `students/${uid}`));
    alert("User deleted");
    loadUsers();
  }
};

// User Search
document.getElementById("userSearchInput").addEventListener("input", () => {
  const query = document.getElementById("userSearchInput").value.toLowerCase();
  filteredUsers = usersData.filter(([_, user]) =>
    (user.fullName || "").toLowerCase().includes(query) ||
    (user.studentID || "").toLowerCase().includes(query)
  );
  currentPage = 1;
  renderUserTable();
  renderPagination();
});

// Download CSV
document.getElementById("downloadUserCSV").addEventListener("click", () => {
  const rows = [["Full Name", "ID", "Course", "Year/Section"]];
  document.querySelectorAll("#userTable tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    rows.push(Array.from(cells).slice(0, 4).map(cell => cell.textContent.trim()));
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "users.csv";
  link.click();
});

// Logs
async function loadLogs() {
  const logsRef = ref(db, "logs");
  const studentsRef = ref(db, "students");
  const logsTableBody = document.querySelector("#logsTable tbody");
  logsTableBody.innerHTML = "";

  const [logsSnap, studentsSnap] = await Promise.all([get(logsRef), get(studentsRef)]);
  const logs = logsSnap.exists() ? logsSnap.val() : {};
  const students = studentsSnap.exists() ? studentsSnap.val() : {};

  for (const uid in logs) {
    const name = students?.[uid]?.fullName || "Unknown";
    for (const date in logs[uid]) {
      const entries = Object.values(logs[uid][date]);
      const timeIn = entries.find(e => e.action === "time_in")?.time || "-";
      const timeOut = [...entries].reverse().find(e => e.action === "time_out")?.time || "-";
      const row = document.createElement("tr");
      row.innerHTML = `<td>${name}</td><td>${date}</td><td>${timeIn}</td><td>${timeOut}</td>`;
      logsTableBody.appendChild(row);
    }
  }
}

// Logs Search
document.getElementById("searchInput").addEventListener("input", () => {
  const value = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll("#logsTable tbody tr").forEach(row => {
    const name = row.children[0].textContent.toLowerCase();
    const date = row.children[1].textContent.toLowerCase();
    row.style.display = name.includes(value) || date.includes(value) ? "" : "none";
  });
});

// Download Logs CSV
document.getElementById("downloadLogCSV").addEventListener("click", () => {
  const rows = Array.from(document.querySelectorAll("#logsTable tr")).map(row =>
    Array.from(row.children).map(cell => `"${cell.textContent.trim()}"`).join(",")
  );
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "scan_logs.csv";
  link.click();
});

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = "../login page/index.html";
  const snap = await get(ref(db, "students/" + user.uid));
  const data = snap.val();
  if (!data || data.role !== "admin") {
    alert("Access denied. Admins only.");
    location.href = "../login page/index.html";
  }
});
