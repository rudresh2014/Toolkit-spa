import { useEffect, useState } from "react";
import { KPICard, ExpenseChart, RecentActivity } from "../components/dashboard/DashboardWidgets";
import { DollarSign, CheckCircle, Activity, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
    const { user } = useAuth();
    // const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalExpenses: 0,
        completedTasks: 0,
        activeProjects: 0,
        budgetLeft: 0 // Placeholder logic for now
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        // setLoading(true);

        // Fetch Expenses
        const { data: expenses } = await supabase
            .from("expenses")
            .select("*")
            .eq("user_id", user?.id)
            .order("created_at", { ascending: false });

        // Fetch Todos
        const { data: todos } = await supabase
            .from("todos")
            .select("*")
            .eq("user_id", user?.id);

        if (expenses && todos) {
            // Calculate Stats
            const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
            const completed = todos.filter(t => t.completed).length;
            const active = todos.filter(t => !t.completed).length; // Using active todos as "Active Projects" proxy

            setStats({
                totalExpenses: totalExp,
                completedTasks: completed,
                activeProjects: active,
                budgetLeft: 50000 - totalExp // Assuming a dummy budget of 50k for now
            });

            // Recent Activity (Top 5 expenses)
            setRecentActivity(expenses.slice(0, 5));

            // Chart Data (Group by month)
            const monthlyData = expenses.reduce((acc: any, curr: any) => {
                const date = new Date(curr.created_at);
                const month = date.toLocaleString('default', { month: 'short' });
                const existing = acc.find((item: any) => item.name === month);
                if (existing) {
                    existing.total += curr.amount;
                } else {
                    acc.push({ name: month, total: curr.amount });
                }
                return acc;
            }, []);

            // Generate last 6 months to ensure chart looks good even with sparse data
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                return d.toLocaleString('default', { month: 'short' });
            }).reverse();

            const finalChartData = last6Months.map(month => {
                const found = monthlyData.find((d: any) => d.name === month);
                return found || { name: month, total: 0 };
            });

            setChartData(finalChartData);
        }
        // setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Expenses"
                    value={`₹${stats.totalExpenses.toLocaleString('en-IN')}`}
                    icon={DollarSign}
                    trend="+2.5%" // Placeholder trend
                    trendUp={false}
                />
                <KPICard
                    title="Completed Tasks"
                    value={stats.completedTasks.toString()}
                    icon={CheckCircle}
                    trend="+12%"
                    trendUp={true}
                />
                <KPICard
                    title="Active Tasks"
                    value={stats.activeProjects.toString()}
                    icon={Activity}
                />
                <KPICard
                    title="Budget Left"
                    value={`₹${Math.max(0, stats.budgetLeft).toLocaleString('en-IN')}`}
                    icon={CreditCard}
                    trend={stats.budgetLeft < 0 ? "Over budget" : "On track"}
                    trendUp={stats.budgetLeft > 0}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ExpenseChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', total: 0 }]} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <RecentActivity activities={recentActivity} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
