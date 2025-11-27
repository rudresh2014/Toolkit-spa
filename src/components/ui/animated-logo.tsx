import { motion } from "framer-motion";

export function AnimatedLogo() {
    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            {/* Outer Ring */}
            <motion.div
                className="absolute inset-0 border-4 border-zinc-700/50 rounded-full"
                style={{ rotateX: 45, rotateY: 45 }}
                animate={{
                    rotateX: [45, 405],
                    rotateY: [45, 405],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Middle Ring */}
            <motion.div
                className="absolute inset-4 border-4 border-zinc-600/50 rounded-full"
                style={{ rotateX: -45, rotateY: -45 }}
                animate={{
                    rotateX: [-45, -405],
                    rotateY: [-45, -405],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Inner Ring */}
            <motion.div
                className="absolute inset-8 border-4 border-zinc-500/50 rounded-full"
                style={{ rotateX: 90, rotateY: 0 }}
                animate={{
                    rotateX: [90, 450],
                    rotateY: [0, 360],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Core Cube */}
            <motion.div
                className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <div className="absolute inset-0 bg-white/20 blur-sm rounded-xl" />
            </motion.div>
        </div>
    );
}
