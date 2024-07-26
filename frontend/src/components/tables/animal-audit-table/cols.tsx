import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, snakeToCapitalCase } from "@/utils";
import { AnimalAuditWithDetails } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import { DataTableColumnHeader } from "../table-commons/col-headers";

export const animalAuditTableColumns: ColumnDef<AnimalAuditWithDetails>[] = [
  {
    id: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("id")}</span>
        </div>
      );
    },
    accessorFn: (row) => row.audit.id,
  },
  {
    id: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("name")}</span>
        </div>
      );
    },
    accessorFn: (row) => row.animal.name,
  },
  {
    id: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span>{row.getValue("action")}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.original.audit.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    accessorFn: (row) => snakeToCapitalCase(row.audit.action),
  },
  {
    id: "changed_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Changed By" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("changed_by")}</span>
        </div>
      );
    },
    accessorFn: (row) => `${row.user.first_name} ${row.user.last_name}`,
  },
  {
    id: "changed_field",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Changed Field" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{snakeToCapitalCase(row.getValue("changed_field"))}</span>
        </div>
      );
    },
    accessorFn: (row) => row.audit.changed_field || "N/A",
  },
  {
    accessorKey: "old_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Old Value" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{snakeToCapitalCase(row.getValue("old_value"))}</span>
        </div>
      );
    },
    accessorFn: (row) => row.audit.old_value || "N/A",
  },
  {
    accessorKey: "new_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="New Value" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{snakeToCapitalCase(row.getValue("new_value"))}</span>
        </div>
      );
    },
    accessorFn: (row) => row.audit.new_value || "N/A",
  },
  {
    id: "changed_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Changed At" />
    ),
    cell: ({ row }) => {
      return <p>{row.getValue("changed_at")}</p>;
    },
    accessorFn: (row) => formatDate(row.audit.changed_at),
  },
];
