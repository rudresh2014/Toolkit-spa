import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export function KPICard({ title, value, icon: Icon, trend, trendUp }: { title: string, value: string, icon: any, trend?: string, trendUp?: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {trendUp ? <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" /> : <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />}
                        <span className={trendUp ? "text-green-500" : "text-red-500"}>{trend}</span>
                        <span className="ml-1">from last month</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function ExpenseChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'hsl(var(--foreground))',
                        boxShadow: 'none'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Total']}
                />
                <Bar
                    dataKey="total"
                    fill="url(#colorTotal)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    animationDuration={1500}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function RecentActivity({ activities }: { activities: any[] }) {
    if (activities.length === 0) {
        return <div className="text-sm text-muted-foreground">No recent activity.</div>;
    }

    return (
        <div className="space-y-8">
            {activities.map((activity) => (
                <div className="flex items-center" key={activity.id}>
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-4 space-y-2">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                            {activity.category}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">
                        -₹{activity.amount.toLocaleString('en-IN')}
                    </div>
                </div>
            ))}
        </div>
    );
}
