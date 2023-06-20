"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type IngredientTableData = {
  name: string;
  type: string;
  asignee: string;
  photoURL: string;
  recieved: boolean;
};

export const columns: ColumnDef<IngredientTableData>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "asignee",
    header: "Asignee",
  },
  {
    accessorKey: "recieved",
    header: "Received",
  },
];
