import { capitalize, getInitials } from "@/utils";
import { User } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { DataTableColumnHeader } from "../table-commons/col-headers";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => (
      <Avatar className="m-2">
        <AvatarImage src={row.getValue("image")} alt={row.getValue("name")} />
        <AvatarFallback>
          {getInitials(row.original.first_name, row.original.last_name)}
        </AvatarFallback>
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
    id: "group",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("group")}</span>
        </div>
      );
    },
    accessorFn: (row) => row.group?.title || "N/A",
  },

  {
    id: "zooName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zoo Name" />
    ),
    cell: ({ row }) => {
      return <p>{row.getValue("zooName")}</p>;
    },
    accessorFn: (row) => row.zoo?.name || "N/A",
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
  // {
  //   id: "actions",
  //   cell: ({ row }) => (
  //     <Badge variant="secondary" className="font-thin">
  //       <Link to={`/users/${row.original.id}`}>edit</Link>
  //     </Badge>
  //   ),
  // },
];
