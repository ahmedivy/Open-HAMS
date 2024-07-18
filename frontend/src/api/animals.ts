import { Animal } from "@/utils/types";
import instance from "./axios";

export async function getAnimals() {
  const res = await instance.get("/animals");
  return res.data as Animal[];
}

export async function getAnimal(animalId: string) {
  const res = await instance.get(`/animals/${animalId}`);
  if (res.status !== 200) throw new Error(res.data);
  return res.data as Animal;
}

export type AnimalStatus = {
  animal: Animal;
  status: "available" | "unavailable" | "checked_out";
  status_description: string;
};

export async function getAnimalsWithStatus(zoo_id?: string) {
  const res = await instance.get(
    "/animals/status",
    zoo_id
      ? {
          params: { zoo_id },
        }
      : {},
  );
  return res.data as AnimalStatus[];
}
