import { getGroups } from "@/api/group";
import { getAuthenticatedUser } from "@/api/user";
import { Group, User } from "@/utils/types";
import { useQuery } from "react-query";

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: getAuthenticatedUser,
  });
}

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: getGroups,
  });
}
