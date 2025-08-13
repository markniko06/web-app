// ✅ registration.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.appspot.com",
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa",
  databaseURL: "https://login-b3b32-default-rtdb.firebaseio.com"
};

// ✅ Firebase initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

// ✅ Utility function to show messages
function showMessage(message, divId, isSuccess = false) {
  const div = document.getElementById(divId);
  if (!div) return;
  div.innerText = message;
  div.style.display = 'block';
  div.style.backgroundColor = isSuccess ? 'green' : 'red';
  setTimeout(() => div.style.display = 'none', 5000);
}

// ✅ DOM Loaded
window.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("index2.html")) return;

  document.getElementById("submitSignUp").addEventListener("click", async (e) => {
    e.preventDefault();

    const fName = localStorage.getItem("fName");
    const lName = localStorage.getItem("lName");
    const contact = localStorage.getItem("contact");
    const address = localStorage.getItem("address");
    const email = localStorage.getItem("pEmail");
    const password = localStorage.getItem("rPassword");

    const studentID = document.getElementById("studentID").value.trim();
    const course = document.getElementById("course").value.trim();
    const yearSection = document.getElementById("yearSection").value.trim();
    const plate = document.getElementById("plate").value.trim();
    const color = document.getElementById("color").value.trim();
    const model = document.getElementById("model").value.trim();
    const type = document.getElementById("type").value.trim();
    const fileInput = document.getElementById("pop-up-file");

    if (!studentID || !course || !yearSection || !plate || !color || !model || !type) {
      showMessage("Please fill all required fields.", "signUpMessage");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const fullName = `${fName} ${lName}`;

      // ✅ Save basic info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: fName,
        lastName: lName,
        email,
        contact,
        address,
        studentID,
        course,
        yearSection,
        plate,
        color,
        model,
        type
      });

      // ✅ Generate QR Code
      const qrCanvas = document.createElement('canvas');
      const qr = new QRious({
        element: qrCanvas,
        value: user.uid, // ✅ use UID for uniqueness
        size: 200,
        background: 'white',
        foreground: '#333',
        level: 'M'
      });
      const qrCodeDataURL = qrCanvas.toDataURL();


      // ✅ Upload Profile Image (if provided)
      let profileImageURL = "";
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const filePath = `profileImages/${user.uid}/profile.jpg`; // ✅ fixed filename
        const imageRef = storageRef(storage, filePath);

        try {
          await uploadBytes(imageRef, file);
          profileImageURL = await getDownloadURL(imageRef);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          showMessage("Failed to upload image. Proceeding without image.", "signUpMessage");
        }
      }

      // ✅ Save to Realtime Database
      await set(ref(rtdb, "students/" + user.uid), {
        firstName: fName,
        lastName: lName,
        fullName,
        email,
        contact,
        address,
        studentID,
        course,
        yearSection,
        plate,
        color,
        model,
        type,
        profileImageURL,
        vehicleImageURL: "",
        qrCode: qrCodeDataURL
      });

      // ✅ Success
      localStorage.clear();
      showMessage("You have successfully registered!", "signUpMessage", true);
      setTimeout(() => {
        window.location.href = "../login page/index.html";
      }, 3000);

    } catch (error) {
      showMessage("Error: " + error.message, "signUpMessage");
      console.error(error);
    }
  });
});
