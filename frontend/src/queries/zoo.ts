import { getZoos } from "@/api/zoo";
import { Zoo } from "@/utils/types";
import { useQuery } from "react-query";

export function useZoos() {
  return useQuery<Zoo[]>({
    queryKey: ["zoos"],
    queryFn: getZoos,
  });
}
