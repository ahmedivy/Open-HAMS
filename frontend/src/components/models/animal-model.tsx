import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  createAnimal,
  deleteAnimal,
  getAnimal,
  updateAnimal,
} from "@/api/animals";
import { useZoos } from "@/api/queries";
import { animalSchema, AnimalSchema } from "@/api/schemas/animal";
import { uploadFile } from "@/api/upload";
import { tiers } from "@/api/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingDots, Spinner } from "../icons";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
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
  const [open, setOpen] = useState(false);
  if (props.mode === "edit" && !props.animalId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        onClick={(e) => {
          setOpen(true);
          e.stopPropagation();
        }}
      >
        {props.children}
      </DialogTrigger>
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
          <AnimalForm {...props} setOpen={setOpen} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function AnimalForm(props: {
  mode: "add" | "edit";
  children: React.ReactNode;
  animalId?: string;
  setOpen: (open: boolean) => void;
}) {
  const { data: zoos, isLoading } = useZoos();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const form = useForm<AnimalSchema>({
    resolver: zodResolver(animalSchema),
    defaultValues: async () => {
      if (props.mode === "add")
        return {
          name: "",
          species: "",
          image: "",
          max_daily_checkouts: 0,
          max_daily_checkout_hours: 0,
          rest_time: 0,
          description: "",
          tier: "1",
          handling_enabled: false,
          zoo_id: "",
        };
      const res = await getAnimal(props.animalId!);

      return {
        name: res.name,
        species: res.species,
        image: res.image!,
        max_daily_checkouts: res.max_daily_checkouts,
        max_daily_checkout_hours: res.max_daily_checkout_hours,
        rest_time: res.rest_time,
        description: res.description!,
        tier: res.tier.toString(),
        handling_enabled: res.handling_enabled,
        zoo_id: res.zoo_id?.toString(),
      };
    },
  });

  if (isLoading) return <LoadingDots />;

  if (props.mode === "edit" && !props.animalId) return null;

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

      props.setOpen(false);
    } else {
      toast.error(res.data.detail);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
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
                <div className="flex w-full items-center justify-between gap-3">
                  {isImageUpload ? (
                    <Input
                      type="file"
                      placeholder="Select image"
                      className="w-full"
                      onChange={(event) => {
                        setImage(event.target.files?.[0] || null);
                        // setIsImageUpload(true);
                      }}
                    />
                  ) : (
                    <Input
                      {...field}
                      placeholder="Enter image url or upload"
                      className="w-full"
                    />
                  )}
                  <Button
                    size="sm"
                    onClick={async (e) => {
                      e.preventDefault();

                      if (isImageUploading) return;

                      if (isImageUpload && image) {
                        setIsImageUploading(true);

                        const res = await uploadFile(image);
                        if (res.status === 200) {
                          setIsImageUpload(false);
                          form.setValue("image", res.data.file_url);
                          toast.success("Image uploaded successfully");
                        } else {
                          toast.error(res.data.detail);
                        }
                        setIsImageUploading(false);
                      } else if (isImageUpload && !image) {
                        setIsImageUpload(false);
                      } else {
                        setIsImageUpload(true);
                      }
                    }}
                    disabled={isImageUploading}
                  >
                    {isImageUploading && <Spinner className="mr-2 size-4" />}
                    {isImageUpload && image
                      ? "Save"
                      : isImageUpload && !image
                        ? "Cancel"
                        : "Upload"}
                  </Button>
                </div>
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
                  onChange={(event) => field.onChange(+event.target.value)}
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
                  onChange={(event) => field.onChange(+event.target.value)}
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
                  onChange={(event) => field.onChange(+event.target.value)}
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

        <div className="flex items-center gap-12">
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
        </div>
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

        {props.mode === "edit" && (
          <AnimalDelete animalId={props.animalId!} setOpen={props.setOpen} />
        )}

        <div className="flex w-full items-center justify-center gap-3">
          <DialogClose asChild>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Spinner className="mr-2 size-4" />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function AnimalDelete(props: {
  animalId: string;
  setOpen: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"destructive"} size="sm" className="">
          Delete Animal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete animal
            record
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={async (e) => {
              e.preventDefault();

              setLoading(true);
              const res = await deleteAnimal(props.animalId);
              if (res.status === 200) {
                toast.success("Animal deleted successfully");
                queryClient.invalidateQueries({
                  queryKey: ["animals"],
                });
                setOpen(false);
                props.setOpen(false);
                navigate(0);
              } else {
                toast.error(res.data.detail);
              }
              setLoading(false);
            }}
            variant={"destructive"}
            disabled={loading}
          >
            {loading && <Spinner className="mr-2 size-4" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
