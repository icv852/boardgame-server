import * as BigTwoLogics from "./logics"
import { Card } from "./types"
import { CardRank, CardSuit } from "./constants"

const SpadeA: Card = { suit: CardSuit.Spades, rank: CardRank.Ace }
const Spade2: Card = { suit: CardSuit.Spades, rank: CardRank.Two }
const Spade3: Card = { suit: CardSuit.Spades, rank: CardRank.Three }
const Spade4: Card = { suit: CardSuit.Spades, rank: CardRank.Four }
const Spade5: Card = { suit: CardSuit.Spades, rank: CardRank.Five }
const Spade6: Card = { suit: CardSuit.Spades, rank: CardRank.Six }
const Spade7: Card = { suit: CardSuit.Spades, rank: CardRank.Seven }
const Heart2: Card = { suit: CardSuit.Hearts, rank: CardRank.Two }
const Heart3: Card = { suit: CardSuit.Hearts, rank: CardRank.Three }
const Club3: Card = { suit: CardSuit.Clubs, rank: CardRank.Three }
const Diamond3: Card = { suit: CardSuit.Diamonds, rank: CardRank.Three }

describe("BigTwoLogicFunctions", () => {
    describe("hasSameRank", () => {
        it("should return true if all cards have the same rank", () => {
            expect(BigTwoLogics.hasSameRank([Spade3, Heart3, Club3])).toBe(true)
        })
        it("should return false if not all cards have the same rank", () => {
            expect(BigTwoLogics.hasSameRank([Spade3, Spade4])).toBe(false)
        })
    })
    
    describe("hasSameSuit", () => {
        it("should return true if all cards have the same suit", () => {
            expect(BigTwoLogics.hasSameSuit([Spade3, Spade4])).toBe(true)
        })
        it("should return false if not all cards have the same suit", () => {
            expect(BigTwoLogics.hasSameSuit([Spade3, Heart3])).toBe(false)
        })
    })

    describe("isPair", () => {
        it("should return true if two cards have same rank", () => {
            expect(BigTwoLogics.isPair([Spade3, Heart3])).toBe(true)
        })
        it("should return false if number of cards is not two", () => {
            expect(BigTwoLogics.isPair([Spade3])).toBe(false)
        })
        it("should return false if not all two cards have the same rank", () => {
            expect(BigTwoLogics.isPair([Spade3, Spade4])).toBe(false)
        })
        it("should return false if at least two cards are same", () => {
            expect(BigTwoLogics.isPair([Spade3, Spade3])).toBe(false)
        })
    });

    describe("isTriple", () => {
        it("should return true if three cards have same rank", () => {
            expect(BigTwoLogics.isTriple([Spade3, Heart3, Club3])).toBe(true)
        })
        it("should return false if number of cards is not three", () => {
            expect(BigTwoLogics.isTriple([Spade3, Heart3])).toBe(false)
        })
        it("should return false if not all three cards have the same rank", () => {
            expect(BigTwoLogics.isTriple([Spade3, Heart3, Spade4])).toBe(false)
        })
        it("should return false if at least two cards are same", () => {
            expect(BigTwoLogics.isTriple([Spade3, Spade3, Heart3])).toBe(false)
        })
    });

    describe("isStraight", () => {
        it ("should return true if the hand is 3, 4, 5, 6, 7 without sorted", () => {
            expect(BigTwoLogics.isStraight([Heart3, Spade5, Spade4, Spade6, Spade7])).toBe(true)
        })
        it ("should return true if the hand is 2, 3, 4, 5, 6 without sorted", () => {
            expect(BigTwoLogics.isStraight([Heart3, Spade2, Spade5, Spade6, Spade4])).toBe(true)
        })
        it ("should return true if the hand is A, 2, 3, 4, 5 without sorted", () => {
            expect(BigTwoLogics.isStraight([Heart3, Spade4, Spade5, Spade2, SpadeA])).toBe(true)
        })
        it ("should return false if number of cards is not 5", () => {
            expect(BigTwoLogics.isStraight([Heart3, Spade4, Spade5, Spade2])).toBe(false)
        })
        it ("should return false if five cards cannot form a Straight", () => {
            expect(BigTwoLogics.isStraight([Spade3, Spade4, Spade6, SpadeA, Spade2])).toBe(false)
        })
        it ("should return false if five cards can form a StraightFlush", () => {
            expect(BigTwoLogics.isStraight([Spade3, Spade4, Spade5, SpadeA, Spade2])).toBe(false)
        })
    })

    describe("isFlush", () => {
        it ("should return true if five cards have same suit", () => {
            expect(BigTwoLogics.isFlush([Spade3, SpadeA, Spade4, Spade6, Spade7])).toBe(true)
        })
        it ("should return false if the number of cards is not 5", () => {
            expect(BigTwoLogics.isFlush([Spade3, Spade5, Spade4, Spade6])).toBe(false)
        })
        it ("should return false if five cards do not have same suit", () => {
            expect(BigTwoLogics.isFlush([Heart3, SpadeA, Spade4, Spade6, Spade7])).toBe(false)
        })
        it ("should return false if five cards can form a StraightFlush", () => {
            expect(BigTwoLogics.isFlush([Spade3, Spade4, Spade5, SpadeA, Spade2])).toBe(false)
        })
        it("should return false if at least two cards are same", () => {
            expect(BigTwoLogics.isFlush([Spade3, Spade3, Spade4, Spade6, Spade7])).toBe(false)
        })
    })

    describe("isFullHouse", () => {
        it ("should return true if five cards can form a Full House", () => {
            expect(BigTwoLogics.isFullHouse([Spade3, Heart3, Club3, Spade2, Heart2])).toBe(true)
        })
        it ("should return false if the number of cards is not 5", () => {
            expect(BigTwoLogics.isFullHouse([Spade3, Spade5, Spade4, Spade6])).toBe(false)
        })
        it ("should return false if five cards cannot form a Full House", () => {
            expect(BigTwoLogics.isFullHouse([SpadeA, Heart3, Club3, Spade2, Heart2])).toBe(false)
        })
        it("should return false if at least two cards are same", () => {
            expect(BigTwoLogics.isFullHouse([Spade3, Spade3, Club3, Spade2, Heart2])).toBe(false)
        })
    })
    describe("isFourOfAKind", () => {
        it ("should return true if five cards can form a Four of a Kind", () => {
            expect(BigTwoLogics.isFourOfAKind([Spade3, Heart3, Club3, Diamond3, Heart2])).toBe(true)
        })
        it ("should return false if the number of cards is not 5", () => {
            expect(BigTwoLogics.isFourOfAKind([Spade3, Heart3, Club3, Diamond3])).toBe(false)
        })
        it ("should return false if five cards cannot form a Four of a Kind", () => {
            expect(BigTwoLogics.isFourOfAKind([Spade3, Heart3, Club3, Spade2, Heart2])).toBe(false)
        })
        it("should return false if at least two cards are same", () => {
            expect(BigTwoLogics.isFourOfAKind([Spade3, Spade3, Club3, Diamond3, Heart2])).toBe(false)
        })
    })
    describe("isStraightFlush", () => {
        it ("should return true if the hand is 3, 4, 5, 6, 7 with same suit without sorted", () => {
            expect(BigTwoLogics.isStraightFlush([Spade6, Spade5, Spade3, Spade4, Spade7])).toBe(true)
        })
        it ("should return true if the hand is 2, 3, 4, 5, 6 with same suit without sorted", () => {
            expect(BigTwoLogics.isStraightFlush([Spade6, Spade5, Spade2, Spade3, Spade4])).toBe(true)
        })
        it ("should return true if the hand is A, 2, 3, 4, 5 with same suit without sorted", () => {
            expect(BigTwoLogics.isStraightFlush([Spade2, SpadeA, Spade3, Spade5, Spade4])).toBe(true)
        })
        it ("should return false if the number of cards is not 5", () => {
            expect(BigTwoLogics.isStraightFlush([Spade3, Spade4, Spade5, Spade6])).toBe(false)
        })
        it ("should return false if five cards cannot form a Straight Flush", () => {
            expect(BigTwoLogics.isStraightFlush([Spade3, Spade4, Spade5, Spade6, SpadeA])).toBe(false)
        })
    })
})