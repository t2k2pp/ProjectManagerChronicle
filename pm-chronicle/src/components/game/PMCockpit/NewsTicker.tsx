import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface NewsTickerProps {
    events: string[];
}

export function NewsTicker({ events }: NewsTickerProps) {
    const [currentEventIndex, setCurrentEventIndex] = useState(0);

    useEffect(() => {
        if (events.length === 0) return;

        const interval = setInterval(() => {
            setCurrentEventIndex((prev) => (prev + 1) % events.length);
        }, 5000); // 5秒ごとに切り替え

        return () => clearInterval(interval);
    }, [events.length]);

    if (events.length === 0) return null;

    return (
        <div className="bg-gray-900 border-b border-gray-700 h-8 flex items-center overflow-hidden relative">
            <div className="bg-blue-900 px-3 h-full flex items-center z-10 text-xs font-bold text-blue-200">
                NEWS
            </div>
            <div className="flex-1 relative h-full flex items-center px-4">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentEventIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute w-full truncate text-sm text-gray-300"
                    >
                        {events[currentEventIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
