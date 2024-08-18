import { Suit, Card, Rank } from "./services/gameLogicService/bigTwo/types";
import { SuitValue, RankValue } from "./services/gameLogicService/bigTwo/constants";

console.log("index.ts is running")

// const suitSpade = new Suit(SuitValue.Spade)
// console.log(suitSpade.next)

const card1 = new Card(new Suit(SuitValue.Club), new Rank(RankValue.Two))

console.log(card1.next)