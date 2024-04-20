import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage } from "../ui/avatar";

import { z } from "zod";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Switch } from "../ui/switch";

export function GeneralSettings() {
  const updateProfileSchema = z.object({
    firstname: z
      .string()
      .min(2, "First name is too short")
      .max(50, "First name is too long"),
    lastname: z
      .string()
      .min(2, "Last name is too short")
      .max(50, "Last name is too long"),
    email: z.string().email(),
  });

  const updateProfileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function updateProfileSubmit(values) {
    console.log(values);
  }

  const changePasswordFormSchema = z.object({
    currentPassword: z.string().min(8).max(50),
    newPassword: z.string().min(8).max(50),
    confirmPassword: z.string().min(8).max(50),
  });

  const changePasswordForm = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function changePasswordSubmit(values) {
    console.log(values);
  }

  return (
    <section className="mt-8 w-full bg-white p-8">
      <Tabs defaultValue="userPreferences" className="mt-6">
        <TabsList className="bg-inherit">
          <TabsTrigger
            value="userPreferences"
            className="px-4 data-[state=active]:border-2  data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
          >
            User Preferences
          </TabsTrigger>
          <TabsTrigger
            value="systemPreferences"
            className="px-4 data-[state=active]:border-2  data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
          >
            System Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="userPreferences">
          <div className="mt-10 flex max-w-[500px] flex-col p-6">
            <Avatar className="size-32">
              <AvatarImage src="https://avartation-api.vercel.app/api?name=John+Doe" />
            </Avatar>
            <h1 className="mt-6 text-xl font-bold">Update Profile</h1>
            <p className="mt-3 text-muted-foreground">Personal Information</p>
            <Form {...updateProfileForm}>
              <form
                onSubmit={updateProfileForm.handleSubmit(updateProfileSubmit)}
                className="mt-8 w-full space-y-8"
              >
                <FormField
                  control={updateProfileForm.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter first name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateProfileForm.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateProfileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Save
                </Button>
              </form>
            </Form>
            <h1 className="mt-10 text-xl font-bold">Security</h1>
            <Form {...changePasswordForm}>
              <form
                onSubmit={changePasswordForm.handleSubmit(changePasswordSubmit)}
                className="mt-8 w-full space-y-8"
              >
                <FormField
                  control={changePasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter current password"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
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
                  control={changePasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Confirm new password"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Update Password
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
        <TabsContent value="systemPreferences">
          <div className="mt-10 flex max-w-[500px] flex-col p-6">
            <div className="flex w-full flex-col rounded-lg border-2">
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-col justify-between">
                  <h3 className="tex-lg font-semibold">Date Format</h3>
                  <p className="text-muted-foreground">
                    Change date format system-wide
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 border-t-2">
                <div className="flex flex-col justify-between">
                  <h3 className="tex-lg font-semibold">Time Format</h3>
                  <p className="text-muted-foreground">
                   Set time display preferences
                  </p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex w-full flex-col rounded-lg border-2 mt-8">
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-col justify-between">
                  <h3 className="tex-lg font-semibold">Email Notifications</h3>
                  <p className="text-muted-foreground">
                    Enable email notifications
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
