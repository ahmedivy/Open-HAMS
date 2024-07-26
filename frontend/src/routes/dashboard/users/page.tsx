import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { getUsers } from "@/api/user";
import { Sidebar } from "@/components/sidebar";
import { DataTable } from "@/components/tables/table-commons/data-table";
import { columns } from "@/components/tables/users-table/cols";
import { UserTableToolbar } from "@/components/tables/users-table/toolbar";
import { Loading } from "@/routes/loading";
import { useQuery } from "react-query";

export function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <header className="flex items-center justify-between px-2 lg:px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="m-0 w-56 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </header>
      <div className="mt-10 w-full rounded-lg border bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">All Users</h2>
        <DataTable
          data={users!}
          columns={columns}
          Toolbar={UserTableToolbar as any}
          rowHref={(row) => `/users/${row.original.id}`}
        />
      </div>
    </>
  );
}
