import { useState, useEffect, useRef } from 'react'
import './poker-table.css'
import CommunityCards from './components/CommunityCards'
import Hand from './components/Hand'

interface Player {
  player_id: string
  seat: number
  chips: number
  cards?: CardData[]
}

interface CardData {
  suit: number
  rank: number
}

interface WebSocketMessage {
  event: string
  data: {
    player_id: string
    seat: number
    chips: number
  }
}

const MAX_SEATS = 10

function App() {
  const [playerID, setPlayerID] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [connected, setConnected] = useState(false)
  const [joining, setJoining] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [buyInAmount, setBuyInAmount] = useState(1000)
  const [communityCards, setCommunityCards] = useState<CardData[]>([])
  const [playerCards, setPlayerCards] = useState<CardData[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  const WS_URL = API_URL.replace('http', 'ws')

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connectWebSocket = (playerId: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const ws = new WebSocket(`${WS_URL}/ws?player_id=${encodeURIComponent(playerId)}`)
    
    ws.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        console.log('Received message:', message)

        if (message.event === 'player_joined') {
          setPlayers(prev => {
            const existing = prev.find(p => p.player_id === message.data.player_id)
            if (existing) {
              return prev
            }
            return [...prev, {
              player_id: message.data.player_id,
              seat: message.data.seat,
              chips: message.data.chips
            }]
          })
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('WebSocket disconnected')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnected(false)
    }

    wsRef.current = ws
  }

  const joinTable = async () => {
    if (!playerID.trim()) {
      alert('Please enter a player ID')
      return
    }

    setJoining(true)

    try {
      // Connect to WebSocket first
      connectWebSocket(playerID)

      // Then join the table
      const requestBody: { player_id: string; seat?: number; buy_in: number } = {
        player_id: playerID,
        buy_in: buyInAmount,
      }
      
      if (selectedSeat) {
        requestBody.seat = selectedSeat
      }

      const response = await fetch(`${API_URL}/api/join-table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Joined table:', result)
      
      // Clear selected seat after successful join
      setSelectedSeat(null)
    } catch (error) {
      console.error('Error joining table:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to join table: ${errorMessage}`)
      setConnected(false)
      if (wsRef.current) {
        wsRef.current.close()
      }
    } finally {
      setJoining(false)
    }
  }

  const isSelectableSeat = (seatNumber: number) => {
    return !connected && !players.find(p => p.seat === seatNumber)
  }

  const renderSeat = (seatNumber: number) => {
    const player = players.find(p => p.seat === seatNumber)
    const isCurrentPlayer = player?.player_id === playerID
    const isSelectable = isSelectableSeat(seatNumber)
    const isSelected = selectedSeat === seatNumber

    let seatClass = `seat seat-${seatNumber}`
    
    if (player) {
      seatClass += ' occupied'
      if (isCurrentPlayer) {
        seatClass += ' current-player'
      } else {
        seatClass += ' other-player'
      }
    } else if (isSelected) {
      seatClass += ' selected'
    } else if (isSelectable) {
      seatClass += ' selectable'
    }

    return (
      <div
        key={seatNumber}
        className={seatClass}
        onClick={() => isSelectable && setSelectedSeat(isSelected ? null : seatNumber)}
      >
        <div className="player-info">
          {player ? (
            <>
              <div className="player-name">{player.player_id}</div>
              <div className="player-chips">
                ${player.chips.toLocaleString()}
              </div>
              <div className="player-status">
                {isCurrentPlayer ? '(You)' : `Seat ${seatNumber}`}
              </div>
            </>
          ) : (
            <button className="sit-btn">
              Seat {seatNumber}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      {/* Connection Status */}
      <div className={`connection-status ${
        connected ? 'status-connected' : 'status-disconnected'
      }`}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Join Controls */}
      {!connected && (
        <div className="join-controls">
          <div className="join-form">
            <h2 style={{color: '#f2b03d', marginBottom: '15px', textAlign: 'center'}}>Join Poker Table</h2>
            
            <label htmlFor="playerID">Player Name:</label>
            <input
              id="playerID"
              type="text"
              value={playerID}
              onChange={(e) => setPlayerID(e.target.value)}
              placeholder="Enter your name"
              disabled={joining}
            />
            
            <label htmlFor="buyInAmount">Buy-in Amount:</label>
            <input
              id="buyInAmount"
              type="number"
              min="100"
              max="10000"
              step="100"
              value={buyInAmount}
              onChange={(e) => setBuyInAmount(parseInt(e.target.value) || 1000)}
              placeholder="Enter buy-in amount"
              disabled={joining}
            />
            <div style={{color: '#ccc', fontSize: '12px', textAlign: 'center'}}>
              Min: $100 | Max: $10,000
            </div>
            
            {selectedSeat && (
              <div style={{color: '#f2b03d', textAlign: 'center', fontSize: '14px'}}>
                🎯 Selected: Seat {selectedSeat}
              </div>
            )}
            
            <button
              className="join-btn"
              onClick={joinTable}
              disabled={joining || !playerID.trim() || buyInAmount < 100 || buyInAmount > 10000}
            >
              {joining ? 'Joining...' : selectedSeat ? `Join Seat ${selectedSeat} ($${buyInAmount.toLocaleString()})` : `Join Any Seat ($${buyInAmount.toLocaleString()})`}
            </button>
            
            <div style={{color: '#ccc', textAlign: 'center', fontSize: '12px'}}>
              💡 Click on an empty seat to select it
            </div>
          </div>
        </div>
      )}

      {/* Community Cards */}
      {connected && (
        <div className="community-cards-section">
          <CommunityCards cards={communityCards} className="mx-auto" />
        </div>
      )}

      {/* Poker Table Container */}
      <div className="poker-table-container">
        <div className="poker-table">
          {/* Table Center */}
          <div className="table-center">
            {!connected ? (
              <div className="join-message">Choose a seat to join the game</div>
            ) : (
              <>
                <div className="game-phase">WAITING FOR PLAYERS</div>
                <div className="community-cards">
                  {/* Community cards would be rendered here when in game */}
                </div>
                <div className="pot-display">$0</div>
              </>
            )}
          </div>

          {/* Seats positioned around the table */}
          {Array.from({ length: MAX_SEATS }, (_, i) => i + 1).map(seatNumber => 
            renderSeat(seatNumber)
          )}
        </div>
      </div>

      {/* Player's Hand */}
      {connected && playerCards.length > 0 && (
        <div className="player-hand-section">
          <Hand 
            cards={playerCards} 
            label="Your Cards"
            className="mx-auto"
          />
        </div>
      )}

      {/* Test Cards Button */}
      {connected && (
        <div className="test-controls">
          <button
            onClick={() => {
              // Demo cards for testing
              setCommunityCards([
                { suit: 0, rank: 14 }, // Ace of Hearts
                { suit: 1, rank: 13 }, // King of Diamonds  
                { suit: 2, rank: 12 }, // Queen of Clubs
              ])
              setPlayerCards([
                { suit: 0, rank: 10 }, // 10 of Hearts
                { suit: 0, rank: 11 }, // Jack of Hearts
              ])
            }}
            className="demo-btn"
          >
            Demo Cards
          </button>
          <button
            onClick={() => {
              setCommunityCards([])
              setPlayerCards([])
            }}
            className="clear-btn"
          >
            Clear Cards
          </button>
        </div>
      )}

      {/* Players List */}
      {players.length > 0 && (
        <div className="players-list">
          <h3>Players ({players.length}/{MAX_SEATS})</h3>
          {players.map((player) => (
            <div
              key={player.player_id}
              className={`player-item ${
                player.player_id === playerID ? 'current' : ''
              }`}
            >
              <span>{player.player_id}</span>
              <span>Seat {player.seat}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App