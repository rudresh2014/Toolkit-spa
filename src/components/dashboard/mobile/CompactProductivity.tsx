import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";

type CompactProductivityProps = {
    score: number; // 0-100
    trend?: 'up' | 'down' | 'same';
};

export function CompactProductivity({ score }: CompactProductivityProps) {
    return (
        <Card>
            <CardHeader className="py-3">
                <CardTitle className="text-base flex justify-between items-center">
                    <span>Productivity Score</span>
                    <span className="text-xl font-bold text-primary">{score}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
                <Progress value={score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                    {score >= 80 ? "Excellent! Keep it up." : score >= 50 ? "Good progress." : "Let's push a bit more."}
                </p>
            </CardContent>
        </Card>
    );
}
