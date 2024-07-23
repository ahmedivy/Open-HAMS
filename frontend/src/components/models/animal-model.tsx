import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { createAnimal, updateAnimal } from "@/api/animals";
import { useAnimal, useZoos } from "@/api/queries";
import { animalSchema, AnimalSchema } from "@/api/schemas/animal";
import { tiers } from "@/api/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { LoadingDots, Spinner } from "../icons";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

export function AnimalModel(props: {
  mode: "add" | "edit";
  children: React.ReactNode;
  animalId?: string;
}) {
  const { data: zoos, isLoading } = useZoos();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: animal, isLoading: isAnimalLoading } = useAnimal(
    props.animalId!,
  );
  const form = useForm<AnimalSchema>({
    resolver: zodResolver(animalSchema),
    defaultValues:
      props.mode === "edit"
        ? {
            name: animal?.name!,
            species: animal?.species!,
            image: animal?.image!,
            max_daily_checkouts: animal?.max_daily_checkouts!,
            max_daily_checkout_hours: animal?.max_daily_checkout_hours!,
            rest_time: animal?.rest_time!,
            description: animal?.description!,
            tier: animal?.tier!.toString(),
            handling_enabled: animal?.handling_enabled!,
            zoo_id: animal?.zoo_id?.toString(),
          }
        : {},
  });

  if (props.mode === "edit" && !props.animalId) return null;

  if (isLoading || isAnimalLoading) return <LoadingDots />;

  async function onSubmit(values: AnimalSchema) {
    console.log(values);

    var res;
    if (props.mode === "add") {
      res = await createAnimal(values);
    } else {
      res = await updateAnimal(values, props.animalId!);
    }

    if (res.status === 200) {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["animals"]);

      if (props.mode === "edit") {
        queryClient.invalidateQueries(["animal", props.animalId!]);
        queryClient.invalidateQueries(["animal_details", props.animalId!]);
      }

      setOpen(false);
    } else {
      toast.error(res.data.detail);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="bg-model">
        <DialogTitle className="text-center font-light">
          {
            {
              add: "Add",
              edit: "Edit",
            }[props.mode]
          }{" "}
          Animal Details
        </DialogTitle>
        <ScrollArea className="h-[700px]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-1"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the animal's name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the species" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        // type="file"
                        placeholder="Enter image url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_daily_checkouts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Daily Checkouts</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter the maximum number of daily checkouts"
                        onChange={(event) =>
                          field.onChange(+event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_daily_checkout_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Daily Checkout Hours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter the maximum number of daily checkout hours"
                        onChange={(event) =>
                          field.onChange(+event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rest_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rest Time (hours)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter the required rest time after an event"
                        onChange={(event) =>
                          field.onChange(+event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter a brief description of the animal"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handling Difficulty Tier</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value as any as string}
                    >
                      <FormControl>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiers.map((tier) => (
                          <SelectItem key={tier.value} value={tier.value}>
                            {tier.label}
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
                name="handling_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Handling Enabled</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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

              <div className="flex w-full items-center justify-center gap-3">
                <DialogClose asChild>
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Spinner className="mr-2 size-4" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
