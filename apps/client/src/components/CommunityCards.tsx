import Card from './Card'

interface CardData {
  suit: number
  rank: number
}

interface CommunityCardsProps {
  cards: CardData[]
  className?: string
}

const CommunityCards = ({ cards, className = "" }: CommunityCardsProps) => {
  // Ensure we always show 5 slots (for flop, turn, river)
  const displayCards = [...cards]
  while (displayCards.length < 5) {
    displayCards.push({ suit: -1, rank: -1 }) // Empty slot
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-sm font-medium text-white mb-2">
        Community Cards
      </div>
      <div className="flex space-x-2 bg-green-700 p-3 rounded-lg">
        {displayCards.slice(0, 5).map((card, index) => {
          if (card.suit === -1 || card.rank === -1) {
            // Empty slot
            return (
              <div
                key={`empty-${index}`}
                className="w-16 h-24 border-2 border-dashed border-green-500 rounded-lg bg-green-600 opacity-50"
              />
            )
          }
          
          return (
            <Card
              key={`${card.suit}-${card.rank}-${index}`}
              suit={card.suit}
              rank={card.rank}
              className="transition-all duration-500 ease-in-out transform"
            />
          )
        })}
      </div>
    </div>
  )
}

export default CommunityCards