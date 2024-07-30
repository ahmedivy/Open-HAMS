import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import { changePassword } from "@/api/auth";
import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";

const changePasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
  confirm_password: z.string().min(8),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export function ChangePasswordPage() {
  const [searchParams, _] = useSearchParams();
  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      token: searchParams.get("token") || "",
      password: "",
      confirm_password: "",
    },
  });
  const navigate = useNavigate();

  const token = searchParams.get("token");

  if (!token) {
    return <div>Invalid token</div>;
  }

  async function onSubmit(values: ChangePasswordSchema) {
    if (values.password !== values.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await changePassword(values.password, token!);
    if (res.status === 200) {
      toast.success(res.data.message);
      navigate("/");
    } else {
      toast.error(res.data.detail);
    }
  }

  return (
    <div className="mt-4 w-full max-w-96 space-y-4">
      <h1 className="text-center text-2xl font-semibold">Change Password</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter new password"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Confirm your new password"
                    type="password"
                  />
                </FormControl>
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
            Change Password
          </Button>
        </form>
      </Form>
    </div>
  );
}
