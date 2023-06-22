import { AppUser, UserRecipeUpload } from "@/types";
import { Button, TextField } from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { getAuth } from "firebase/auth";
import { useState } from "react";

const app = initFirebase();

export default function AddNewRecipe() {
  const auth = getAuth(app);
  const currentUser = auth.currentUser!;

  const [recipeName, setRecipeName] = useState("");

  const onAddRecipe = async () => {
    // Create new data by uploading new recipe to firestore `recipes` collection
    const newData: UserRecipeUpload = {
      collaborators: [
        {
          uid: currentUser.uid,
          photoURL: currentUser.photoURL!,
          displayName: currentUser.displayName!,
        },
      ],
      ingredients: [],
      name: recipeName,
    };

    const recipeID = recipeName;
    await setDoc(doc(getFirestore(app), "recipes", recipeID), newData);

    // Add recipe id to user's list of recipes
    // Get current user from firestore
    const userDocRef = doc(getFirestore(app), "users", currentUser.uid);
    let userInFirestore: AppUser = (await getDoc(userDocRef)).data() as AppUser;
    userInFirestore!.ownedRecipes!.push(recipeID);

    // Send updated user object back to firestore
    await setDoc(userDocRef, userInFirestore);
    setRecipeName("");
  };
  return (
    <div>
      <TextField
        label="Recipe Name"
        variant="outlined"
        onChange={(e) => {
          setRecipeName(e.target.value);
        }}
        value={recipeName}
      />
      <Button
        variant="contained"
        style={{}}
        onClick={(e) => {
          e.preventDefault();
          onAddRecipe();
        }}
      >
        Create Recipe
      </Button>
    </div>
  );
}
