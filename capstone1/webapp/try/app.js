// ✅ Import from Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.appspot.com", // ✅ must end with .appspot.com
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa"
};

// ✅ Initialize Firebase and Storage
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 🔗 DOM Elements
const uploadInput = document.getElementById("uploadInput");
const preview = document.getElementById("preview");
const saveBtn = document.getElementById("saveBtn");
const downloadLink = document.getElementById("downloadLink");

let selectedFile = null;

// 🖼️ Preview the image
uploadInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  if (!selectedFile) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    preview.src = event.target.result;
  };
  reader.readAsDataURL(selectedFile);
});

// ⬆ Upload image to Firebase Storage
saveBtn.addEventListener("click", () => {
  if (!selectedFile) {
    alert("Please select an image.");
    return;
  }

  const filename = `UserImage/${Date.now()}-${selectedFile.name}`;
  const imageRef = ref(storage, filename);

  uploadBytes(imageRef, selectedFile)
    .then(snapshot => getDownloadURL(snapshot.ref))
    .then(url => {
      alert("Upload successful!");
      downloadLink.innerHTML = `<strong>Download URL:</strong><br><a href="${url}" target="_blank">${url}</a>`;
    })
    .catch(error => {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console.");
    });
});
