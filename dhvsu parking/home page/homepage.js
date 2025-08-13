import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.appspot.com",
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa",
  databaseURL: "https://login-b3b32-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// DOM References
const userName = document.getElementById("userName");
const studentID = document.getElementById("studentID");
const studentCourse = document.getElementById("studentCourse");
const studentYearSection = document.getElementById("studentYearSection");
const profilePic = document.getElementById("profilePic");
const plate = document.getElementById("plate");
const color = document.getElementById("color");
const model = document.getElementById("model");
const type = document.getElementById("type");
const saveBtn = document.getElementById("saveBtn");

let currentUserUID = null;
let selectedImageFile = null;

// Disable vehicle info fields initially
function disableFields() {
  plate.disabled = true;
  color.disabled = true;
  model.disabled = true;
  type.disabled = true;
  saveBtn.disabled = true;
}

// Enable editing
window.enableEdit = () => {
  plate.disabled = false;
  color.disabled = false;
  model.disabled = false;
  type.disabled = false;
  saveBtn.disabled = false;
};

// Load User Info
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login page/index.html";
    return;
  }

  currentUserUID = user.uid;
  const userRef = ref(db, "students/" + currentUserUID);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) return;
  const data = snapshot.val();

  // Populate data
  userName.innerText = data.fullName || "No Name";
  studentID.innerText = data.studentID || "N/A";
  studentCourse.innerText = `Course: ${data.course || "N/A"}`;
  studentYearSection.innerText = `Year/Section: ${data.yearSection || "N/A"}`;
  plate.value = data.plate || "";
  color.value = data.color || "";
  model.value = data.model || "";
  type.value = data.type || "";
  if (data.profileImageURL) {
    profilePic.src = data.profileImageURL;
  }

  disableFields();
});

// Upload profile preview
document.getElementById("uploadProfile")?.addEventListener("change", (e) => {
  selectedImageFile = e.target.files[0];
  if (!selectedImageFile) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    profilePic.src = event.target.result;
  };
  reader.readAsDataURL(selectedImageFile);
});

// Save Profile Info
window.saveProfile = () => {
  if (!currentUserUID) return;

  const updates = {
    plate: plate.value,
    color: color.value,
    model: model.value,
    type: type.value,
    studentID: studentID.innerText,
    course: studentCourse.innerText.replace("Course: ", ""),
    yearSection: studentYearSection.innerText.replace("Year/Section: ", ""),
    fullName: userName.innerText
  };

  const userRef = ref(db, "students/" + currentUserUID);

  if (selectedImageFile) {
    const imageRef = storageRef(storage, "UserImage/" + currentUserUID + ".jpg");

    uploadBytes(imageRef, selectedImageFile)
      .then(() => getDownloadURL(imageRef))
      .then((url) => {
        updates.profileImageURL = url;
        return update(userRef, updates);
      })
      .then(() => {
        alert("Profile info and image updated successfully.");
        disableFields();
        selectedImageFile = null;
      })
      .catch((err) => {
        console.error(err);
        alert("Image upload failed.");
      });
  } else {
    update(userRef, updates)
      .then(() => {
        alert("Profile updated.");
        disableFields();
      })
      .catch((err) => {
        console.error(err);
        alert("Error updating profile.");
      });
  }
};

// Logout
document.getElementById("logout")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("loggedInUserId");
  signOut(auth).then(() => {
    window.location.href = "../login page/index.html";
  });
});
