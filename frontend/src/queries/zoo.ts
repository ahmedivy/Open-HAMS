import { getAnimal } from "@/api/animals";
import { getZoos } from "@/api/zoo";
import { Animal, Zoo } from "@/utils/types";
import { useQuery } from "react-query";

export function useZoos() {
  return useQuery<Zoo[]>({
    queryKey: ["zoos"],
    queryFn: getZoos,
  });
}

export function useAnimal(animalId: string) {
  return useQuery<Animal>({
    queryKey: ["animal", animalId],
    queryFn: () => getAnimal(animalId),
  });
}
