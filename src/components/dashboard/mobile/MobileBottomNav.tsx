import { Home, ListTodo, Repeat, Receipt, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { supabase } from "../../../lib/supabase";

export function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        localStorage.removeItem("viewMode");
        await supabase.auth.signOut();
        navigate("/login");
    };

    const navItems = [
        { icon: Home, label: "Home", path: "/" },
        { icon: ListTodo, label: "Todos", path: "/todo" },
        { icon: Repeat, label: "Habits", path: "/habits" },
        { icon: Receipt, label: "Expenses", path: "/expense" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform duration-100",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-destructive active:scale-95 transition-transform duration-100"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
