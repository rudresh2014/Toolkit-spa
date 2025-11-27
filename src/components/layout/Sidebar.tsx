import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, CheckSquare, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";

export function Sidebar() {
    const { signOut } = useAuth();

    const links = [
        { to: "/", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/expense", icon: Receipt, label: "Expenses" },
        { to: "/todo", icon: CheckSquare, label: "Todos" },
    ];

    return (
        <aside className="w-64 border-r bg-card text-card-foreground flex flex-col h-full">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Toolkit
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-accent hover:text-accent-foreground",
                                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                            )
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive" onClick={signOut}>
                    <LogOut className="w-5 h-5" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
