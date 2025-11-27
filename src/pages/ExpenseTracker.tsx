import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../components/ui/dialog";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { FuturisticSelect, type Option } from "../components/ui/FuturisticSelect";

type Expense = {
    id: number;
    title: string;
    amount: number;
    category: string;
    created_at: string;
};

const COLORS = [
    'rgba(147, 197, 253, 0.8)', // Light Blue
    'rgba(134, 239, 172, 0.8)', // Light Green
    'rgba(253, 224, 71, 0.8)',  // Light Yellow
    'rgba(253, 186, 116, 0.8)', // Light Orange
    'rgba(216, 180, 254, 0.8)', // Light Purple
    'rgba(249, 168, 212, 0.8)'  // Light Pink
];

export default function ExpenseTracker() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("General");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, [user]);

    const fetchExpenses = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("expenses")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setExpenses(data);
        }
        setLoading(false);
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title || !amount) return;

        setSubmitting(true);
        const amt = parseFloat(amount);

        const { data, error } = await supabase
            .from("expenses")
            .insert([{ user_id: user.id, title, amount: amt, category }])
            .select();

        if (!error && data) {
            setExpenses([data[0], ...expenses]);
            setIsAddOpen(false);
            setTitle("");
            setAmount("");
            setCategory("General");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: number) => {
        if (!user) return;

        // Optimistic update
        const oldExpenses = [...expenses];
        setExpenses(expenses.filter(e => e.id !== id));

        const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            setExpenses(oldExpenses);
            alert("Failed to delete expense");
        }
    };

    const filteredExpenses = expenses.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
    );

    const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const normalizeCategory = (cat: string) => {
        if (cat.includes("Food")) return "Food";
        if (cat.includes("Transport")) return "Transport";
        if (cat.includes("Entertainment")) return "Entertainment";
        if (cat.includes("Bills")) return "Bills";
        if (cat.includes("Shopping")) return "Shopping";
        if (cat.includes("General")) return "General";
        return cat.replace(/[^\w\s]/gi, '').trim();
    };

    // Prepare chart data
    const categoryData = filteredExpenses.reduce((acc, curr) => {
        const cleanCategory = normalizeCategory(curr.category);
        const existing = acc.find(item => item.name === cleanCategory);
        if (existing) {
            existing.value += curr.amount;
        } else {
            acc.push({ name: cleanCategory, value: curr.amount });
        }
        return acc;
    }, [] as { name: string, value: number }[]);

    const categoryOptions: Option[] = [
        { value: "General", label: "General", color: "text-blue-400" },
        { value: "Food", label: "Food", color: "text-green-400" },
        { value: "Transport", label: "Transport", color: "text-yellow-400" },
        { value: "Entertainment", label: "Entertainment", color: "text-purple-400" },
        { value: "Bills", label: "Bills", color: "text-red-400" },
        { value: "Shopping", label: "Shopping", color: "text-pink-400" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
                    <p className="text-muted-foreground">Manage your spending and track your budget.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">{filteredExpenses.length} transactions</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                                    contentStyle={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none', color: 'white' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    formatter={(value) => <span className="text-sm font-medium text-muted-foreground ml-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Transactions</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search expenses..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredExpenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No expenses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="font-medium">{expense.title}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                {normalizeCategory(expense.category)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(expense.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">₹{expense.amount.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                        <DialogClose onClick={() => setIsAddOpen(false)} />
                    </DialogHeader>
                    <form onSubmit={handleAddExpense}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="title">Title</label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="amount">Amount</label>
                                <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="category">Category</label>
                                <FuturisticSelect
                                    value={category}
                                    onChange={(val) => setCategory(val)}
                                    options={categoryOptions}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Expense
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
