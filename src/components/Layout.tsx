import { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { MessageCircle, CreditCard, Home, Settings, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { 
      icon: MessageCircle, 
      label: "Chats", 
      path: "/", 
      isActive: location.pathname === "/" 
    },
    { 
      icon: CreditCard, 
      label: "Pay", 
      path: "/pay", 
      isActive: location.pathname.startsWith("/pay") 
    },
    { 
      icon: Home, 
      label: "Dashboard", 
      path: "/dashboard", 
      isActive: location.pathname === "/dashboard" 
    },
    { 
      icon: Briefcase, 
      label: "Services", 
      path: "/services", 
      isActive: location.pathname.startsWith("/services") 
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/settings", 
      isActive: location.pathname.startsWith("/settings") 
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-display">
      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200",
                  item.isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon 
                  size={24} 
                  className={cn(
                    "transition-transform duration-200",
                    item.isActive && "scale-110"
                  )} 
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;