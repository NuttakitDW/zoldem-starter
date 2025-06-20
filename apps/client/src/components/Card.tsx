interface CardProps {
  suit: number
  rank: number
  faceDown?: boolean
  className?: string
  isDealing?: boolean
  dealDelay?: number
  onDealComplete?: () => void
}

const Card = ({ suit, rank, faceDown = false, className = "", isDealing = false, dealDelay = 0, onDealComplete }: CardProps) => {
  const suits = ["♥", "♦", "♣", "♠"]
  const ranks = ["", "", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
  
  const suitSymbol = suits[suit]
  const rankSymbol = ranks[rank]
  
  // Determine if card is red or black
  const isRed = suit === 0 || suit === 1 // Hearts or Diamonds
  const textColor = isRed ? "text-red-600" : "text-black"

  // Animation classes
  const dealingAnimation = isDealing ? 'animate-card-deal' : ''
  const animationDelay = dealDelay > 0 ? { animationDelay: `${dealDelay}ms` } : {}

  if (faceDown) {
    return (
      <div 
        className={`
          w-16 h-24 bg-blue-900 border border-gray-300 rounded-lg flex items-center justify-center
          shadow-md transition-transform hover:scale-105 ${dealingAnimation} ${className}
        `}
        style={animationDelay}
        onAnimationEnd={onDealComplete}
      >
        <div className="text-white text-xs font-bold">🂠</div>
      </div>
    )
  }

  return (
    <div 
      className={`
        w-16 h-24 bg-white border border-gray-300 rounded-lg flex flex-col items-center justify-between p-1
        shadow-md transition-transform hover:scale-105 ${dealingAnimation} ${className}
      `}
      style={animationDelay}
      onAnimationEnd={onDealComplete}
    >
      <div className={`text-xs font-bold ${textColor} leading-none`}>
        {rankSymbol}
      </div>
      <div className={`text-lg ${textColor}`}>
        {suitSymbol}
      </div>
      <div className={`text-xs font-bold ${textColor} leading-none transform rotate-180`}>
        {rankSymbol}
      </div>
    </div>
  )
}

export default Card