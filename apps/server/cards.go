package main

import (
	"math/rand"
	"time"

	"github.com/chehsunliu/poker"
)

// Suit represents the suit of a playing card
type Suit int

const (
	Hearts Suit = iota
	Diamonds
	Clubs
	Spades
)

// Rank represents the rank of a playing card
type Rank int

const (
	Two Rank = iota + 2
	Three
	Four
	Five
	Six
	Seven
	Eight
	Nine
	Ten
	Jack
	Queen
	King
	Ace
)

// Card represents a single playing card
type Card struct {
	Suit Suit `json:"suit"`
	Rank Rank `json:"rank"`
}

// String returns a string representation of the card
func (c Card) String() string {
	suits := []string{"♥", "♦", "♣", "♠"}
	ranks := []string{"", "", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"}
	return ranks[c.Rank] + suits[c.Suit]
}

// ToPokerCard converts our Card to the poker library's card format
func (c Card) ToPokerCard() poker.Card {
	// Convert our suit/rank to poker library string format
	// The poker library uses string notation like "As", "Kh", "Qd", "Jc"
	suits := []string{"h", "d", "c", "s"} // hearts, diamonds, clubs, spades
	ranks := []string{"", "", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"}
	
	cardString := ranks[c.Rank] + suits[c.Suit]
	return poker.NewCard(cardString)
}

// Deck represents a deck of playing cards
type Deck struct {
	Cards []Card `json:"cards"`
}

// NewDeck creates a new standard 52-card deck
func NewDeck() *Deck {
	deck := &Deck{Cards: make([]Card, 0, 52)}
	
	for suit := Hearts; suit <= Spades; suit++ {
		for rank := Two; rank <= Ace; rank++ {
			deck.Cards = append(deck.Cards, Card{Suit: suit, Rank: rank})
		}
	}
	
	return deck
}

// Shuffle randomizes the order of cards in the deck
func (d *Deck) Shuffle() {
	rand.Seed(time.Now().UnixNano())
	for i := len(d.Cards) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		d.Cards[i], d.Cards[j] = d.Cards[j], d.Cards[i]
	}
}

// Deal removes and returns the top card from the deck
func (d *Deck) Deal() *Card {
	if len(d.Cards) == 0 {
		return nil
	}
	
	card := d.Cards[len(d.Cards)-1]
	d.Cards = d.Cards[:len(d.Cards)-1]
	return &card
}

// DealHand deals a specified number of cards
func (d *Deck) DealHand(numCards int) []Card {
	hand := make([]Card, 0, numCards)
	for i := 0; i < numCards && len(d.Cards) > 0; i++ {
		card := d.Deal()
		if card != nil {
			hand = append(hand, *card)
		}
	}
	return hand
}

// Remaining returns the number of cards left in the deck
func (d *Deck) Remaining() int {
	return len(d.Cards)
}

// Hand represents a poker hand with evaluation capabilities
type Hand struct {
	Cards []Card `json:"cards"`
	Rank  int    `json:"rank"`
	Name  string `json:"name"`
}

// EvaluateHand evaluates a poker hand and returns its rank and name
func EvaluateHand(cards []Card) *Hand {
	if len(cards) < 5 {
		return &Hand{
			Cards: cards,
			Rank:  0,
			Name:  "Incomplete Hand",
		}
	}

	// Convert our cards to poker library format
	pokerCards := make([]poker.Card, len(cards))
	for i, card := range cards {
		pokerCards[i] = card.ToPokerCard()
	}

	// Evaluate the hand using the poker library
	rank := poker.Evaluate(pokerCards)
	handName := poker.RankString(rank)

	return &Hand{
		Cards: cards,
		Rank:  int(rank),
		Name:  handName,
	}
}

// FindBestHand finds the best 5-card hand from 7 cards (Texas Hold'em)
func FindBestHand(cards []Card) *Hand {
	if len(cards) < 5 {
		return EvaluateHand(cards)
	}

	// Convert to poker library format
	pokerCards := make([]poker.Card, len(cards))
	for i, card := range cards {
		pokerCards[i] = card.ToPokerCard()
	}

	// Find best 5-card hand
	rank := poker.Evaluate(pokerCards)
	handName := poker.RankString(rank)

	// Note: For now, we return all cards. In a more advanced implementation,
	// we would identify the specific 5 cards that make the best hand
	return &Hand{
		Cards: cards,
		Rank:  int(rank),
		Name:  handName,
	}
}