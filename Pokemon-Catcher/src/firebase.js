import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuoiLxg3nTh2L-GTzHeFBgC-U2kOUypLY",
  authDomain: "pokemoncatcherapp.firebaseapp.com",
  projectId: "pokemoncatcherapp",
  storageBucket: "pokemoncatcherapp.appspot.com",  
  messagingSenderId: "107713387908",
  appId: "1:107713387908:web:f95b7ccf5c74840678d1d1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
