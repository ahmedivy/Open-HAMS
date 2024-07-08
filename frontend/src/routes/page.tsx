import { zodResolver } from "@hookform/resolvers/zod";
import { Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { login } from "@/api/auth";
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
import { loginSchema, LoginSchema } from "@/lib/schemas/auth";

export function LoginPage() {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginSchema) {
    console.log(values);

    const res = await login(values);
    if (res.status === 200) {
      toast.success("Login successfully");
    } else {
      toast.error("Username or password is incorrect");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-blueish">
      <div className="grid w-full flex-1 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center">
          <img
            src="serenity.png"
            alt="Scence Image"
            className="hidden h-3/4  rounded-xl lg:block"
          />
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <img src="logo.png" alt="Logo" className="size-28" />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8  space-y-8 lg:mt-12"
            >
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
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
          <Link className="mt-6 self-start text-sm" to="#">
            Forgot Password?
          </Link>
          <p className="mt-4">or</p>
          <Button
            className="mt-4 w-full"
            variant="secondary"
            onClick={() => {
              toast.error("Login with Google is not avaiable yet");
            }}
          >
            Sign In with Google
          </Button>
          <p className="mt-6 self-start text-sm">
            Didn&apos;t have an account?
            <Link to="/signup" className="ml-1 hover:underline">
              {" "}
              Sign up now
            </Link>
          </p>
        </div>
      </div>
      <footer className="mt-auto flex flex-col gap-2 border-t-2 border-white p-2 px-4 lg:p-4 lg:px-24">
        <div className="flex items-center gap-2">
          <p>Open HAMS</p>
          <Heart className="size-6" />
          <p>Hogle Zoo</p>

          <Link to="/dashboard" className="ml-auto">
            home
          </Link>
        </div>
        <div className="flex items-center gap-2 border-t pt-2">
          <p className="text-[#059669]">© 2024 Eleganza Homes</p>
          <Link to="/terms" className="ml-auto text-[#064E3B]">
            Terms
          </Link>
          <Link to="/terms" className="ml-4 text-[#064E3B]">
            Privacy
          </Link>
        </div>
      </footer>
    </main>
  );
}
