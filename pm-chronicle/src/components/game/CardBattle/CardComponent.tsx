/**
 * カードコンポーネント
 * 交渉カードの表示
 */

import type { NegotiationCard } from './cardData';
import { CARD_TYPE_COLORS, CARD_TYPE_LABELS, RARITY_COLORS } from './cardData';

interface CardProps {
    card: NegotiationCard;
    isPlayable?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
}

export function Card({
    card,
    isPlayable = true,
    isSelected = false,
    onClick,
    size = 'md',
}: CardProps) {
    const sizeClasses = {
        sm: 'w-24 h-36',
        md: 'w-32 h-48',
        lg: 'w-40 h-60',
    };

    const typeColor = CARD_TYPE_COLORS[card.type];
    const rarityColor = RARITY_COLORS[card.rarity];

    return (
        <div
            className={`
        ${sizeClasses[size]}
        rounded-xl border-2 overflow-hidden cursor-pointer
        transition-all duration-200 transform
        ${isSelected ? 'scale-110 shadow-xl ring-2 ring-yellow-400' : ''}
        ${isPlayable ? 'hover:scale-105 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}
      `}
            style={{
                borderColor: typeColor,
                background: `linear-gradient(180deg, ${typeColor}20 0%, #1f2937 50%)`,
            }}
            onClick={isPlayable ? onClick : undefined}
        >
            {/* コスト表示 */}
            <div
                className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: typeColor }}
            >
                {card.cost}
            </div>

            {/* パワー表示 */}
            <div
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gray-700"
            >
                {card.power}
            </div>

            {/* カード内容 */}
            <div className="h-full flex flex-col p-2 pt-8">
                {/* カードタイプ */}
                <div
                    className="text-xs text-center rounded py-0.5 mb-1"
                    style={{ backgroundColor: typeColor, color: 'white' }}
                >
                    {CARD_TYPE_LABELS[card.type]}
                </div>

                {/* カード名 */}
                <div className="text-center text-white font-bold text-sm mb-1 flex-shrink-0">
                    {card.name}
                </div>

                {/* 説明 */}
                <div className="flex-1 text-center text-gray-300 text-xs overflow-hidden">
                    {card.description}
                </div>

                {/* レアリティ表示 */}
                <div className="flex justify-center gap-0.5 mt-1">
                    {Array.from({ length: card.rarity === 'COMMON' ? 1 : card.rarity === 'UNCOMMON' ? 2 : card.rarity === 'RARE' ? 3 : 4 }).map((_, i) => (
                        <span
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: rarityColor }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** カード手札表示 */
export function CardHand({
    cards,
    selectedCardId,
    onSelectCard,
    playerMana,
}: {
    cards: NegotiationCard[];
    selectedCardId?: string;
    onSelectCard: (card: NegotiationCard) => void;
    playerMana: number;
}) {
    return (
        <div className="flex justify-center gap-2 p-4">
            {cards.map((card, index) => (
                <div
                    key={card.id}
                    className="transform transition-transform hover:-translate-y-2"
                    style={{
                        transform: `rotate(${(index - (cards.length - 1) / 2) * 5}deg)`,
                    }}
                >
                    <Card
                        card={card}
                        isPlayable={card.cost <= playerMana}
                        isSelected={selectedCardId === card.id}
                        onClick={() => onSelectCard(card)}
                        size="md"
                    />
                </div>
            ))}
        </div>
    );
}
