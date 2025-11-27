import { Moon, Sun, Clock } from "lucide-react";
import { useTheme } from "../theme-provider";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

export function Topbar() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatName = (email: string | undefined) => {
        if (!email) return "User";
        const namePart = email.split('@')[0];
        const nameWithoutNumbers = namePart.replace(/[0-9]/g, '');
        return nameWithoutNumbers.charAt(0).toUpperCase() + nameWithoutNumbers.slice(1);
    };

    const formattedDate = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    return (
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-6">
                <h2 className="text-xl font-semibold">
                    Welcome back, <span className="text-primary">{formatName(user?.email)}</span>
                </h2>
                <div className="h-4 w-[1px] bg-border hidden md:block" />
                <p className="text-sm text-muted-foreground flex items-center gap-2 hidden md:flex">
                    <Clock className="h-4 w-4" />
                    {formattedDate} • {formattedTime}
                </p>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {user?.email?.[0].toUpperCase()}
                </div>
            </div>
        </header>
    );
}
