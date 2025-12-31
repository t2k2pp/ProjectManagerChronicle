/**
 * カードエフェクトアニメーション
 */

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardEffectProps {
    children: ReactNode;
    type: 'play' | 'attack' | 'defend' | 'special';
    isActive?: boolean;
}

/** カード使用時のアニメーション */
const playVariants: Variants = {
    initial: { scale: 1, y: 0, opacity: 1 },
    animate: {
        scale: [1, 1.2, 1],
        y: [0, -20, 0],
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

/** 攻撃エフェクト */
const attackVariants: Variants = {
    initial: { x: 0, rotate: 0 },
    animate: {
        x: [0, 50, 0],
        rotate: [0, 10, -10, 0],
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
};

/** 防御エフェクト */
const defendVariants: Variants = {
    initial: { scale: 1, borderColor: 'transparent' },
    animate: {
        scale: [1, 1.1, 1],
        boxShadow: [
            '0 0 0 0 rgba(59, 130, 246, 0)',
            '0 0 20px 10px rgba(59, 130, 246, 0.5)',
            '0 0 0 0 rgba(59, 130, 246, 0)',
        ],
        transition: { duration: 0.5 },
    },
};

/** 特殊エフェクト */
const specialVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
        scale: [1, 1.3, 1],
        rotate: [0, 360],
        transition: { duration: 0.6, ease: 'easeInOut' },
    },
};

const variantsMap = {
    play: playVariants,
    attack: attackVariants,
    defend: defendVariants,
    special: specialVariants,
};

export function CardEffect({ children, type, isActive = false }: CardEffectProps) {
    return (
        <motion.div
            variants={variantsMap[type]}
            initial="initial"
            animate={isActive ? 'animate' : 'initial'}
        >
            {children}
        </motion.div>
    );
}

/** ダメージ表示エフェクト */
interface DamageNumberProps {
    value: number;
    isPositive?: boolean;
}

export function DamageNumber({ value, isPositive = false }: DamageNumberProps) {
    return (
        <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -50, scale: 1.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}
        >
            {isPositive ? '+' : ''}{value}
        </motion.div>
    );
}

/** 勝利エフェクト */
export function VictoryEffect() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl font-bold text-yellow-400 drop-shadow-lg"
            >
                🎉 勝利！ 🎉
            </motion.div>
        </motion.div>
    );
}
