"use client";

import Image from "next/image";
import { NextPage } from "next";
import styles from "./page.module.css";
import { initFirebase } from "../../firebase/firebaseApp";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const Home: NextPage = () => {
  // Instance of firebase app and auth provider
  const app = initFirebase();
  const provider = new GoogleAuthProvider();

  // Instance of firebase Auth client
  const auth = getAuth();

  const signIn = async () => {
    const result = await signInWithPopup(auth, provider);
    console.log(result.user);
  };

  return (
    <main className={styles.main}>
      <button onClick={signIn}>Sign in!</button>
    </main>
  );
};

export default Home;
