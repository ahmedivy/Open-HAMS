import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "../col-header";

import { ColumnDef } from "@tanstack/react-table";

import { updateRole, updateTier } from "@/api/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoles } from "@/queries/roles";
import { capitalize } from "@/utils";
import { User } from "@/utils/types";
import { useMutation } from "react-query";
import { toast } from "sonner";

const RolesSelect = (props: { currentRole: string; id: number }) => {
  const { data: roles, isLoading } = useRoles();

  const mutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await updateRole(props.id, role);
      if (res.status === 200) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.detail);
      }
    },
  });

  if (isLoading) {
    return null;
  }

  return (
    <Select
      defaultValue={props.currentRole}
      onValueChange={(value) => mutation.mutate(value)}
      disabled={mutation.isLoading}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles?.map((role) => (
          <SelectItem key={role.id} value={role.name}>
            {capitalize(role.name)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const TierSelect = (props: { currentTier: number; id: number }) => {
  const mutation = useMutation({
    mutationFn: async (tier: number) => {
      const res = await updateTier(props.id, tier);
      if (res.status === 200) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.detail);
      }
    },
  });

  const tiers = [
    {
      label: "Tier 1",
      value: "1",
    },
    {
      label: "Tier 2",
      value: "2",
    },
    {
      label: "Tier 3",
      value: "3",
    },
    {
      label: "Tier 4",
      value: "4",
    },
  ];

  return (
    <Select
      defaultValue={props.currentTier.toString()}
      onValueChange={(value) => mutation.mutate(parseInt(value))}
      disabled={mutation.isLoading}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
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
};

export const userManagementColumns: ColumnDef<User>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => (
      <Avatar className="m-2">
        <AvatarImage
          // src={row.getValue("image")}
          src="/placeholder-avatar.png"
          alt={row.original.first_name}
        />
        <AvatarFallback>{row.original.first_name[0]}</AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      return <span>{row.original.id}</span>;
    },
    enableSorting: true,
    sortingFn: (a, b, id) => {
      return a.original.id - b.original.id;
    },
  },
  {
    id: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>
            {row.original.first_name} {row.original.last_name}
          </span>
        </div>
      );
    },
    enableSorting: true,
    // filterFn: (row, id, value) => {
    //   return `${row.original.first_name} ${row.original.last_name}`
    //     .toLowerCase()
    //     .includes(value.toLowerCase());
    // },
    // sortingFn: (a, b, id) => {
    //   return a.original.first_name.localeCompare(b.original.first_name);
    // },
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
  },
  {
    id: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      return (
        <RolesSelect
          currentRole={row.original?.role?.name!}
          id={row.original.id}
        />
      );
    },
    filterFn: (row, id, value) => {
      console.log(row.original.role?.name, value);
      // return row.original.role?.name === value;
      return value.includes(row.original.role?.name!);
    },
    accessorFn: (row) => row.role?.name,
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

    cell: ({ row }) => {
      return (
        <TierSelect currentTier={row.original.tier} id={row.original.id} />
      );
    },
  },
];
