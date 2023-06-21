import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridTreeNode,
} from "@mui/x-data-grid";
import { doc, getFirestore } from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { useDocument } from "react-firebase-hooks/firestore";
import { Avatar, Skeleton, Typography } from "@mui/material";
import { IngredientsWithID, RecipeData, UserSearchProfile } from "@/types";
import RetrievedCheckboxComponent from "./RetrievedCheckBox";
import AddNewIngredient from "./AddNewIngredientCard";

let globalRecipeID = "";
let globalRecipeData: RecipeData = {} as RecipeData;

const columns: GridColDef[] = [
  { field: "name", headerName: "Item", width: 300 },
  { field: "type", headerName: "Item Type", width: 300 },
  {
    field: "asignee",
    renderCell: (cellValues) => {
      const recipeData: RecipeData = globalRecipeData as RecipeData;
      const allCollaborators: UserSearchProfile[] = recipeData.collaborators;

      let uidsToProfiles: Map<string, UserSearchProfile> = new Map();
      allCollaborators.forEach((user) => {
        uidsToProfiles.set(user.uid, user);
      });
      return (
        <>
          <Avatar src={uidsToProfiles.get(cellValues.value)!.photoURL} />
          <Typography style={{ paddingLeft: 20 }}>
            {uidsToProfiles.get(cellValues.value)!.displayName}
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

const handleOnCellClicked = async (
  params: GridCellParams<any, unknown, unknown, GridTreeNode>
) => {};

//@ts-ignore
export default function MUIDataTable({ recipeID }) {
  // Given a string with the recipe's ID, we can fetch all recipe data from firestore;
  const recipeFirestoreRef = doc(getFirestore(app), "recipes", recipeID);
  const [data, loading, error] = useDocument(recipeFirestoreRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  if (loading || error) {
    return <Skeleton />;
  }

  // Convert firebase response data to known schema
  const recipeData = data?.data() as RecipeData;

  // Update globals before rendering table
  globalRecipeID = recipeID;
  globalRecipeData = recipeData;

  const rows = recipeDataToRows(recipeData);
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
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          onCellClick={(params) => handleOnCellClicked(params)}
        />
      )}
      <AddNewIngredient recipeID={globalRecipeID} />
    </div>
  );
}
