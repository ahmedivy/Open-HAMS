import { getRoles } from "@/api/roles";
import { Role } from "@/utils/types";
import { useQuery } from "react-query";

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
  });
}
