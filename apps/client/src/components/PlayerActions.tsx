import { useState } from 'react'

interface PlayerActionsProps {
  isPlayerTurn: boolean
  currentBet: number
  playerChips: number
  minimumRaise: number
  onFold: () => void
  onCall: () => void
  onRaise: (amount: number) => void
  onCheck: () => void
  canCheck: boolean
  canCall: boolean
  callAmount: number
}

function PlayerActions({
  isPlayerTurn,
  currentBet,
  playerChips,
  minimumRaise,
  onFold,
  onCall,
  onRaise,
  onCheck,
  canCheck,
  canCall,
  callAmount
}: PlayerActionsProps) {
  const [raiseAmount, setRaiseAmount] = useState(minimumRaise)
  const [showRaiseInput, setShowRaiseInput] = useState(false)

  if (!isPlayerTurn) {
    return null
  }

  const handleRaiseClick = () => {
    if (showRaiseInput) {
      onRaise(raiseAmount)
      setShowRaiseInput(false)
    } else {
      setShowRaiseInput(true)
    }
  }

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRaiseAmount(parseInt(event.target.value))
  }

  const maxRaise = Math.min(playerChips, playerChips)
  const canRaise = raiseAmount >= minimumRaise && raiseAmount <= maxRaise

  return (
    <div className="player-actions">
      <div className="action-panel">
        <div className="action-info">
          <div className="action-prompt">Your turn - Choose an action</div>
          <div className="betting-info">
            <span className="current-bet">Current bet: ${currentBet}</span>
            <span className="player-chips">Your chips: ${playerChips}</span>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="action-btn fold-btn"
            onClick={onFold}
          >
            Fold
          </button>

          {canCheck && (
            <button
              className="action-btn check-btn"
              onClick={onCheck}
            >
              Check
            </button>
          )}

          {canCall && (
            <button
              className="action-btn call-btn"
              onClick={onCall}
            >
              Call ${callAmount}
            </button>
          )}

          <button
            className={`action-btn raise-btn ${showRaiseInput ? 'active' : ''}`}
            onClick={handleRaiseClick}
            disabled={minimumRaise > playerChips}
          >
            {showRaiseInput ? `Raise $${raiseAmount}` : 'Raise'}
          </button>
        </div>

        {showRaiseInput && (
          <div className="raise-controls">
            <div className="raise-input-container">
              <label htmlFor="raise-slider" className="raise-label">
                Raise Amount: ${raiseAmount}
              </label>
              <input
                id="raise-slider"
                type="range"
                min={minimumRaise}
                max={maxRaise}
                value={raiseAmount}
                onChange={handleSliderChange}
                className="raise-slider"
              />
              <div className="slider-labels">
                <span className="min-label">Min: ${minimumRaise}</span>
                <span className="max-label">Max: ${maxRaise}</span>
              </div>
            </div>
            
            <div className="raise-presets">
              <button
                className="preset-btn"
                onClick={() => setRaiseAmount(minimumRaise)}
              >
                Min
              </button>
              <button
                className="preset-btn"
                onClick={() => setRaiseAmount(Math.floor(currentBet * 2))}
                disabled={Math.floor(currentBet * 2) > maxRaise}
              >
                2x Pot
              </button>
              <button
                className="preset-btn"
                onClick={() => setRaiseAmount(Math.floor(currentBet * 3))}
                disabled={Math.floor(currentBet * 3) > maxRaise}
              >
                3x Pot
              </button>
              <button
                className="preset-btn"
                onClick={() => setRaiseAmount(maxRaise)}
              >
                All-In
              </button>
            </div>

            <div className="raise-actions">
              <button
                className="action-btn cancel-btn"
                onClick={() => setShowRaiseInput(false)}
              >
                Cancel
              </button>
              <button
                className="action-btn confirm-raise-btn"
                onClick={() => {
                  onRaise(raiseAmount)
                  setShowRaiseInput(false)
                }}
                disabled={!canRaise}
              >
                Confirm Raise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerActions