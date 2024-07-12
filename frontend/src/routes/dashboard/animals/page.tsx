import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus } from "lucide-react";

import { getAnimals } from "@/api/animals";
import { AnimalModel } from "@/components/models/animal-model";
import { Sidebar } from "@/components/sidebar";
import { animalTableColumns } from "@/components/tables/animals-table/cols";
import { AnimalTableToolbar } from "@/components/tables/animals-table/toolbar";
import { DataTable } from "@/components/tables/table-commons/data-table";
import { Loading } from "@/routes/loading";
import { useQuery } from "react-query";

export function AnimalsPage() {
  const { data: animals, isLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: getAnimals,
  });

  if (isLoading) return <Loading />;

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
        <div className="ml-auto">
          <AnimalModel mode="add">
            <Button>
              <Plus className="mr-2 size-4" />
              Add New Animal
            </Button>
          </AnimalModel>
        </div>
      </header>
      <div className="mt-10 w-full rounded-lg border bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">All Animals</h2>
        {/* @ts-ignore */}
        <DataTable data={animals!} columns={animalTableColumns} Toolbar={AnimalTableToolbar} />
      </div>
    </>
  );
}
