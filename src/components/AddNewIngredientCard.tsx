import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { Recipe, Ingredient, UserSearchProfile, AppUser } from "@/types";
import { useState } from "react";
import { User } from "@/types";
import { getAuth } from "firebase/auth";

const app = initFirebase();
const auth = getAuth(app);

const addNewIngredientToRecipe = async (
  uid: string,
  recipeName: string,
  ingredientName: string,
  ingredientAsignee: string
) => {
  const ref = doc(getFirestore(app), "users", uid);
  const docSnap = await getDoc(ref);
  if (docSnap.exists()) {
    // Convert to User object
    const userData = docSnap.data() as User;

    // Filter through recipes to find one with matching name
    const currentRecipeIndex = userData.recipes.findIndex((recipe) => {
      console.log(
        "recipeName: " + recipeName + "; recipe.name: " + recipe.name
      );
      recipe.name === recipeName;
    });
    const currentRecipe = userData.recipes.find(
      (recipe) => recipe.name === recipeName
    );

    // Create new ingredient
    const newIngredient = {
      name: ingredientName,
      type: "Misc",
      asignee: ingredientAsignee,
      retrieved: false,
    } as Ingredient;

    // Modify current "User" to include new ingredient in recipe
    currentRecipe?.ingredients.push(newIngredient);

    //@ts-ignore
    userData.recipes[currentRecipeIndex] = currentRecipe;

    setDoc(ref, userData);
  } else {
    console.log("No such document!");
  }
};

//@ts-ignore
export default function AddNewIngredient({ name }: Recipe) {
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientAsignee, setNewIngredientAsignee] = useState("");

  return (
    <div>
      <h3>Add new Ingredient</h3>
      <input
        placeholder="Ingredient Name"
        onChange={(e) => setNewIngredientName(e.target.value)}
      />
      <input
        placeholder="Asignee"
        onChange={(e) => setNewIngredientAsignee(e.target.value)}
      />
      <button
        onClick={() =>
          addNewIngredientToRecipe(
            //@ts-ignore
            auth.currentUser?.uid,
            name,
            newIngredientName,
            newIngredientAsignee
          )
        }
      >
        Add New Ingredient
      </button>
    </div>
  );
}
