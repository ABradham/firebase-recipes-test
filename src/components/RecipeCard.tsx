import {
  QuerySnapshot,
  collection,
  getFirestore,
  doc,
  getDoc,
} from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { useCollectionOnce } from "react-firebase-hooks/firestore";
import { useEffect, useState } from "react";

import { Recipe, Ingredient, UserSearchProfile, AppUser } from "@/types";
import AddNewIngredient from "./AddNewIngredientCard";
import { getAuth } from "firebase/auth";

const app = initFirebase();
const auth = getAuth(app);

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
                onChange={(e) => {}}
              />
              {!retrieved
                ? "Loading User Display Name..."
                : userSearchInfo[ingredient.asignee].displayName}
            </li>
          );
        })}
      </ul>
      <AddNewIngredient name={name} />
    </div>
  );
}
