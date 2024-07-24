import { formatDate } from "@/utils";
import { AnimalHealthLogWithDetails } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../table-commons/col-headers";

export const animalHealthLogTableColumns: ColumnDef<AnimalHealthLogWithDetails>[] =
  [
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
      accessorFn: (row) => row.log.id,
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
      id: "details",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Details" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 flex-1 flex-grow w-96">
            <span>{row.getValue("details")}</span>
          </div>
        );
      },
      accessorFn: (row) => row.log.details,
    },
    {
      id: "logged_by",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Logged By" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span>{row.getValue("logged_by")}</span>
          </div>
        );
      },
      accessorFn: (row) => `${row.user.first_name} ${row.user.last_name}`,
    },
    {
      id: "logged_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Logged At" />
      ),
      cell: ({ row }) => {
        return <p>{row.getValue("logged_at")}</p>;
      },
      accessorFn: (row) => formatDate(row.log.logged_at),
    },
  ];
