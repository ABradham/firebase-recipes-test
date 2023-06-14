"use client";

import Image from "next/image";
import { NextPage } from "next";
import styles from "./page.module.css";
import { initFirebase } from "../../firebase/firebaseApp";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Home: NextPage = () => {
  // Instance of firebase app and auth provider
  const app = initFirebase();
  const provider = new GoogleAuthProvider();
  const router = useRouter();

  // Instance of firebase Auth client
  const auth = getAuth();

  // Get user state and act immediately when user's auth state changes
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading</div>;
  }

  // Reroute to dashboard page on signed in auth state
  if (user) {
    router.push("/dashboard");
    return <div>Loading...</div>;
  }

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
