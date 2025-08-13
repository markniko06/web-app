import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import {getFirestore,doc,deleteDoc} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// Firebase config
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
const firestore = getFirestore(app);


// Section Elements
const dashboardSection = document.getElementById("dashboardSection");
const listUserSection = document.getElementById("listUserSection");
const settingsSection = document.getElementById("settingsSection");

// Nav Buttons
const dashboardBtn = document.getElementById("dashboardBtn");
const listUsersBtn = document.getElementById("listUsersBtn");
const settingsBtn = document.getElementById("settingsBtn");

// Navigation logic
function showSection(section) {
  dashboardSection.style.display = "none";
  listUserSection.style.display = "none";
  settingsSection.style.display = "none";
  section.style.display = "block";
}

function setActiveTab(activeBtn) {
  document.querySelectorAll(".side-menu.top li").forEach(li => li.classList.remove("active"));
  activeBtn.parentElement.classList.add("active");
}

// Event Listeners
dashboardBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(dashboardSection);
  setActiveTab(dashboardBtn);
});

listUsersBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  showSection(listUserSection);
  setActiveTab(listUsersBtn);
  await populateUserTable();
});

settingsBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(settingsSection);
  setActiveTab(settingsBtn);
});

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
      <td>
        <button onclick="deleteUser('${uid}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Delete user
window.deleteUser = async function(uid) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  try {
    await remove(ref(db, "students/" + uid));
    alert("User deleted successfully.");
    populateUserTable(); // Refresh after deletion
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete user.");
  }
};

// Auth Check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login page/index.html";
    return;
  }

  const userRef = ref(db, "students/" + user.uid);
  const userSnap = await get(userRef);
  const userData = userSnap.val();

  if (!userData || userData.role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "../login page/index.html";
  }
});

// Logout
document.getElementById("logout")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("loggedInUserId");
  signOut(auth).then(() => {
    window.location.href = "../login page/index.html";
  });
});
