import { hasSameRank } from "./logics"
import { Card } from "./types"
import { CardRank, CardSuit, FiveCardHand } from "./constants"

const SpadeA: Card = { suit: CardSuit.Spades, rank: CardRank.Ace }
const Spade2: Card = { suit: CardSuit.Spades, rank: CardRank.Two }
const Spade3: Card = { suit: CardSuit.Spades, rank: CardRank.Three }
const Spade4: Card = { suit: CardSuit.Spades, rank: CardRank.Four }
const Spade5: Card = { suit: CardSuit.Spades, rank: CardRank.Five }
const Spade6: Card = { suit: CardSuit.Spades, rank: CardRank.Six }
const Spade7: Card = { suit: CardSuit.Spades, rank: CardRank.Seven }
const SpadeJ: Card = { suit: CardSuit.Spades, rank: CardRank.Jack }
const Heart3: Card = { suit: CardSuit.Hearts, rank: CardRank.Three }
const Club3: Card = { suit: CardSuit.Clubs, rank: CardRank.Three }
const Diamond3: Card = { suit: CardSuit.Diamonds, rank: CardRank.Three }

describe("hasSameRank", () => {
    it("should return true if all cards have the same rank", () => {
        expect(hasSameRank([Spade3, Heart3, Club3])).toBeTruthy();
    });

    it("should return false if not all cards have the same rank", () => {
        expect(hasSameRank([Spade3, Spade4])).toBeFalsy();
    });
});