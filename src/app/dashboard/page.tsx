"use client";

import { NextPage } from "next";
import "firebase/firestore";
import "firebase/auth";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useRouter } from "next/navigation";
import { initFirebase } from "../../../firebase/firebaseApp";

const Dashboard: NextPage = () => {
  const app = initFirebase();
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);

  const recipesRef = collection(getFirestore(app), "all_recipes");
  const q = query(recipesRef, orderBy("name"), limit(3));

  const [recipes] = useCollectionData(q);

  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push("/");
    return <div>Please Sign in!</div>;
  }

  console.log(recipes);
  return (
    <main>
      <h1>Hello from Second Page</h1>
      <button onClick={() => auth.signOut()}>Sign out</button>
      <div>
        {recipes?.map((recipe, i) => (
          <p key={i}>{recipe["name"]}</p>
        ))}
      </div>
    </main>
  );
};

export default Dashboard;
