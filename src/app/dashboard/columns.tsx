"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../../components/ui/badge";
import { IngredientTableData } from "@/types";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

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
      if (retrieved) {
        return <Badge>True</Badge>;
      } else {
        return <Badge>False</Badge>;
      }
    },
  },
];
