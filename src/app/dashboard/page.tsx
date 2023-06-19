"use client";

import "firebase/firestore";
import "firebase/auth";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initFirebase } from "../../../firebase/firebaseApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";

import { AppUser, UserRecipeUpload } from "@/types";

import { RecipeCard } from "@/components/RecipeCard";
import { useState } from "react";

const app = initFirebase();
const auth = getAuth(app);

// TODO: Fix this! This is terrible state management and shouldn't be how this is handled in the future
let currentUser = {} as AppUser;

const Dashboard = () => {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const router = useRouter();

  if (loadingAuth) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push("/");
    return <div>Please Sign in!</div>;
  }

  return (
    <main>
      {
        <MyRecipesList
          uid={user.uid}
          displayName={user.displayName}
          photoURL={user.photoURL!}
        />
      }
      {<AddNewRecipe uid={user.uid} />}
      <button onClick={() => auth.signOut()}>Sign out</button>
    </main>
  );
};

function MyRecipesList({ uid, displayName, photoURL }: AppUser) {
  const userFirestoreDocRef = doc(getFirestore(app), "users", uid);
  const [userData, loading, error] = useDocument(userFirestoreDocRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Error Loading User Data!</div>;
  }

  // Cast data from Firestore into AppUser type [makes typescript happy :)];
  const user = userData?.data() as AppUser;
  currentUser = user; // Page-level state variable!!!

  // Show nothing if user has no recipes / data in the database;
  // Also creates new user
  if (user == undefined) {
    const createNewUser: AppUser = {
      displayName: displayName,
      photoURL: photoURL,
      recipes: [],
      uid: uid,
    };
    setDoc(userFirestoreDocRef, createNewUser);
    return <>Creating new profile, hang tight!</>;
  }

  return (
    <>
      <h1>{displayName}'s Recipes</h1>
      <div>
        {user.recipes.map((recipe, i) => {
          return (
            <RecipeCard
              name={recipe.name}
              ingredients={recipe.ingredients}
              key={i}
            />
          );
        })}
      </div>
    </>
  );
}

function AddNewRecipe({ uid }: AppUser) {
  const [recipeName, setRecipeName] = useState("");

  const onAddRecipe = async () => {
    //TODO: Firebase stuff to create new user / update existing user;
    // Create reference to existing (or non-existant) document with current UID in "users" collection
    const currentUserRef = doc(getFirestore(app), "users", uid);

    // Create new data by uploading
    const newData: UserRecipeUpload = {
      displayName: currentUser.displayName,
      recipes: [
        ...currentUser.recipes,
        {
          name: recipeName,
          ingredients: [],
        },
      ],
      photoURL: currentUser.photoURL,
    };

    // Use `setDoc` since it creates new docs by default if there is no doc with given id
    await setDoc(currentUserRef, newData);
  };
  return (
    <div>
      <input
        placeholder="Recipe Name"
        onChange={(e) => {
          setRecipeName(e.target.value);
        }}
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          onAddRecipe();
          console.log("Clicked!");
        }}
      >
        Create Recipe
      </button>
    </div>
  );
}

export default Dashboard;
