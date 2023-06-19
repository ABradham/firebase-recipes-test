"use client";

import "firebase/firestore";
import "firebase/auth";
import { User, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { useRouter } from "next/navigation";
import { initFirebase } from "../../../firebase/firebaseApp";
import { doc } from "firebase/firestore";

const app = initFirebase();
const auth = getAuth(app);

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
      <section>
        <h2>Add Recipe</h2>
        <input type="text" placeholder="Search here" />
      </section>
      <button onClick={() => auth.signOut()}>Sign out</button>
    </main>
  );
};

function MyRecipesList({ uid, displayName }: User) {
  const userFirestoreDocRef = doc(getFirestore(app), "users", uid);
  const [userData, loading, error] = useDocument(userFirestoreDocRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Error Loading User Data!</div>;
  }

  const user = userData?.data() as CurrentUser;

  // Show nothing if user has no recipes / data in the databasex
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

function RecipeCard({ name, ingredients }: Recipe) {
  return (
    <div>
      <h3>{name}</h3>
      <ul>
        {ingredients.map((ingredient: Ingredient) => {
          return (
            <li key={ingredient.name}>
              {ingredient.name} -{ingredient.type}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface CurrentUser {
  recipes: Array<Recipe>;
  displayName: string | null;
  uid: string;
}

interface Ingredient {
  name: string;
  type: string;
  asignee: string;
}

interface Recipe {
  ingredients: Array<Ingredient>;
  name: string;
  completed?: boolean;
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
