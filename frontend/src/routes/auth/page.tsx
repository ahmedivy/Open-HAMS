import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { login, logout } from "@/api/auth";
import { loginSchema, LoginSchema } from "@/api/schemas/auth";
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

export function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (localStorage.getItem("token")) {
    return (
      <div className="mt-2 grid w-full max-w-96 place-content-center gap-6 space-y-4 lg:mt-12">
        <span className="text-center">You are logged in</span>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              window.location.reload();
            }}
          >
            Log Out
          </Button>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function onSubmit(values: LoginSchema) {
    console.log(values);

    const res = await login(values);
    if (res.status === 200) {
      toast.success("Login successfully");
      navigate("/dashboard");
    } else {
      toast.error("Username or password is incorrect");
    }
  }

  return (
    <div className="mt-2 w-full max-w-96 space-y-4 lg:mt-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username or Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your username or email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your password"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Spinner className="mr-2 size-4" />
              )}
              Log In
            </Button>
            <Link className="self-start text-sm" to="/reset-password">
              Forgot Password?
            </Link>
          </div>
        </form>
      </Form>

      <p className="mt-4 text-center">or</p>
      <Button
        className="mt-4 w-full"
        variant="secondary"
        onClick={() => {
          toast.error("Login with Google is not available yet");
        }}
      >
        Log In with Google
      </Button>
      <p className="mt-6 self-start text-sm">
        Didn&apos;t have an account?
        <Link to="/signup" className="ml-1 hover:underline">
          {" "}
          Sign up now
        </Link>
      </p>
    </div>
  );
}
