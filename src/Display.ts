
import { AutoBattler, Battle, Card, MAX_ENERGY, moxColor, PlayerBattler } from 'src/Game';
import { padTrim } from './util';

const defaultDisplayMode: displayMode = "mini-mono";

export type displayMode = "full-mono"|"mini-mono"|"emoji-mono"|"embed-inline";
export type EmbedField = {name: string, value: string, inline?: boolean}
export type Embed = {title: string, description: string, fields?: EmbedField[]}
export type Reply = {content?: string, embeds?: Embed[]};

const fullMonoSize = 10;
const miniMonoSize = 6;
const lineMiniMono = "".padEnd(miniMonoSize, "―");
const emptyMiniMono = "".padEnd(miniMonoSize, " ");

export class Display {
	static displayPlayer(player: PlayerBattler): string {
		const cards = `Cards: ${player.hand.length.toString().padStart(2, " ")}/${player.deck.cards.length.toString().padEnd(2, " ")}`;
		const mox = `m(${["blue", "green", "orange"].map(c => player.battle.hasMoxColor(player.index, <moxColor>c) ? c[0].toUpperCase() : " ").join("")})`;
		const energy = `[${"".padStart(player.energy, "#").padStart(player.capacity, "0").padStart(MAX_ENERGY, ".")}]`;
		const bones = `${player.bones}//`;
		return `${cards} ${mox} ${energy} ${bones}`;
	}
	static displayBackfield(ai: AutoBattler, displayMode: displayMode=defaultDisplayMode): string {
		switch (displayMode) {
			case "full-mono":
				return ai.backfield.map(c => c ? `[${(c.name.length <= fullMonoSize-2 ? c.name.padEnd(fullMonoSize-2) : padTrim(c.name.replace("_",""), fullMonoSize-2))}]` :
				"".padEnd(fullMonoSize, " ")).join("");
			case "mini-mono":
				return ai.backfield.map(c => c ? padTrim(c.abbrev, miniMonoSize) : emptyMiniMono).join(" ");
		}
	}
	static displayBattleFullMono(battle: Battle): string {
		const header = ``;
		const player1Info = ``;
		const player0Info = ``;
		return `\`\`\`${header}\n${player1Info}\n${player0Info}\`\`\``;
	}
	static displayBattleMiniMono(battle: Battle): string {
		const header = battle.candleDisplay;
		const player1Info = battle.isHuman(1) ? this.displayPlayer(battle.getPlayer(1)) : this.displayBackfield(<AutoBattler>battle.players[1], "mini-mono");
		const separator = Array(battle.fieldSize).fill(lineMiniMono).join("+");
		const player1Names = battle.field[1].map(c => c ? padTrim(c.abbrev, miniMonoSize) : emptyMiniMono).join("|");
		const player1Stats = battle.field[1].map(c => c ? padTrim(`${c.stats[0]}/${c.stats[1]}`, miniMonoSize) : emptyMiniMono).join("|");
		const player0Names = battle.field[0].map(c => c ? padTrim(c.abbrev, miniMonoSize) : emptyMiniMono).join("|");
		const player0Stats = battle.field[0].map(c => c ? padTrim(`${c.stats[0]}/${c.stats[1]}`, miniMonoSize) : emptyMiniMono).join("|");
		const player0Info = this.displayPlayer(battle.getPlayer(0));
		return `\`\`\`${header}\n${player1Info}\n${separator}\n${player1Names}\n${player1Stats}\n${separator}\n${player0Names}\n${player0Stats}\n${separator}\n${player0Info}\`\`\``;
	}
	static displayBattle(battle: Battle, displayMode: displayMode=defaultDisplayMode): Reply {
		switch (displayMode) {
			case "full-mono":
				return {content: this.displayBattleFullMono(battle)};
			case "mini-mono":
				return {content: this.displayBattleMiniMono(battle)};
			case "emoji-mono":
				return {content: ``};
			case "embed-inline":
				return {embeds: []};
		}
	}
}
