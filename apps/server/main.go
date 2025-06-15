package main

import (
	"encoding/json"
	"log"
	"os"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)


// Client represents a WebSocket client
type Client struct {
	conn     *websocket.Conn
	send     chan []byte
	hub      *Hub
	playerID string
}

// Hub maintains active clients and broadcasts messages
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mutex      sync.RWMutex
	table      *Table
}

// Table represents a poker table
type Table struct {
	players  map[string]int // playerID -> seat number
	mutex    sync.RWMutex
	nextSeat int
}

// Message represents a WebSocket message
type Message struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

// PlayerJoinedData represents the data for player_joined event
type PlayerJoinedData struct {
	PlayerID string `json:"player_id"`
	Seat     int    `json:"seat"`
}

// JoinTableRequest represents the request body for join table
type JoinTableRequest struct {
	PlayerID string `json:"player_id"`
}

// NewHub creates a new Hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		table: &Table{
			players:  make(map[string]int),
			nextSeat: 1,
		},
	}
}

// Run starts the hub
func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			log.Printf("Client registered: %s", client.playerID)

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client unregistered: %s", client.playerID)
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// AddPlayerToTable adds a player to the table and returns the seat number
func (h *Hub) AddPlayerToTable(playerID string) int {
	h.table.mutex.Lock()
	defer h.table.mutex.Unlock()

	// Check if player is already seated
	if seat, exists := h.table.players[playerID]; exists {
		return seat
	}

	// Assign next available seat
	seat := h.table.nextSeat
	h.table.players[playerID] = seat
	h.table.nextSeat++

	return seat
}

// BroadcastPlayerJoined broadcasts a player_joined event
func (h *Hub) BroadcastPlayerJoined(playerID string, seat int) {
	message := Message{
		Event: "player_joined",
		Data: PlayerJoinedData{
			PlayerID: playerID,
			Seat:     seat,
		},
	}

	messageBytes, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	h.broadcast <- messageBytes
}

// readPump pumps messages from the websocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	defer c.conn.Close()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Create and start hub
	hub := NewHub()
	go hub.run()

	app := fiber.New()

	// Enable CORS for development
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "*")
		c.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Method() == "OPTIONS" {
			return c.SendStatus(204)
		}

		return c.Next()
	})

	// WebSocket endpoint
	app.Get("/ws", func(c *fiber.Ctx) error {
		playerID := c.Query("player_id")
		if playerID == "" {
			return c.Status(400).SendString("player_id query parameter is required")
		}

		// Use websocket.FastHTTPUpgrader for Fiber compatibility
		return websocket.New(func(conn *websocket.Conn) {
			client := &Client{
				conn:     conn,
				send:     make(chan []byte, 256),
				hub:      hub,
				playerID: playerID,
			}

			hub.register <- client

			go client.writePump()
			client.readPump() // This blocks until connection closes
		})(c)
	})

	// Join table endpoint
	app.Post("/api/join-table", func(c *fiber.Ctx) error {
		var req JoinTableRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		if req.PlayerID == "" {
			return c.Status(400).JSON(fiber.Map{"error": "player_id is required"})
		}

		// Add player to table
		seat := hub.AddPlayerToTable(req.PlayerID)

		// Broadcast player joined event
		hub.BroadcastPlayerJoined(req.PlayerID, seat)

		return c.JSON(fiber.Map{
			"success": true,
			"seat":    seat,
		})
	})

	// Serve static frontend in prod
	app.Static("/", "./client/dist")

	log.Printf("Server starting on port %s", port)
	app.Listen(":" + port)
}