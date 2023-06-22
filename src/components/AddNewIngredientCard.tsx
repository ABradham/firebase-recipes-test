import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { Ingredient, RecipeData } from "@/types";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import TextField from "@mui/material/TextField";
import { Button, Typography } from "@mui/material";

const app = initFirebase();
const auth = getAuth(app);

const addNewIngredientToRecipe = async (
  recipeID: string,
  ingredientName: string,
  ingredientAsignee: string,
  ingredientType: string
) => {
  // Get Current recipe info from firebase
  const ref = doc(getFirestore(app), "recipes", recipeID);
  const fromFirebase = await getDoc(ref);
  let recipeDataFromFirebase: RecipeData = fromFirebase.data() as RecipeData;

  // Create new ingredient from params and add to previous list
  const newIngredient: Ingredient = {
    name: ingredientName,
    type: ingredientType,
    asignee: ingredientAsignee,
    retrieved: false,
  };
  recipeDataFromFirebase.ingredients.push(newIngredient);

  // Send modified doc back to firebase
  setDoc(ref, recipeDataFromFirebase);
};

//@ts-ignore
export default function AddNewIngredient({ recipeID }) {
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientAsignee, setNewIngredientAsignee] = useState("");
  const [newIngredientType, setNewIngredientType] = useState("");

  return (
    <div>
      <Typography variant="h4">Add New Ingredient</Typography>
      <TextField
        label="Ingredient Name"
        variant="outlined"
        onChange={(e) => setNewIngredientName(e.target.value)}
      />
      <TextField
        label="Asignee"
        variant="outlined"
        onChange={(e) => setNewIngredientAsignee(e.target.value)}
      />
      <TextField
        label="Type"
        variant="outlined"
        onChange={(e) => setNewIngredientType(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={() => {
          addNewIngredientToRecipe(
            //@ts-ignore
            recipeID,
            newIngredientName,
            newIngredientAsignee,
            newIngredientType
          );
        }}
      >
        Add New Ingredient
      </Button>
    </div>
  );
}
