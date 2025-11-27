import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, Trash2, Search, Loader2, LayoutGrid, List as ListIcon, CheckCircle, Circle } from "lucide-react";
import { cn } from "../lib/utils";
import { FuturisticSelect, type Option } from "../components/ui/FuturisticSelect";

type Todo = {
    id: number;
    text: string;
    priority: "High" | "Medium" | "Low";
    completed: boolean;
    created_at: string;
};

export default function TodoApp() {
    const { user } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"list" | "kanban">("list");

    // Form state
    const [text, setText] = useState("");
    const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTodos();
    }, [user]);

    const fetchTodos = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("todos")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setTodos(data);
        }
        setLoading(false);
    };

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !text) return;

        setSubmitting(true);

        const { data, error } = await supabase
            .from("todos")
            .insert([{ user_id: user.id, text, priority, completed: false }])
            .select();

        if (!error && data) {
            setTodos([data[0], ...todos]);
            setText("");
            setPriority("Medium");
        }
        setSubmitting(false);
    };

    const handleToggle = async (id: number, completed: boolean) => {
        if (!user) return;

        // Optimistic update
        const updatedTodos = todos.map(t => t.id === id ? { ...t, completed } : t);
        setTodos(updatedTodos);

        await supabase
            .from("todos")
            .update({ completed })
            .eq("id", id)
            .eq("user_id", user.id);
    };

    const handleDelete = async (id: number) => {
        if (!user) return;

        const oldTodos = [...todos];
        setTodos(todos.filter(t => t.id !== id));

        const { error } = await supabase
            .from("todos")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            setTodos(oldTodos);
            alert("Failed to delete todo");
        }
    };

    const filteredTodos = todos.filter(t =>
        t.text.toLowerCase().includes(search.toLowerCase())
    );

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "High": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "Low": return "text-green-500 bg-green-500/10 border-green-500/20";
            default: return "text-muted-foreground";
        }
    };

    const priorityOptions: Option[] = [
        { value: "High", label: "High Priority", color: "text-red-400" },
        { value: "Medium", label: "Medium Priority", color: "text-yellow-400" },
        { value: "Low", label: "Low Priority", color: "text-green-400" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">Manage your daily tasks and priorities.</p>
                </div>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                    <Button
                        variant={view === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("list")}
                        className="h-8"
                    >
                        <ListIcon className="h-4 w-4 mr-2" /> List
                    </Button>
                    <Button
                        variant={view === "kanban" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("kanban")}
                        className="h-8"
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" /> Board
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleAddTodo} className="flex gap-4 items-center">
                        <Input
                            placeholder="Add a new task..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="flex-1"
                        />
                        <FuturisticSelect
                            value={priority}
                            onChange={(val) => setPriority(val as any)}
                            options={priorityOptions}
                            className="w-[180px]"
                        />
                        {/* <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select> */}
                        <Button type="submit" disabled={submitting || !text}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Add</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {view === "list" ? (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTodos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No tasks found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTodos.map((todo) => (
                                        <TableRow key={todo.id}>
                                            <TableCell>
                                                <button onClick={() => handleToggle(todo.id, !todo.completed)}>
                                                    {todo.completed ? (
                                                        <CheckCircle className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </TableCell>
                                            <TableCell className={cn("font-medium", todo.completed && "line-through text-muted-foreground")}>
                                                {todo.text}
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", getPriorityColor(todo.priority))}>
                                                    {todo.priority}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(todo.id)} className="text-muted-foreground hover:text-destructive">
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
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {(["High", "Medium", "Low"] as const).map((p) => (
                        <div key={p} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">{p} Priority</h3>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                    {filteredTodos.filter(t => t.priority === p).length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {filteredTodos.filter(t => t.priority === p).map(todo => (
                                    <Card key={todo.id} className={cn("transition-all hover:shadow-md", todo.completed && "opacity-60")}>
                                        <CardContent className="p-4 flex items-start gap-3">
                                            <button onClick={() => handleToggle(todo.id, !todo.completed)} className="mt-0.5">
                                                {todo.completed ? (
                                                    <CheckCircle className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </button>
                                            <div className="flex-1 space-y-1">
                                                <p className={cn("text-sm font-medium leading-none", todo.completed && "line-through text-muted-foreground")}>
                                                    {todo.text}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(todo.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2 -mt-2">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
