import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import QRious from "https://cdn.skypack.dev/qrious";

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
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

function showMessage(message, divId, isSuccess = false) {
  const div = document.getElementById(divId);
  if (!div) return;
  div.innerText = message;
  div.style.display = 'block';
  div.style.backgroundColor = isSuccess ? 'green' : 'red';
  div.style.color = 'white';
  div.style.padding = '10px';
  div.style.marginBottom = '10px';
  div.style.borderRadius = '5px';
  setTimeout(() => div.style.display = 'none', 5000);
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("index.html")) {
    document.getElementById("submitSignUp").addEventListener("click", (e) => {
      e.preventDefault();
      const fName = document.getElementById("fName").value.trim();
      const lName = document.getElementById("lName").value.trim();
      const contact = document.getElementById("contact").value.trim();
      const address = document.getElementById("address").value.trim();
      const email = document.getElementById("pEmail").value.trim();
      const password = document.getElementById("rPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!fName || !lName || !contact || !address || !email || !password || !confirmPassword) {
        showMessage("Please fill out all required fields.", "signUpMessage");
        return;
      }
      if (password !== confirmPassword) {
        showMessage("Passwords do not match!", "signUpMessage");
        return;
      }

      localStorage.setItem("fName", fName);
      localStorage.setItem("lName", lName);
      localStorage.setItem("contact", contact);
      localStorage.setItem("address", address);
      localStorage.setItem("pEmail", email);
      localStorage.setItem("rPassword", password);
      window.location.href = "index2.html";
    });
  }

  if (window.location.pathname.includes("index2.html")) {
    const form = document.getElementById("studentVehicleForm");
    form.addEventListener("submit", async (e) => {
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

      if (!email || !password) {
        showMessage("Session expired. Please restart the registration.", "signUpMessage");
        return;
      }

      if (!studentID || !course || !yearSection || !plate || !color || !model || !type) {
        showMessage("Please fill all required fields.", "signUpMessage");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const fullName = `${fName} ${lName}`;
        const userPath = `students/${user.uid}`;

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

        await set(ref(rtdb, userPath), {
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
          profileImageURL: "",
          vehicleImageURL: ""
        });

        // ✅ Generate and Upload QR Code
        const qr = new QRious({
          value: `${fullName}\n${studentID}`,
          size: 250
        });

        const qrDataURL = qr.toDataURL();
        const qrRef = storageRef(storage, `QRCode/${user.uid}.png`);
        await uploadString(qrRef, qrDataURL, 'data_url');
        const qrURL = await getDownloadURL(qrRef);

        await update(ref(rtdb, userPath), {
          qrCodeURL: qrURL
        });

        localStorage.setItem("qrURL", qrURL);
        showMessage("You have successfully registered!", "signUpMessage", true);

        setTimeout(() => {
          localStorage.clear();
          window.location.href = "../registration/qr.html";
        }, 3000);

      } catch (error) {
        console.error("❌ Registration error:", error);
        showMessage("Error: " + error.message, "signUpMessage");
      }
    });
  }

  if (window.location.pathname.includes("qr.html")) {
    const qrImg = document.getElementById("qrPreview");
    const url = localStorage.getItem("qrURL");
    if (qrImg && url) qrImg.src = url;
  }
});
