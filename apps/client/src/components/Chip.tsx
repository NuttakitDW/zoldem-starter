interface ChipProps {
  value: number
  className?: string
  isMoving?: boolean
  moveDirection?: 'to-pot' | 'to-player' | 'stack'
  moveDelay?: number
  onMoveComplete?: () => void
}

const Chip = ({ 
  value, 
  className = "", 
  isMoving = false, 
  moveDirection = 'to-pot',
  moveDelay = 0,
  onMoveComplete 
}: ChipProps) => {
  // Chip colors based on value
  const getChipColor = (value: number) => {
    if (value >= 1000) return 'bg-black text-white border-gray-600' // Black
    if (value >= 500) return 'bg-purple-600 text-white border-purple-800' // Purple
    if (value >= 100) return 'bg-green-600 text-white border-green-800' // Green
    if (value >= 50) return 'bg-blue-600 text-white border-blue-800' // Blue
    if (value >= 25) return 'bg-red-600 text-white border-red-800' // Red
    if (value >= 10) return 'bg-yellow-500 text-black border-yellow-700' // Yellow
    if (value >= 5) return 'bg-orange-500 text-white border-orange-700' // Orange
    return 'bg-white text-black border-gray-400' // White
  }

  // Animation classes based on movement direction
  const getAnimationClass = () => {
    if (!isMoving) return ''
    
    switch (moveDirection) {
      case 'to-pot':
        return 'animate-chip-slide'
      case 'stack':
        return 'animate-chip-stack'
      default:
        return 'animate-chip-slide'
    }
  }

  const chipColor = getChipColor(value)
  const animationClass = getAnimationClass()
  const animationDelay = moveDelay > 0 ? { animationDelay: `${moveDelay}ms` } : {}

  return (
    <div 
      className={`
        w-8 h-8 rounded-full border-2 flex items-center justify-center
        shadow-md cursor-pointer transition-smooth hover-lift
        ${chipColor} ${animationClass} ${className}
      `}
      style={animationDelay}
      onAnimationEnd={onMoveComplete}
    >
      <span className="text-xs font-bold">
        {value >= 1000 ? `${value / 1000}K` : value}
      </span>
    </div>
  )
}

export default Chip