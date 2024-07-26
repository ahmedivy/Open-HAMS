import { DataTableColumnHeader } from "../table-commons/col-headers";

import { ColumnDef } from "@tanstack/react-table";

import {
  update_event_type_group,
  update_event_type_zoo,
} from "@/api/event-type";
import { useGroups, useZoos } from "@/api/queries";
import { EventTypeModelWrapper } from "@/components/models/event-type-model";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventType } from "@/utils/types";
import { useMutation } from "react-query";
import { toast } from "sonner";

const ZooSelect = (props: { currentZooId: string; id: number }) => {
  const { data: zoos, isLoading } = useZoos();

  const mutation = useMutation({
    mutationFn: async (newZooId: string) => {
      const res = await update_event_type_zoo(props.id, newZooId);
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
      defaultValue={props.currentZooId}
      onValueChange={(value) => mutation.mutate(value)}
      disabled={mutation.isLoading}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {zoos?.map((zoo) => (
          <SelectItem key={zoo.id} value={zoo.id.toString()}>
            {zoo.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const GroupSelect = (props: { currentGroupId: string; id: number }) => {
  const { data: groups, isLoading } = useGroups();

  const mutation = useMutation({
    mutationFn: async (newGroupId: string) => {
      const res = await update_event_type_group(props.id, newGroupId);
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
      defaultValue={props.currentGroupId}
      onValueChange={(value) => mutation.mutate(value)}
      disabled={mutation.isLoading}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {groups?.map((group) => (
          <SelectItem key={group.id} value={group.id.toString()}>
            {group.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const eventTypesColumns: ColumnDef<EventType>[] = [
  {
    accessorKey: "id",
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
    enableSorting: true,
  },
  {
    id: "group",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group" />
    ),
    cell: ({ row }) => {
      return (
        <GroupSelect
          currentGroupId={row.original.group_id?.toString()!}
          id={row.original.id}
        />
      );
    },
    enableSorting: false,
    accessorFn: (row) => row.group_id,
  },
  {
    id: "zoo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zoo" />
    ),

    cell: ({ row }) => {
      return (
        <ZooSelect
          currentZooId={row.original.zoo_id?.toString()!}
          id={row.original.id}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <EventTypeModelWrapper
            mode="edit"
            eventTypeId={row.getValue("id")}
            key={row.getValue("id")}
          >
            <Badge variant={"secondary"} className="font-extralight">
              edit
            </Badge>
          </EventTypeModelWrapper>
        </div>
      );
    },
    accessorFn: (row) => row.id,
  },
];
