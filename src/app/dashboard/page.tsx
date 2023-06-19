"use client";

import "firebase/firestore";
import "firebase/auth";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { useRouter } from "next/navigation";
import { initFirebase } from "../../../firebase/firebaseApp";
import { doc, setDoc } from "firebase/firestore";

import { AppUser, UserRecipeUpload } from "@/types";

import { RecipeCard } from "@/components/RecipeCard";
import { useState } from "react";

const app = initFirebase();
const auth = getAuth(app);

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
      {<MyRecipesList uid={user.uid} displayName={user.displayName} />}
      {<AddNewRecipe uid={user.uid} />}
      <button onClick={() => auth.signOut()}>Sign out</button>
    </main>
  );
};

function MyRecipesList({ uid, displayName }: AppUser) {
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
  currentUser = user;

  // Show nothing if user has no recipes / data in the database;
  if (user == undefined) {
    return <></>;
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

//  const fetcthCurrentUserRecipes = async () => {
//     const docRef = doc(getFirestore(app), "users", user.uid);
//     const docSnap = await getDoc(docRef);
//       setRecipes(docSnap.data());
//   };

// const [asigneeImageUrl, setAsigneeImageURL] = useState("");
// useEffect(() => {
//   const fetchAssigneeImage = async (uid: string) => {
//     const docRef = doc(getFirestore(app), "users", uid);
//     const docSnap = await getDoc(docRef);
//     setAsigneeImageURL(setdocSnap.data().photoURL);
//   };
// }, []);

// // Fetch Recipes Specific to Signed In User
// useEffect(() => {
//   const fetchPersonalRecipes = async () => {
//     if (user) {
//       const docRef = doc(getFirestore(app), "users", user!.uid);
//       const docSnap = await getDoc(docRef);
//       setPersonalRecipes(docSnap.data()!.recipes);
//     }
//   };
//   fetchPersonalRecipes();
// }, []);
