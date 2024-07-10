import { getAuthenticatedUser } from "@/api/user";
import { User } from "@/utils/types";
import { useQuery } from "react-query";

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: getAuthenticatedUser,
  });
}
