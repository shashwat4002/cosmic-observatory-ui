import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  User, 
  FolderKanban, 
  GitBranch, 
  Users, 
  BookOpen, 
  UserCheck, 
  Settings, 
  Bell, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { StarField } from "@/components/StarField";
import { cn } from "@/lib/utils";
import { useCurrentUser, useAuthActions } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

type DashboardShellProps = {
  children: ReactNode;
  className?: string;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
  { label: "Community", href: "/community", icon: Users },
  { label: "Resources", href: "/resources", icon: BookOpen },
  { label: "Matching", href: "/matching", icon: UserCheck },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const DashboardShell = ({ children, className }: DashboardShellProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useCurrentUser();
  const { logout } = useAuthActions();

  const user = data?.user;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <StarField />
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 bottom-0 z-40 glass-strong border-r border-border/40 flex flex-col"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/30">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-cyan shrink-0">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-foreground whitespace-nowrap"
              >
                Soch<span className="text-primary">X</span>
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            const linkContent = (
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary glow-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="glass-strong">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href} className="relative">{linkContent}</div>;
          })}

          {/* Admin Link */}
          {isAdmin && (
            <>
              <div className="my-4 border-t border-border/30" />
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to="/admin"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        location.pathname === "/admin"
                          ? "bg-accent/15 text-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Shield className="h-5 w-5 shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="glass-strong">
                    Admin Panel
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    location.pathname === "/admin"
                      ? "bg-accent/15 text-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Shield className="h-5 w-5 shrink-0" />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-border/30">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-muted/30",
            collapsed && "justify-center"
          )}>
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                {user?.fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role?.replace("_", " ") || "Researcher"}
                </p>
              </div>
            )}
            {!collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            )}
          </div>
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-full mt-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={cn(
          "relative z-10 min-h-screen transition-all duration-300",
          collapsed ? "ml-20" : "ml-[280px]",
          className
        )}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
