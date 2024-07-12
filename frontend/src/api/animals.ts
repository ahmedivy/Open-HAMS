import { Animal } from "@/utils/types";
import instance from "./axios";

export async function getAnimals() {
  const res = await instance.get("/animals");
  return res.data as Animal[];
}

export async function getAnimal(animalId: string) {
  const res = await instance.get(`/animals/${animalId}`);
  console.log(res.data);
  return res.data as Animal;
}
