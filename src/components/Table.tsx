import * as React from "react";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridTreeNode,
} from "@mui/x-data-grid";
import { doc, getFirestore } from "firebase/firestore";
import { initFirebase } from "../../firebase/firebaseApp";
import { useDocument } from "react-firebase-hooks/firestore";
import { Skeleton, Typography } from "@mui/material";
import { IngredientsWithID, RecipeData } from "@/types";

const columns: GridColDef[] = [
  { field: "name", headerName: "Item", width: 300 },
  { field: "type", headerName: "Item Type", width: 300 },
  { field: "asignee", headerName: "Assigned To", width: 300 },
  {
    field: "retreived",
    headerName: "Retreived",
    type: "boolean",
    width: 150,
  },
];

const app = initFirebase();

const recipeDataToRows = (recipeData: RecipeData): IngredientsWithID[] => {
  let rows: IngredientsWithID[] = [];
  recipeData.ingredients.forEach((ingredient) => {
    const newObj: IngredientsWithID = { ...ingredient, id: ingredient.name };
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

  if (loading) {
    return <Skeleton />;
  }

  const recipeData = data?.data() as RecipeData;
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
    </div>
  );
}
