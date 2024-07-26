import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { useUser } from "@/api/queries";
import {
  changePasswordFormSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
  updateProfileSchema,
} from "@/api/schemas/auth";
import { updatePassword, updateUser } from "@/api/user";
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
import { getInitials } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { Spinner } from "../icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

export function GeneralSettings() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate and refetch
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (values: ChangePasswordSchema) => {
      const res = await updatePassword(values);
      if (res.status === 200) {
        toast.success("Password updated successfully");
      } else {
        toast.error(res.data.detail);
      }
    },
  });

  const updateProfileForm = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
    },
  });

  function updateProfileSubmit(values: UpdateProfileSchema) {
    updateUserMutation.mutate(values);
  }

  const changePasswordForm = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  function changePasswordSubmit(values: ChangePasswordSchema) {
    console.log(values);
    if (values.new_password !== values.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    updatePasswordMutation.mutate(values);
  }

  return (
    <section className="mt-8 w-full rounded-md bg-white p-8 shadow-sm">
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
              <AvatarImage src={user?.image!} />
              <AvatarFallback className="text-3xl">
                {getInitials(user?.first_name!, user?.last_name)}
              </AvatarFallback>
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
                  name="first_name"
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
                  name="last_name"
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
                        <Input {...field} placeholder="Enter email" readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateUserMutation.isLoading}
                >
                  {updateUserMutation.isLoading && (
                    <Spinner className="mr-2 size-4" />
                  )}
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
                  name="current_password"
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
                  name="new_password"
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
                  name="confirm_password"
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updatePasswordMutation.isLoading}
                >
                  {updatePasswordMutation.isLoading && (
                    <Spinner className="mr-2 size-4" />
                  )}
                  Update Password
                </Button>
              </form>
            </Form>
            <div className="mt-20 flex w-full flex-col gap-6">
              <Select>
                <SelectTrigger className="h-12 w-full bg-[#F5F5F5]">
                  <SelectValue placeholder="Account Deletion" />
                </SelectTrigger>
                <SelectContent>
                  {["Account Deletion"].map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="flex flex-col gap-2">
                You can deactivate your account, but keep in mind that this
                action is irreversible.
              </p>

              <div className="flex w-full items-center gap-2">
                <Button variant="secondary" className="w-full">
                  Cancel
                </Button>
                <Button className="w-full">Deactivate</Button>
              </div>
            </div>
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
              <div className="flex items-center justify-between border-t-2 p-4">
                <div className="flex flex-col justify-between">
                  <h3 className="tex-lg font-semibold">Time Format</h3>
                  <p className="text-muted-foreground">
                    Set time display preferences
                  </p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="mt-8 flex w-full flex-col rounded-lg border-2">
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
