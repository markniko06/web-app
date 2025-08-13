// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import{getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"
import{getFirestore,setDoc, doc} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.firebasestorage.app",
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId){
  var messageDiv=document.getElementById(divId);
  messageDiv.style.display="block";
  messageDiv.innerHTML=message;
  messageDiv.style.opacity=1;
  setTimeout(function(){
      messageDiv.style.opacity=0;
  },5000);
}
const signUp=document.getElementById('submitSignIn');
signUp.addEventListener('click', (event)=>{
  event.preventDefault();
  const fName = document.getElementById("fName").value.trim();
  const lName = document.getElementById("lName").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const studentID = document.getElementById("studentID").value.trim();
  const address = document.getElementById("address").value.trim();
  const email = document.getElementById("pEmail").value.trim();
  const password = document.getElementById("rPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  const auth=getAuth();
  const db=getFirestore();

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential)=>{
      const user=userCredential.user;
      const userData={
          email: email,
          firstName: firstName,
          lastName:lastName
      };
      showMessage('Account Created Successfully', 'signUpMessage');
      const docRef=doc(db, "users", user.uid);
      setDoc(docRef,userData)
      .then(()=>{
          window.location.href='./index.html';
      })
      .catch((error)=>{
          console.error("error writing document", error);

      });
  })
  .catch((error)=>{
      const errorCode=error.code;
      if(errorCode=='auth/email-already-in-use'){
          showMessage('Email Address Already Exists !!!', 'signUpMessage');
      }
      else{
          showMessage('unable to create User', 'signUpMessage');
      }
  })
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const auth = getAuth();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    localStorage.setItem('loggedInUserId', uid);
    showMessage('Login is successful', 'signInMessage');

    // ✅ Check role in Realtime Database
    const { getDatabase, ref, get } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js");
    const db = getDatabase();
    const snapshot = await get(ref(db, "students/" + uid));

    if (snapshot.exists()) {
      const userData = snapshot.val();
      const role = userData.role;

      // 🔁 Redirect based on role
      if (role === "admin") {
        window.location.href = "../admin/admin.html";
      } else if (role === "guard") {
        window.location.href = "../guard page/guard.html";
      } else {
        window.location.href = "../home page/homepage.html";
      }

    } else {
      // No user data found
      window.location.href = "../home page/homepage.html";
    }

  } catch (error) {
    const errorCode = error.code;
    if (errorCode === 'auth/invalid-credential') {
      showMessage('Incorrect Email or Password', 'signInMessage');
    } else {
      showMessage('Account does not Exist', 'signInMessage');
    }
    console.error(error);
  }
});