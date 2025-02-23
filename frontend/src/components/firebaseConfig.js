import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, where, onSnapshot, updateDoc, doc, deleteDoc, getDocs, getDoc  } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjZ7_7kE6e-ZtjVXZSK6vmryqLD9TT090",
  authDomain: "chat-c447a.firebaseapp.com",
  projectId: "chat-c447a",
  storageBucket: "chat-c447a.appspot.com", 
  messagingSenderId: "298256417284",
  appId: "1:298256417284:web:f3fd997c585c94d7456b51",
  measurementId: "G-H4GFDFM7MT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc, getDocs, query, orderBy, where, onSnapshot, updateDoc, doc, deleteDoc, ref, uploadBytes, getDownloadURL, getDoc };
