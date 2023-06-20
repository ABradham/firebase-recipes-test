import {
  QuerySnapshot,
  collection,
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { useCollectionOnce } from "react-firebase-hooks/firestore";
import { useEffect, useState } from "react";

import { Recipe, Ingredient, UserSearchProfile, AppUser, User } from "@/types";
import AddNewIngredient from "./AddNewIngredientCard";
import { getAuth } from "firebase/auth";

import { IngredientTableData, columns } from "@/app/dashboard/columns";
import { DataTable } from "@/app/dashboard/data-table";

const app = initFirebase();
const auth = getAuth(app);

const changeIngredientRetrievedState = async (
  checkboxState: boolean,
  recipeName: string,
  ingredientName: string
) => {
  // Get document containing this recipe
  if (auth.currentUser) {
    const ref = doc(getFirestore(app), "users", auth.currentUser.uid);
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

      // Look for ingredient in recipe
      const currentIngredient = currentRecipe?.ingredients.find(
        (ingredient) => ingredient.name === ingredientName
      );
      const currentIngredientIndex = currentRecipe?.ingredients.findIndex(
        (ingredient) => ingredient.name === ingredientName
      );
      currentIngredient!.retrieved = checkboxState;

      // Modify current `User`'s ingredients list to reflect changes in state
      currentRecipe!.ingredients[currentIngredientIndex!].retrieved =
        checkboxState;

      //@ts-ignore
      userData.recipes[currentRecipeIndex] = currentRecipe;

      // Send updates to firestore
      setDoc(ref, userData);
    }
  }
};

// @ts-ignore
export function RecipeCard({ name, ingredients }: Recipe) {
  const [userSearchInfo, setUserSearchInfo] = useState(
    {} as { [key: string]: UserSearchProfile }
  );
  const [retrieved, setRetrieved] = useState(false);

  const [value, loading, error] = useCollectionOnce(
    collection(getFirestore(app), "users")
  );

  useEffect(() => {
    if (value) {
      const profiles = getUniqueUsers(value);
      setUserSearchInfo(profiles);
      setRetrieved(true);
      console.log(profiles);
    }
  }, [value]);

  const getUniqueUsers = (
    fromServer: QuerySnapshot<DocumentData>
  ): { [key: string]: UserSearchProfile } => {
    let unqiueUsers = new Map() as Map<string, UserSearchProfile>;
    console.log(fromServer.docs);
    fromServer.docs.forEach((doc) => {
      const currentUserId = doc.id;
      const userData = doc.data() as AppUser;
      const currentUserProfile = {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        uid: userData.uid,
      } as UserSearchProfile;
      unqiueUsers.set(currentUserId, currentUserProfile);
    });

    return Object.fromEntries(unqiueUsers);
  };

  return (
    <div>
      <h3>{name}</h3>
      <ul>
        {ingredients.map((ingredient: Ingredient) => {
          return (
            <li key={ingredient.name}>
              {ingredient.name} -{ingredient.type}
              <input
                type="checkbox"
                checked={ingredient.retrieved}
                onChange={(e) => {
                  changeIngredientRetrievedState(
                    e.target.checked,
                    name,
                    ingredient.name
                  );
                }}
              />
              {!retrieved
                ? "Loading User Display Name..."
                : userSearchInfo[ingredient.asignee].displayName}
            </li>
          );
        })}
      </ul>
      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={ingredients as Array<IngredientTableData>}
        />
      </div>
      <AddNewIngredient name={name} />
    </div>
  );
}
