import Chip from './Chip'

interface ChipStackProps {
  totalValue: number
  className?: string
  isAnimating?: boolean
  onAnimationComplete?: () => void
}

const ChipStack = ({ totalValue, className = "", isAnimating = false, onAnimationComplete }: ChipStackProps) => {
  // Convert total value to optimal chip breakdown
  const getChipBreakdown = (value: number) => {
    const denominations = [1000, 500, 100, 50, 25, 10, 5, 1]
    const chips: { value: number; count: number }[] = []
    let remaining = value

    for (const denom of denominations) {
      if (remaining >= denom) {
        const count = Math.floor(remaining / denom)
        chips.push({ value: denom, count })
        remaining -= count * denom
      }
    }

    return chips
  }

  const chipBreakdown = getChipBreakdown(totalValue)

  return (
    <div className={`relative ${className}`}>
      {chipBreakdown.map((chipType, typeIndex) => 
        Array.from({ length: Math.min(chipType.count, 5) }, (_, chipIndex) => {
          const globalIndex = chipBreakdown
            .slice(0, typeIndex)
            .reduce((sum, type) => sum + Math.min(type.count, 5), 0) + chipIndex

          return (
            <div
              key={`${chipType.value}-${chipIndex}`}
              className="absolute"
              style={{
                zIndex: globalIndex,
                left: `${globalIndex * 2}px`,
                top: `${-globalIndex * 2}px`,
              }}
            >
              <Chip
                value={chipType.value}
                isMoving={isAnimating}
                moveDirection="stack"
                moveDelay={globalIndex * 100}
                onMoveComplete={chipIndex === 0 && typeIndex === chipBreakdown.length - 1 ? onAnimationComplete : undefined}
              />
            </div>
          )
        })
      )}
      
      {/* Show count if more than 5 chips of any type */}
      {chipBreakdown.some(chip => chip.count > 5) && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {chipBreakdown.reduce((sum, chip) => sum + chip.count, 0)}
        </div>
      )}
    </div>
  )
}

export default ChipStack