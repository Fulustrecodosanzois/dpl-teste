
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore  } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA8IXeTor3yWYfVZ5qa92KKR40nulr2FAM",
    authDomain: "dplconstrucao-cfd1a.firebaseapp.com",
    projectId: "dplconstrucao-cfd1a",
    storageBucket: "dplconstrucao-cfd1a.appspot.com",
    messagingSenderId: "152997578042",
    appId: "1:152997578042:web:e4d03296e4eae04607fc03"
};

// const firebaseConfig = {
//     apiKey: "AIzaSyCJBIJIYIOmzi350402SaIwOd7-1ekAO_M",
//     authDomain: "dpl-login.firebaseapp.com",
//     projectId: "dpl-login",
//     storageBucket: "dpl-login.appspot.com",
//     messagingSenderId: "586330109963",
//     appId: "1:586330109963:web:6a88fbe86ff9f80a582f0e"
// };


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
console.log("conectado com sucesso")
