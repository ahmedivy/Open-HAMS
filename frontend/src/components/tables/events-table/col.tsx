import { EventWithCount } from "@/api/event";
import { EditEventFormWrapper } from "@/components/events/edit-event-model";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../table-commons/col-headers";
import { useState } from "react";

export const eventTableColumns: ColumnDef<EventWithCount>[] = [
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
    accessorFn: (row) => row.event.id,
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
    accessorFn: (row) => row.event.name,
  },
  {
    id: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="max-w-48 truncate">
            {row.getValue("description") as string}
          </span>
        </div>
      );
    },
    accessorFn: (row) => row.event.description,
  },
  {
    id: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("startDate")}</span>
        </div>
      );
    },
    accessorFn: (row) => new Date(row.event.start_at).toLocaleDateString(),
  },
  {
    id: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("endDate")}</span>
        </div>
      );
    },
    accessorFn: (row) => new Date(row.event.end_at).toLocaleDateString(),
  },
  //   {
  //     accessorKey: "location",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Location" />
  //     ),
  //     cell: ({ row }) => {
  //       return (
  //         <div className="flex items-center">
  //           <span>{row.getValue("location")}</span>
  //         </div>
  //       );
  //     },
  //     filterFn: (row, id, value) => {
  //       return row[id].toLowerCase().includes(value.toLowerCase());
  //     },
  //   },
  {
    id: "assignedAnimals",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned Animals" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("assignedAnimals")}</span>
        </div>
      );
    },
    accessorFn: (row) => row.animal_count,
  },
  {
    id: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("updated_at")}</span>
        </div>
      );
    },
    accessorFn: (row) => new Date(row.event.updated_at).toLocaleDateString(),
  },
  {
    id: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("created_at")}</span>
        </div>
      );
    },
    accessorFn: (row) => new Date(row.event.created_at).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Badge variant="secondary" className="font-thin">
              edit
            </Badge>
          </DialogTrigger>
          <DialogContent className="max-w-fit">
            <EditEventFormWrapper eventId={row.getValue("id")} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      );
    },
  },
];
