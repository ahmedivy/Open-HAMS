import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { createEventType, updateEventType } from "@/api/event-type";
import { eventTypeSchema, EventTypeSchema } from "@/api/schemas/event-type";
import { useGroups } from "@/api/queries";
import { useZoos } from "@/api/queries";
import { EventType } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { LoadingDots } from "../icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function EventTypeModel(props: {
  mode: "add" | "edit";
  children: React.ReactNode;
  eventType?: EventType;
}) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: zoos, isLoading: isLoadingZoos } = useZoos();
  const { data: groups, isLoading: isLoadingGroups } = useGroups();

  const form = useForm<EventTypeSchema>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues:
      props.mode === "edit"
        ? {
            name: props.eventType?.name!,
            zoo_id: props.eventType?.zoo_id?.toString(),
            group_id: props.eventType?.group_id?.toString(),
          }
        : {
            name: "",
          },
  });

  async function onSubmit(values: EventTypeSchema) {
    console.log(values);
    const res =
      props.mode === "add"
        ? await createEventType(values)
        : await updateEventType(props.eventType!.id, values);
    if (res.status === 200) {
      toast.success(res.data.message);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
    } else {
      toast.error(res.data.detail);
    }
  }

  if (isLoadingGroups || isLoadingZoos) {
    return <LoadingDots />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent className="bg-blueish">
        <div className="grid gap-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-1"
            >
              <div className="flex items-center justify-between">
                <DialogTitle>
                  {props.mode === "add" ? "Add New" : "Edit"} Event Type
                </DialogTitle>
                <Button size="sm">Save</Button>
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Add Event Type name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zoo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zoo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value as any as string}
                    >
                      <FormControl>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select Zoo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zoos?.map((zoo) => (
                          <SelectItem key={zoo.id} value={zoo.id.toString()}>
                            {zoo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value as any as string}
                    >
                      <FormControl>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups?.map((group) => (
                          <SelectItem
                            key={group.id}
                            value={group.id.toString()}
                          >
                            {group.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
