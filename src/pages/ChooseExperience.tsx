import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
// import { Button } from "../components/ui/button";
import { Laptop, Smartphone } from "lucide-react";

export default function ChooseExperience() {
    const navigate = useNavigate();

    const handleSelect = (mode: 'web' | 'mobile') => {
        localStorage.setItem("viewMode", mode);
        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Choose Experience</CardTitle>
                    <p className="text-muted-foreground">Select how you want to view the dashboard</p>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <button
                        className="h-24 w-full text-lg flex flex-col items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-95 transition-transform duration-100"
                        onClick={() => handleSelect('web')}
                    >
                        <Laptop className="h-8 w-8" />
                        Web Version
                    </button>
                    <button
                        className="h-24 w-full text-lg flex flex-col items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-95 transition-transform duration-100"
                        onClick={() => handleSelect('mobile')}
                    >
                        <Smartphone className="h-8 w-8" />
                        Mobile Version
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}
