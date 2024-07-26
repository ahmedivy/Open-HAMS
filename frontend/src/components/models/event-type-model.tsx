import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  createEventType,
  getEventType,
  updateEventType,
} from "@/api/event-type";
import { useGroups, useZoos } from "@/api/queries";
import { eventTypeSchema, EventTypeSchema } from "@/api/schemas/event-type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { LoadingDots, Spinner } from "../icons";
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

export function EventTypeModelWrapper(props: {
  mode: "add" | "edit";
  children: React.ReactNode;
  eventTypeId?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent className="bg-blueish">
        <EventTypeModel
          mode={props.mode}
          eventTypeId={props.eventTypeId}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
}

export function EventTypeModel(props: {
  mode: "add" | "edit";
  eventTypeId?: string;
  setOpen?: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: zoos, isLoading: isLoadingZoos } = useZoos();
  const { data: groups, isLoading: isLoadingGroups } = useGroups();

  const form = useForm<EventTypeSchema>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: async () => {
      if (props.mode === "add") {
        return {
          name: "",
          zoo_id: "",
          group_id: "",
        };
      } else {
        const res = await getEventType(props.eventTypeId!);
        return {
          name: res.name,
          group_id: res?.group_id?.toString()!,
          zoo_id: res.zoo_id.toString()!,
        };
      }
    },
  });

  async function onSubmit(values: EventTypeSchema) {
    console.log(values);
    const res =
      props.mode === "add"
        ? await createEventType(values)
        : await updateEventType(parseInt(props.eventTypeId!), values);
    if (res.status === 200) {
      toast.success(res.data.message);
      form.reset();
      props.setOpen?.(false);
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
    } else {
      toast.error(res.data.detail);
    }
  }

  if (isLoadingGroups || isLoadingZoos) {
    return <LoadingDots />;
  }

  return (
    <div className="grid gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {props.mode === "add" ? "Add New" : "Edit"} Event Type
            </DialogTitle>
            <Button size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Spinner className="mr-2 size-5" />
              )}
              Save
            </Button>
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
                      <SelectItem key={group.id} value={group.id.toString()}>
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
  );
}
