import { Link, useLocation } from "wouter";
import { Code2, LayoutDashboard, ListTodo, Trophy, Activity, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const userStr = localStorage.getItem("codenexus_user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("codenexus_user");
    setLocation("/login");
  };

  const navItems = [
    { href: "/", label: "Home", icon: Activity },
    { href: "/problems", label: "Problems", icon: ListTodo },
    { href: "/contests", label: "Contests", icon: Trophy },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  if (user) {
    navItems.push(
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/submissions", label: "Submissions", icon: Activity },
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border bg-card">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Code2 className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">CodeNexus</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{user.username}</span>
                  <span className="text-xs text-muted-foreground mt-1">Rating: {user.rating}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link href="/register">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {children}
      </main>
    </div>
  );
}
