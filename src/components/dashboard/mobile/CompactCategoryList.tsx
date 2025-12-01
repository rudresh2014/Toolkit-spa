import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";

import { useNavigate } from "react-router-dom";

type CategoryData = {
    name: string;
    value: number;
    color: string;
    percentage: number;
};

type CompactCategoryListProps = {
    data: CategoryData[];
};

export function CompactCategoryList({ data }: CompactCategoryListProps) {
    const navigate = useNavigate();
    const topCategories = data.slice(0, 3);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">Top Categories</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => navigate('/expense')}>
                    View All
                </Button>
            </CardHeader>
            <CardContent className="pb-3 pt-0 gap-3 grid">
                {topCategories.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{cat.percentage.toFixed(0)}%</span>
                            <span className="text-sm font-semibold">₹{cat.value.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
