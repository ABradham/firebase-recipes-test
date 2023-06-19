import { QuerySnapshot, collection, getFirestore } from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { Recipe, Ingredient, UserSearchProfile, AppUser } from "@/types";
import { useCollection } from "react-firebase-hooks/firestore";
import { useEffect, useState } from "react";

const app = initFirebase();

export function RecipeCard({ name, ingredients }: Recipe) {
  const [userSearchInfo, setUserSearchInfo] = useState(
    {} as { [key: string]: UserSearchProfile }
  );
  const [retrieved, setRetrieved] = useState(false);

  const [value, loading, error] = useCollection(
    collection(getFirestore(app), "users")
  );

  useEffect(() => {
    if (value) {
      const profiles = getUniqueUsers(value);
      setUserSearchInfo(profiles);
      setRetrieved(true);
    }
  }, [value]);

  const getUniqueUsers = (fromServer: QuerySnapshot<DocumentData>) => {
    let unqiueUsers = new Map() as Map<string, UserSearchProfile>;
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
    </div>
  );
}
