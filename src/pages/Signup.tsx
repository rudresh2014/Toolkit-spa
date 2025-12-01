import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AnimatedLogo } from "../components/ui/animated-logo";

export default function Signup() {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { session } = useAuth();

    if (session) {
        navigate("/");
        return null;
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Password Validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{6,}$/;
        if (!passwordRegex.test(password)) {
            setError("Password must be at least 6 characters and include a letter, a number, and a special character.");
            return;
        }

        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName,
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            // Show success message or redirect
            alert("Check your email for the confirmation link!");
            navigate("/login");
        }
    };

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-zinc-900">
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900" />

                {/* Top Logo */}
                <div className="relative z-20 flex items-center text-2xl font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    Toolkit
                </div>

                {/* Centered Animated Element */}
                <div className="relative z-20 flex flex-1 items-center justify-center">
                    <AnimatedLogo />
                </div>

                {/* Bottom Quote */}
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This library has saved me countless hours of work and
                            helped me deliver stunning designs to my clients faster than
                            ever before.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] text-white">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight flex flex-col items-center justify-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                            >
                                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                            </svg>
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>

                    <Card className="border-0 shadow-none bg-transparent">
                        <CardContent className="grid gap-4 p-0">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-md text-sm">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSignup}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Input
                                            id="displayName"
                                            placeholder="Display Name"
                                            type="text"
                                            autoCapitalize="words"
                                            autoComplete="name"
                                            disabled={loading}
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            required
                                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-muted-foreground"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Input
                                            id="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            disabled={loading}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-muted-foreground"
                                        />
                                    </div>
                                    <div className="grid gap-2 relative">
                                        <Input
                                            id="password"
                                            placeholder="Password"
                                            type={showPassword ? "text" : "password"}
                                            autoCapitalize="none"
                                            autoComplete="new-password"
                                            disabled={loading}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-muted-foreground transition-all duration-300 pr-10 ${password && /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{6,}$/.test(password)
                                                ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                                : ""
                                                }`}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-white"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">
                                                {showPassword ? "Hide password" : "Show password"}
                                            </span>
                                        </Button>
                                    </div>
                                    <Button disabled={loading} className="bg-white text-black hover:bg-zinc-200">
                                        {loading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Sign Up
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 p-0 mt-4">
                            <div className="text-sm text-muted-foreground text-center">
                                Already have an account?{" "}
                                <Link to="/login" className="underline underline-offset-4 hover:text-white">
                                    Login
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
