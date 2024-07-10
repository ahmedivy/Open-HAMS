import { AdminSettings } from "@/components/settings/admin";
import { GeneralSettings } from "@/components/settings/general";
import { ReportsSettings } from "@/components/settings/reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/queries/user";
import { Loading } from "@/routes/loading";
import { Heart } from "lucide-react";

export function SettingsPage() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main>
      <h1 className="mt-6 text-2xl font-bold">Settings</h1>
      <Tabs defaultValue="general" className="mt-6">
        <div className="flex w-full items-center justify-between">
          <TabsList className="bg-[#E6EEF5]">
            <TabsTrigger
              value="general"
              className="px-6 data-[state=active]:bg-primary"
            >
              General
            </TabsTrigger>
            {/* Only show these tabs to admin */}
            {user?.role?.name === "admin" && (
              <>
                <TabsTrigger
                  value="adminPermissions"
                  className="px-6 data-[state=active]:bg-primary"
                >
                  Admin Permissions
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="px-6 data-[state=active]:bg-primary"
                >
                  Reports
                </TabsTrigger>
              </>
            )}
          </TabsList>
          <div className="flex items-center gap-2 text-[#064E3B]">
            <p>Open HAMS</p>
            <Heart className="size-6" />
            <p>Hogle Zoo</p>
          </div>
        </div>
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        {/* Only show these tabs to admin */}
        {user?.role?.name === "admin" && (
          <>
            <TabsContent value="adminPermissions">
              <AdminSettings />
            </TabsContent>
            <TabsContent value="reports">
              <ReportsSettings />
            </TabsContent>
          </>
        )}
      </Tabs>
    </main>
  );
}
