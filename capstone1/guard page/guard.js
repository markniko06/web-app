// ✅ Full guard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import QrScanner from "https://unpkg.com/qr-scanner@1.4.2/qr-scanner.min.js";

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

const dashboardSection = document.getElementById("dashboardSection");
const scannerSection = document.getElementById("scannerSection");
const settingsSection = document.getElementById("settingsSection");

const dashboardBtn = document.getElementById("dashboardBtn");
const scannerBtn = document.getElementById("scannerBtn");
const settingsBtn = document.getElementById("settingsBtn");

function showSection(section) {
  [dashboardSection, scannerSection, settingsSection].forEach(s => s.style.display = "none");
  section.style.display = "block";
}

function setActiveTab(btn) {
  document.querySelectorAll(".side-menu.top li").forEach(li => li.classList.remove("active"));
  btn.parentElement.classList.add("active");
}

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

let qrScanner;
function startScanner() {
  const video = document.getElementById("preview");
  if (qrScanner) qrScanner.stop();
  qrScanner = new QrScanner(video, async result => {
    qrScanner.stop();

    try {
      const uid = result.data || result;
      const snapshot = await get(ref(db, "students/" + uid));

      if (snapshot.exists()) {
        const data = snapshot.val();

        document.getElementById("popupProfile").src = data.profileImageURL || "../pictures/default-avatar-icon.png";
        document.getElementById("popupFullName").textContent = data.fullName || "N/A";
        document.getElementById("popupStudentID").textContent = data.studentID || "N/A";
        document.getElementById("popupPlate").textContent = data.plate || "N/A";
        document.getElementById("popupColor").textContent = data.color || "N/A";
        document.getElementById("popupModel").textContent = data.model || "N/A";
        document.getElementById("popupType").textContent = data.type || "N/A";

        document.getElementById("studentPopup").classList.remove("hidden");

        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const logsRef = ref(db, `logs/${uid}/${dateStr}`);

        const existing = await get(logsRef);
        let action = "time_in";
        if (existing.exists()) {
          const logEntries = Object.values(existing.val());
          if (logEntries.length > 0 && logEntries[logEntries.length - 1].action === "time_in") {
            action = "time_out";
          }
        }

        await push(logsRef, {
          action,
          time: timeStr,
          timestamp: now.getTime(),
          studentName: data.fullName || "Unknown"
        });
      } else {
        alert("Student not found.");
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
      alert("Error reading student data.");
    }
  });

  qrScanner.start();
}

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("studentPopup").classList.add("hidden");
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "../login page/index.html";

  const snap = await get(ref(db, "students/" + user.uid));
  const userData = snap.val();

  if (!userData || userData.role !== "guard") {
    alert("Access denied. Guards only.");
    window.location.href = "../login page/index.html";
  }
});

document.getElementById("logout")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    localStorage.removeItem("loggedInUserId");
    window.location.href = "../login page/index.html";
  });
});
