import { useState, useEffect, useRef } from 'react'

interface Player {
  player_id: string
  seat: number
}

interface WebSocketMessage {
  event: string
  data: {
    player_id: string
    seat: number
  }
}

function App() {
  const [playerID, setPlayerID] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [connected, setConnected] = useState(false)
  const [joining, setJoining] = useState(false)
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
              seat: message.data.seat
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
      const response = await fetch(`${API_URL}/api/join-table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_id: playerID,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Joined table:', result)
    } catch (error) {
      console.error('Error joining table:', error)
      alert('Failed to join table. Make sure the server is running.')
      setConnected(false)
    } finally {
      setJoining(false)
    }
  }

  const renderSeat = (seatNumber: number) => {
    const player = players.find(p => p.seat === seatNumber)
    const isCurrentPlayer = player?.player_id === playerID

    return (
      <div
        key={seatNumber}
        className={`
          w-20 h-20 rounded-full border-2 flex items-center justify-center text-sm font-medium
          ${player 
            ? isCurrentPlayer 
              ? 'bg-blue-500 text-white border-blue-600' 
              : 'bg-green-500 text-white border-green-600'
            : 'bg-gray-200 border-gray-300 text-gray-500'
          }
        `}
      >
        {player ? player.player_id : `Seat ${seatNumber}`}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Zoldem Poker Table
        </h1>

        {!connected ? (
          <div className="bg-white rounded-lg p-6 mb-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Join Table</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="playerID" className="block text-sm font-medium text-gray-700 mb-1">
                  Player ID
                </label>
                <input
                  id="playerID"
                  type="text"
                  value={playerID}
                  onChange={(e) => setPlayerID(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your player ID"
                  disabled={joining}
                />
              </div>
              <button
                onClick={joinTable}
                disabled={joining || !playerID.trim()}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {joining ? 'Joining...' : 'Join Table'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Connected as {playerID}
            </div>
          </div>
        )}

        {/* Poker Table */}
        <div className="relative">
          <div className="w-96 h-64 bg-green-600 rounded-full border-8 border-green-700 mx-auto relative">
            {/* Table center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg font-bold">ZOLDEM</div>
            </div>

            {/* Seats positioned around the table */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              {renderSeat(1)}
            </div>
            <div className="absolute top-8 -right-12">
              {renderSeat(2)}
            </div>
            <div className="absolute bottom-8 -right-12">
              {renderSeat(3)}
            </div>
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {renderSeat(4)}
            </div>
            <div className="absolute bottom-8 -left-12">
              {renderSeat(5)}
            </div>
            <div className="absolute top-8 -left-12">
              {renderSeat(6)}
            </div>
          </div>
        </div>

        {/* Players List */}
        {players.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Players at Table</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.player_id}
                  className={`flex justify-between items-center p-2 rounded ${
                    player.player_id === playerID ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{player.player_id}</span>
                  <span className="text-sm text-gray-600">Seat {player.seat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-8 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            connected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App