import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import QrScanner from "https://unpkg.com/qr-scanner@1.4.2/qr-scanner.min.js";

// Firebase Config
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

// Sections
const dashboardSection = document.getElementById("dashboardSection");
const listUserSection = document.getElementById("listUserSection");
const settingsSection = document.getElementById("settingsSection");
const scannerSection = document.getElementById("scannerSection");

// Buttons
const dashboardBtn = document.getElementById("dashboardBtn");
const listUsersBtn = document.getElementById("listUsersBtn");
const settingsBtn = document.getElementById("settingsBtn");
const scannerBtn = document.getElementById("scannerBtn");

// Navigation
function showSection(section) {
  const sections = [dashboardSection, listUserSection, settingsSection, scannerSection];
  sections.forEach(s => s.style.display = "none");
  section.style.display = "block";
}

function setActiveTab(btn) {
  document.querySelectorAll(".side-menu.top li").forEach(li => li.classList.remove("active"));
  btn.parentElement.classList.add("active");
}

dashboardBtn?.addEventListener("click", e => { e.preventDefault(); showSection(dashboardSection); setActiveTab(dashboardBtn); });
listUsersBtn?.addEventListener("click", async e => {
  e.preventDefault();
  showSection(listUserSection);
  setActiveTab(listUsersBtn);
  await populateUserTable();
});
settingsBtn?.addEventListener("click", e => { e.preventDefault(); showSection(settingsSection); setActiveTab(settingsBtn); });
scannerBtn?.addEventListener("click", e => {
  e.preventDefault();
  showSection(scannerSection);
  setActiveTab(scannerBtn);
  startScanner();
});

// QR Scanner
let qrScanner;
function startScanner() {
  const video = document.getElementById("preview");
  if (qrScanner) qrScanner.stop(); // stop previous
  qrScanner = new QrScanner(video, result => {
    alert("Scanned: " + result);
    qrScanner.stop();
  });
  qrScanner.start();
}

// Populate user table
async function populateUserTable() {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";
  const snapshot = await get(ref(db, "students"));
  if (!snapshot.exists()) return;
  const users = snapshot.val();
  Object.entries(users).forEach(([uid, user]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.fullName || "-"}</td>
      <td>${user.studentID || "-"}</td>
      <td>${user.course || "-"}</td>
      <td>${user.yearSection || "-"}</td>
      <td><button onclick="deleteUser('${uid}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Delete user
window.deleteUser = async function(uid) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  await remove(ref(db, "students/" + uid));
  alert("Deleted.");
  populateUserTable();
};

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "../login page/index.html";
  const snap = await get(ref(db, "students/" + user.uid));
  if (!snap.exists() || snap.val().role !== "admin") {
    alert("Access denied.");
    window.location.href = "../login page/index.html";
  }
});

// Logout
document.getElementById("logout")?.addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "../login page/index.html");
});
