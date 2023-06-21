import { Ingredient, RecipeData } from "@/types";
import { Checkbox } from "@mui/material";
import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";

const app = initFirebase();

export default function RetrievedCheckboxComponent(
  cellValues: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>,
  globalRecipeID: string
) {
  const onCheckBoxClicked = async () => {
    const currentValue: boolean = cellValues.value;
    // Get document for current recipe
    const recipeDocRef = doc(getFirestore(app), "recipes", globalRecipeID);
    let currRecipe: RecipeData = (
      await getDoc(recipeDocRef)
    ).data() as RecipeData;
    let currIngredients: Ingredient[] = currRecipe.ingredients;

    // Modify ingredients array to change `retrieved` field on specific ingredient
    const ingredientIndex = currIngredients.findIndex(
      (ing) => ing.name == cellValues.row.name
    );
    currIngredients[ingredientIndex].retrieved =
      !currIngredients[ingredientIndex].retrieved;

    currRecipe.ingredients = currIngredients;

    // Set doc to update remotely on firebase (should trigger a re-render of the table)
    setDoc(recipeDocRef, currRecipe);
  };
  console.log(cellValues.value);
  return (
    <Checkbox
      checked={cellValues.value}
      onClick={() => {
        onCheckBoxClicked();
      }}
    />
  );
}
