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

import { AppUser } from "@/types";

import { Button, Container, Typography } from "@mui/material";
import MUIDataTable from "@/components/Table";
import AddNewRecipe from "@/components/AddNewRecipe";

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
    <Container>
      {
        <MyRecipesList
          uid={user.uid}
          displayName={user.displayName}
          photoURL={user.photoURL!}
        />
      }
      <Button variant="outlined" onClick={() => auth.signOut()}>
        Sign out
      </Button>
    </Container>
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
      ownedRecipes: [],
    };
    setDoc(userFirestoreDocRef, createNewUser);
    return <>Creating new profile, hang tight!</>;
  }

  return (
    <div>
      <Typography variant="h1">{displayName}'s Recipes</Typography>
      {user.ownedRecipes &&
        user.ownedRecipes.map((recipeID) => {
          if (recipeID != "")
            return <MUIDataTable recipeID={recipeID} key={recipeID} />;
        })}
      <AddNewRecipe />
    </div>
  );
}

export default Dashboard;
