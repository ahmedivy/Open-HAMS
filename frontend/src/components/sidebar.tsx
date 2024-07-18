import { logout } from "@/api/auth";
import { useUser } from "@/api/queries";
import { cn } from "@/utils";
import {
  Activity,
  Dog,
  EllipsisVertical,
  LayoutDashboard,
  User,
} from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingDots } from "./icons";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Search } from "./ui/input";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser();

  const routes = useMemo(() => {
    return [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        active: location.pathname === "/dashboard",
      },
      {
        title: "Animals",
        icon: Dog,
        path: "/animals",
        active: location.pathname.startsWith("/animals"),
      },
      {
        title: "Events",
        icon: Activity,
        path: "/events",
        active: location.pathname.startsWith("/events"),
      },
      {
        title: "Users",
        icon: User,
        path: "/users",
        active: location.pathname.startsWith("/users"),
      },
    ];
  }, [location.pathname]);

  return (
    <aside className="flex h-screen w-full flex-col border-r bg-background p-4">
      <Link className="flex items-center gap-2" to="/">
        <img src="/logo.png" alt="logo" className="size-7" />
        <h1 className="text-[20px] font-bold tracking-tight">Open HAMS</h1>
      </Link>
      <Search placeholder="Search..." className="mt-16" name="q" />
      <nav className="mt-4 space-y-1">
        {routes.map((route) => (
          <SidebarItem key={route.path} {...route} />
        ))}
      </nav>
      {isLoading ? (
        <div className="mb-2 mt-auto flex w-full items-center justify-center gap-2">
          <LoadingDots className="mx-auto size-4" />
        </div>
      ) : (
        <Link className="mb-2 mt-auto flex w-full" to="/settings">
          <Avatar>
            <AvatarImage src="/placeholder-avatar.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="ml-2 flex flex-col">
            <span className="text-[14px] font-bold">{`${user?.first_name}`}</span>
            <span className="text-[12px] text-muted-foreground">
              Account Settings
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"icon"} className="ml-auto">
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  toast.success("Logged out successfully");
                  navigate("/");
                }}
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Link>
      )}
    </aside>
  );
}

function SidebarItem({
  title,
  icon: Icon,
  active,
  path,
}: {
  title: string;
  icon: any;
  active: boolean;
  path: string;
}) {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 rounded-md p-2",
        active ? "bg-muted" : "hover:bg-muted",
      )}
    >
      <Icon className="size-4 font-semibold text-[#374151] dark:text-white" />
      <span className="text-[14px] text-muted-foreground">{title}</span>
    </Link>
  );
}
