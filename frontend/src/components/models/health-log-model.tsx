import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { createAnimalHealthLog } from "@/api/animals";
import {
  AnimalHealthLogSchema,
  animalHealthLogSchema,
} from "@/api/schemas/animal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { Spinner } from "../icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";

export function NewHealthLogModel({ animalId }: { animalId: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<AnimalHealthLogSchema>({
    resolver: zodResolver(animalHealthLogSchema),
    defaultValues: {
      details: "",
    },
  });

  async function onSubmit(values: AnimalHealthLogSchema) {
    console.log(values);
    const res = await createAnimalHealthLog(animalId, values);
    if (res.status === 200) {
      toast.success(res.data.message);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["animal_health_log", animalId],
      });
    } else {
      toast.error(res.data.detail);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Add Health Log</Button>
      </DialogTrigger>
      <DialogContent className="bg-model">
        <div className="grid gap-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-1"
            >
              <div className="flex items-center justify-between">
                <DialogTitle>New Health Log</DialogTitle>
                <Button size="sm" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Spinner className="mr-2 size-4" />
                  )}
                  Submit
                </Button>
              </div>
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add health details..."
                      />
                    </FormControl>
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
