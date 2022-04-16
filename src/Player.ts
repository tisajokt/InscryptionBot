import { Player } from "./Game";

export class SoloPlayer extends Player {}
export class DuelPlayer extends Player {
	wins: number;
	games: number;
	endGame(won: boolean): void {
		if (won) this.wins++;
		this.games++;
	}
}
