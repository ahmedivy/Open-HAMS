import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { resetPassword } from "@/api/auth";
import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const navigate = useNavigate();

  async function onSubmit(values: ResetPasswordSchema) {
    const res = await resetPassword(values);
    if (res.status === 200) {
      toast.success(res.data.message);
      navigate("/");
    } else {
      toast.error(res.data.detail);
    }
  }

  return (
    <div className="mt-4 w-full max-w-96 space-y-4">
      <h1 className="text-center text-2xl font-semibold">Reset Password</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your email" />
                </FormControl>
                <FormDescription>
                  We will send you a link to reset your password
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Spinner className="mr-2 size-4" />}
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  );
}
