import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
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

// Section elements
const dashboardSection = document.getElementById("dashboardSection");
const scannerSection = document.getElementById("scannerSection");
const settingsSection = document.getElementById("settingsSection");

// Buttons
const dashboardBtn = document.getElementById("dashboardBtn");
const scannerBtn = document.getElementById("scannerBtn");
const settingsBtn = document.getElementById("settingsBtn");

// Show/hide sections
function showSection(section) {
  [dashboardSection, scannerSection, settingsSection].forEach(s => s.style.display = "none");
  section.style.display = "block";
}

function setActiveTab(btn) {
  document.querySelectorAll(".side-menu.top li").forEach(li => li.classList.remove("active"));
  btn.parentElement.classList.add("active");
}

// Navigation events
dashboardBtn?.addEventListener("click", e => {
  e.preventDefault();
  showSection(dashboardSection);
  setActiveTab(dashboardBtn);
});

scannerBtn?.addEventListener("click", e => {
  e.preventDefault();
  showSection(scannerSection);
  setActiveTab(scannerBtn);
  startScanner();
});

settingsBtn?.addEventListener("click", e => {
  e.preventDefault();
  showSection(settingsSection);
  setActiveTab(settingsBtn);
});

// QR Scanner Logic
let qrScanner;
function startScanner() {
  const video = document.getElementById("preview");
  if (qrScanner) qrScanner.stop();
  qrScanner = new QrScanner(video, result => {
    alert("Scanned: " + result);
    qrScanner.stop();
  });
  qrScanner.start();
}

// Auth check (guard only)
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "../login page/index.html";

  const snap = await get(ref(db, "students/" + user.uid));
  const userData = snap.val();

  if (!userData || userData.role !== "guard") {
    alert("Access denied. Guards only.");
    window.location.href = "../login page/index.html";
  }
});

// Logout
document.getElementById("logout")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    localStorage.removeItem("loggedInUserId");
    window.location.href = "../login page/index.html";
  });
});
