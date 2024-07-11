import { capitalize } from "@/utils";
import { User } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { DataTableColumnHeader } from "../table-commons/col-headers";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => (
      <Avatar className="m-2">
        <AvatarImage src="/placeholder-avatar.png" alt={row.getValue("name")} />
        <AvatarFallback>{row.original.first_name[0]}</AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
    enableHiding: false,
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
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("email")}</span>
        </div>
      );
    },
  },
  {
    id: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("role")}</span>
        </div>
      );
    },
    accessorFn: (row) => capitalize(row.role?.name!),
  },
  {
    id: "lastAction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Action" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("lastAction")}</span>
        </div>
      );
    },
    accessorFn: (row) => "N/A",
  },
  {
    id: "actionDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("actionDate")}</span>
        </div>
      );
    },
    accessorFn: (row) => new Date(row.updated_at).toLocaleDateString(),
  },
  {
    id: "deptName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department Name" />
    ),
    cell: ({ row }) => {
      return <p>{row.getValue("deptName")}</p>;
    },
    accessorFn: (row) => "Hoggle Zoo",
  },
  {
    id: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account Created At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("createdAt")}</span>
        </div>
      );
    },
    accessorFn: (row) => new Date(row.created_at).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-thin">
        <Link to={`/users/${row.original.id}`}>edit</Link>
      </Badge>
    ),
  },
];
