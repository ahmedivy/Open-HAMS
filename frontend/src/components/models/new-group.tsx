import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { createGroup } from "@/api/group";
import { GroupSchema, groupSchema } from "@/api/schemas/group";
import { useZoos } from "@/queries/zoo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

export function NewGroupModel() {
  const [open, setOpen] = useState(false);
  const { data: zoos, isLoading } = useZoos();
  const form = useForm<GroupSchema>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: GroupSchema) {
    console.log(values);
    const res = await createGroup(values);
    if (res.status === 201) {
      toast.success(res.data.message);
      form.reset();
      setOpen(false);
    } else {
      toast.error(res.data.detail);
    }
  }

  if (isLoading) {
    return <LoadingDots />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Add Group</Button>
      </DialogTrigger>
      <DialogContent className="bg-blueish">
        <div className="grid gap-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-1"
            >
              <div className="flex items-center justify-between">
                <DialogTitle>Add New Group</DialogTitle>
                <Button size="sm">Submit</Button>
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the group's title" />
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
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
