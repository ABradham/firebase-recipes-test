import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { initFirebase, db } from "../../firebase/firebaseApp";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { collection } from "firebase/firestore";
import { PalmAIRequest, UserSearchProfile } from "@/types";

const app: FirebaseApp = initFirebase();
const auth: Auth = getAuth(app);

const sendDishToFirebase = async (dishName: string) => {
  const userProfile: UserSearchProfile = {
    uid: auth.currentUser!.uid,
    photoURL: auth.currentUser!.photoURL!,
    displayName: auth.currentUser!.displayName!,
  };
  const generateCollectionRef = collection(db, "generateRecipes");

  const newDishObj: PalmAIRequest = {
    dish: dishName,
    user: userProfile,
  };
};

export default function CreateWithAI() {
  const [dishName, setDishName] = useState("");

  return (
    <Box>
      <Typography>Create with AI</Typography>
      <TextField
        label="Recipe Name"
        variant="outlined"
        onChange={(e) => setDishName(e.target.value)}
      />
      <Button
        onClick={() => {
          sendDishToFirebase(dishName);
          setDishName("");
        }}
      >
        Create Recipe With AI
      </Button>
    </Box>
  );
}
