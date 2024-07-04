import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "./col-headers";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const userManagementColumns = [
  {
    accessorKey: "image",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => (
      <Avatar className="m-2">
        <AvatarImage src={row.getValue("image")} alt={row.getValue("name")} />
        <AvatarFallback>{row.getValue("name")[0]}</AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
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
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: () => {
      return (
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Role" defaultValue="admin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "group",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group" />
    ),
    cell: () => {
      return (
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Group" defaultValue="group-2" />
          </SelectTrigger>
          <SelectContent>
            {["group-1", "group-2", "group-3"].map((group) => (
              <SelectItem key={group} value={group}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "tier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tier" />
    ),
    cell: () => {
      const tiers = [
        {
          label: "Tier 1",
          value: "tier-1",
        },
        {
          label: "Tier 2",
          value: "tier-2",
        },
        {
          label: "Tier 3",
          value: "tier-3",
        },
        {
          label: "Tier 4",
          value: "tier-4",
        },
      ];

      return (
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tier" defaultValue="tier-4" />
          </SelectTrigger>
          <SelectContent>
            {tiers.map((tier) => (
              <SelectItem key={tier.value} value={tier.value}>
                {tier.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
];
