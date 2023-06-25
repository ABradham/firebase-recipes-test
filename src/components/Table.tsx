import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { collection, doc, getDocs, getFirestore } from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { useDocument } from "react-firebase-hooks/firestore";
import { Avatar, Skeleton, Typography } from "@mui/material";
import { IngredientsWithID, RecipeData, UserSearchProfile } from "../types";
import RetrievedCheckboxComponent from "./RetrievedCheckBox";
import AddNewIngredient from "./AddNewIngredientCard";
import { useEffect, useState } from "react";

let globalRecipeID = "";
let globalRecipeCollaborators: Map<string, UserSearchProfile> = new Map();

const columns: GridColDef[] = [
  { field: "name", headerName: "Item", width: 300 },
  { field: "type", headerName: "Item Type", width: 300 },
  {
    field: "asignee",
    renderCell: (cellValues) => {
      console.log(
        JSON.stringify(Object.fromEntries(globalRecipeCollaborators))
      );
      return (
        <>
          <Avatar
            src={globalRecipeCollaborators.get(cellValues.value)!.photoURL}
          />
          <Typography style={{ paddingLeft: 20 }}>
            {globalRecipeCollaborators.get(cellValues.value)!.displayName}
          </Typography>
        </>
      );
    },
    headerName: "Assigned To",
    width: 300,
  },
  {
    field: "retrieved",
    renderCell: (cellValues) => {
      return RetrievedCheckboxComponent(
        (cellValues = cellValues),
        (globalRecipeID = globalRecipeID)
      );
    },
    headerName: "Retrieved",
    type: "boolean",
    width: 150,
  },
];

const app = initFirebase();

const recipeDataToRows = (recipeData: RecipeData): IngredientsWithID[] => {
  let rows: IngredientsWithID[] = [];
  recipeData.ingredients.forEach((ingredient) => {
    const newObj: IngredientsWithID = {
      name: ingredient.name,
      asignee: ingredient.asignee,
      type: ingredient.type,
      id: ingredient.name,
      retrieved: ingredient.retrieved,
    };
    rows.push(newObj);
  });
  return rows;
};

//@ts-ignore
export default function MUIDataTable({ recipeID }) {
  const [userDataRetrieved, setUserDataRetrieved] = useState(false);
  useEffect(() => {
    const getGlobalRecipeCollaborators = async () => {
      const allUsers: UserSearchProfile[] = [];
      let uidsToProfiles: Map<string, UserSearchProfile> = new Map();

      const usersRef = collection(getFirestore(app), "users");
      const fromFirestore = await getDocs(usersRef);
      fromFirestore.docs.forEach((doc) => {
        console.log(doc.data());
        allUsers.push(doc.data() as UserSearchProfile);
      });

      allUsers.forEach((user) => {
        uidsToProfiles.set(user.uid, user);
      });
      globalRecipeCollaborators = uidsToProfiles;
      setUserDataRetrieved(true);
    };

    getGlobalRecipeCollaborators();
  }, []);
  // Given a string with the recipe's ID, we can fetch all recipe data from firestore;
  const recipeFirestoreRef = doc(getFirestore(app), "recipes", recipeID);
  const [data, loading, error] = useDocument(recipeFirestoreRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  if (!data || loading || error) {
    return <Skeleton />;
  }

  // Convert firebase response data to known schema
  const recipeData = data?.data() as RecipeData;

  // Update globals before rendering table
  globalRecipeID = recipeID;

  const rows = recipeDataToRows(recipeData);

  if (!userDataRetrieved) {
    return <Skeleton />;
  }
  return (
    <div
      style={{
        paddingTop: 16,
        paddingBottom: 16,
        minHeight: 200,
        width: "100%",
      }}
    >
      <Typography variant="h4">{recipeData.name}</Typography>

      {recipeData.ingredients.length > 0 && (
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
        />
      )}
      <AddNewIngredient recipeID={globalRecipeID} />
    </div>
  );
}
