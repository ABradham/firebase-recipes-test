"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type IngredientTableData = {
  name: string;
  type: string;
  asignee: string;
  retrieved: boolean;
};

export const columns: ColumnDef<IngredientTableData>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-right">Ingredient Name</div>,
    cell: ({ row }) => {
      const ingName: string = row.getValue("name");

      return <div className="text-right font-medium">{ingName}</div>;
    },
  },
  {
    accessorKey: "asignee",
    header: () => <div className="text-right">Assigned To</div>,
    cell: ({ row }) => {
      const asigName: string = row.getValue("asignee");
      return <div className="text-right font-medium">{asigName}</div>;
    },
  },
  {
    accessorKey: "retrieved",
    header: () => <div className="text-right">Completed</div>,
    cell: ({ row }) => {
      const retrieved: boolean = row.getValue("retrieved");
      console.log(row.getValue("retrieved"));
      if (retrieved) {
        return <div className="text-right font-medium green-700">True</div>;
      } else {
        return <div className="text-right font-medium red-700">False</div>;
      }
    },
  },
];
