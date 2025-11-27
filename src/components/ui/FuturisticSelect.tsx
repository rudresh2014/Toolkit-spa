import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export type Option = {
    value: string;
    label: string;
    color?: string;
};

interface FuturisticSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}

export function FuturisticSelect({ value, onChange, options, placeholder = "Select...", className }: FuturisticSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative w-full min-w-[140px]", className)} ref={containerRef}>
            <motion.button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    "bg-black/20 backdrop-blur-md border border-white/10 rounded-lg",
                    "hover:bg-black/30 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    isOpen && "border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] bg-black/40"
                )}
                whileTap={{ scale: 0.98 }}
            >
                <span className={cn("truncate", selectedOption?.color)}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 overflow-hidden bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5"
                    >
                        <div className="py-1 max-h-60 overflow-auto custom-scrollbar">
                            {options.map((option) => (
                                <motion.button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "relative flex items-center w-full px-4 py-2.5 text-sm text-left transition-colors",
                                        "hover:bg-white/10 hover:text-white",
                                        value === option.value ? "bg-primary/20 text-primary" : "text-muted-foreground"
                                    )}
                                    whileHover={{ x: 4 }}
                                >
                                    <span className={cn("flex-1 truncate", option.color)}>
                                        {option.label}
                                    </span>
                                    {value === option.value && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute right-3"
                                        >
                                            <Check className="w-3.5 h-3.5 text-primary" />
                                        </motion.div>
                                    )}
                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 hover:opacity-100 transition-opacity" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
