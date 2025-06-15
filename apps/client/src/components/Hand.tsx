import Card from './Card'

interface CardData {
  suit: number
  rank: number
}

interface HandProps {
  cards: CardData[]
  faceDown?: boolean
  className?: string
  label?: string
}

const Hand = ({ cards, faceDown = false, className = "", label }: HandProps) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <div className="text-sm font-medium text-gray-600 mb-2">
          {label}
        </div>
      )}
      <div className="flex space-x-1">
        {cards.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            suit={card.suit}
            rank={card.rank}
            faceDown={faceDown}
            className="transition-all duration-200 ease-in-out"
          />
        ))}
      </div>
    </div>
  )
}

export default Hand