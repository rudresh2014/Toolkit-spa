import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Card, CardContent } from "../../components/ui/card";
import { WeekOverviewChips } from "../../components/dashboard/WeekOverviewChips";
import { TodayGlance } from "../../components/dashboard/TodayGlance";
import { SevenDayHeatmap } from "../../components/dashboard/SevenDayHeatmap";
import { MonthlyProjection } from "../../components/dashboard/MonthlyProjection";
import { CompactCategoryList } from "../../components/dashboard/mobile/CompactCategoryList";
import { CompactTransactions } from "../../components/dashboard/mobile/CompactTransactions";
import { CompactProductivity } from "../../components/dashboard/mobile/CompactProductivity";
import { useWeather } from "../../hooks/useWeather";
import { CloudSun, Trophy, Flame, Calendar, CheckCircle2 } from "lucide-react";

export default function MobileDashboard() {
    const { user } = useAuth();
    const { data: weather } = useWeather();

    // State
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        tasksCompletedWeek: 0,
        habitsCompletedWeek: 0,
        weeklyExpenses: 0,
        tasksCompletedToday: 0,
        totalTasksToday: 0,
        habitsCompletedToday: 0,
        totalHabits: 0,
        todayExpenses: 0,
        sevenDayHabitData: [] as any[],
        monthlyProjection: { projected: 0, current: 0, budget: 50000, trend: 'same' as 'up' | 'down' | 'same' },
        productivityScore: 0,
        categoryData: [] as any[],
        recentTransactions: [] as any[],
        habitStats: {
            total: 0,
            completedToday: 0,
            streak: 0,
            bestDay: 'N/A'
        }
    });

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
            const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

            // 1. Fetch Expenses
            const { data: expenses } = await supabase
                .from("expenses")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            // 2. Fetch Todos
            const { data: todos } = await supabase
                .from("todos")
                .select("*")
                .eq("user_id", user?.id);

            // 3. Fetch Habits & Logs
            const { data: habits } = await supabase
                .from("habits")
                .select("*")
                .eq("user_id", user?.id);

            const { data: habitLogs } = await supabase
                .from("habit_logs")
                .select("*")
                .in("habit_id", habits?.map(h => h.id) || []);

            // --- CALCULATIONS ---

            // Expenses
            const currentMonthExpenses = expenses?.filter(e => new Date(e.created_at) >= startOfMonth) || [];
            const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

            const weeklyExpenses = expenses?.filter(e => new Date(e.created_at) >= startOfWeek)
                .reduce((sum, e) => sum + e.amount, 0) || 0;

            const todayExpenses = expenses?.filter(e => e.created_at.startsWith(todayStr))
                .reduce((sum, e) => sum + e.amount, 0) || 0;

            // Monthly Projection
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const daysPassed = now.getDate();
            const projected = daysPassed > 0 ? (currentMonthTotal / daysPassed) * daysInMonth : 0;
            const budget = 50000; // Hardcoded for now
            const expenseTrend = projected > budget ? 'up' : projected < budget ? 'down' : 'same';

            // Categories
            const categoryMap: Record<string, number> = {};
            currentMonthExpenses.forEach(e => {
                categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
            });
            const categoryData = Object.entries(categoryMap)
                .map(([name, value]) => ({
                    name,
                    value,
                    percentage: currentMonthTotal > 0 ? (value / currentMonthTotal) * 100 : 0,
                    color: 'rgba(147, 197, 253, 0.8)' // Default color, logic can be improved
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 3);

            // Assign colors
            const colors = ['#93C5FD', '#86EFAC', '#FDE047'];
            categoryData.forEach((c, i) => c.color = colors[i % colors.length]);

            // Todos
            const totalTasksToday = todos?.length || 0; // Simplified: assuming all todos are for today for now
            const tasksCompletedToday = todos?.filter(t => t.completed).length || 0;
            const tasksCompletedWeek = todos?.filter(t => t.completed && new Date(t.created_at) >= startOfWeek).length || 0; // Assuming created_at is relevant

            // Habits
            const totalHabits = habits?.length || 0;
            const habitsCompletedToday = habitLogs?.filter(l => l.date === todayStr).length || 0;
            const habitsCompletedWeek = habitLogs?.filter(l => l.date >= startOfWeekStr).length || 0;

            // 7 Day Heatmap
            const sevenDayData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dStr = d.toISOString().split('T')[0];
                const completed = habitLogs?.filter(l => l.date === dStr).length || 0;
                sevenDayData.push({
                    date: dStr,
                    completed,
                    total: totalHabits
                });
            }

            // Productivity Score
            const taskScore = totalTasksToday > 0 ? (tasksCompletedToday / totalTasksToday) : 0;
            const habitScore = totalHabits > 0 ? (habitsCompletedToday / totalHabits) : 0;
            const productivityScore = Math.round(((taskScore + habitScore) / 2) * 100);

            // Habit Stats (Best Day, Streak)
            const dayCounts: Record<string, number> = {};
            habitLogs?.forEach(l => {
                const day = new Date(l.date).toLocaleDateString('en-US', { weekday: 'long' });
                dayCounts[day] = (dayCounts[day] || 0) + 1;
            });
            const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            setStats({
                tasksCompletedWeek,
                habitsCompletedWeek,
                weeklyExpenses,
                tasksCompletedToday,
                totalTasksToday,
                habitsCompletedToday,
                totalHabits,
                todayExpenses,
                sevenDayHabitData: sevenDayData,
                monthlyProjection: { projected, current: currentMonthTotal, budget, trend: expenseTrend },
                productivityScore,
                categoryData,
                recentTransactions: expenses?.slice(0, 5).map(e => ({ ...e, type: 'expense', date: e.created_at })) || [],
                habitStats: {
                    total: totalHabits,
                    completedToday: habitsCompletedToday,
                    streak: 0, // Placeholder
                    bestDay
                }
            });

            setLoading(false);

        } catch (error) {
            console.error("Error fetching mobile dashboard data:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="space-y-4 pb-24">
            {/* 1. Header */}
            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-xl font-bold">Hello, {user?.email?.split('@')[0]}</h1>
                    <p className="text-xs text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                {weather && (
                    <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                        <CloudSun className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{Math.round(weather.main.temp)}°</span>
                    </div>
                )}
            </div>

            {/* 2. Week Overview Chips */}
            <WeekOverviewChips
                tasksCompleted={stats.tasksCompletedWeek}
                habitsCompleted={stats.habitsCompletedWeek}
                weeklyExpenses={stats.weeklyExpenses}
            />

            {/* 3. Today at a Glance */}
            <TodayGlance
                tasksCompleted={stats.tasksCompletedToday}
                totalTasks={stats.totalTasksToday}
                habitsCompleted={stats.habitsCompletedToday}
                totalHabits={stats.totalHabits}
                todayExpenses={stats.todayExpenses}
            />

            {/* 4. Habits Overview (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                        <Trophy className="h-5 w-5 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground">Total Habits</span>
                        <span className="text-lg font-bold">{stats.habitStats.total}</span>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                        <CheckCircle2 className="h-5 w-5 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground">Done Today</span>
                        <span className="text-lg font-bold">{stats.habitStats.completedToday}</span>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                        <Flame className="h-5 w-5 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground">Streak</span>
                        <span className="text-lg font-bold">{stats.habitStats.streak}</span>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                        <Calendar className="h-5 w-5 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground">Best Day</span>
                        <span className="text-lg font-bold">{stats.habitStats.bestDay.substring(0, 3)}</span>
                    </CardContent>
                </Card>
            </div>

            {/* 5. 7-Day Habit Heatmap */}
            <SevenDayHeatmap data={stats.sevenDayHabitData} />

            {/* 6. Monthly Projection */}
            <MonthlyProjection
                projected={stats.monthlyProjection.projected}
                current={stats.monthlyProjection.current}
                budget={stats.monthlyProjection.budget}
                trend={stats.monthlyProjection.trend}
            />

            {/* 7. Productivity Score */}
            <CompactProductivity score={stats.productivityScore} />

            {/* 8. Category Breakdown */}
            <CompactCategoryList data={stats.categoryData} />

            {/* 9. Transactions */}
            <CompactTransactions transactions={stats.recentTransactions} />
        </div>
    );
}
