
import { MessageActionRow } from 'discord.js';
import { AutoBattler, Battle, Card, MAX_ENERGY, moxColor, PlayerBattler } from './Game';
import { padTrim, singleCharStat, toProperFormat } from './util';

const defaultDisplayMode: displayMode = "mini-mono";

export type displayMode = "full-mono"|"mini-mono"|"emoji-mono"|"embed-inline";
export type EmbedField = {name: string, value: string, inline?: boolean}
export type Embed = {title: string, description: string, fields?: EmbedField[]}
export type Reply = {content?: string, embeds?: Embed[], components?: MessageActionRow[]};

const fullMonoSize = 10;
const miniMonoSize = 6;
const lineMiniMono = "".padEnd(miniMonoSize, "―");
const myTurnMiniMono = "".padEnd(miniMonoSize, "═");
const emptyMiniMono = "".padEnd(miniMonoSize, " ");

export class Display {
	static displayPlayer(player: PlayerBattler): string {
		const cards = `[P${player.index+1}] ${player.hand.length.toString().padStart(2, " ")}/${player.deck.cards.length.toString().padEnd(2, " ")}`;
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
				return ai.backfield.map(c => c ? padTrim(c.abbrev, miniMonoSize) : emptyMiniMono).join("|");
		}
	}
	static cardStatsMiniMono(card: Card, i: number): string {
		const numSigils = [...card.sigils].length;
		const conduit = (card.isConduit ? "~" : " ");
		const sigilIcon = numSigils ? (card.hasUnfamiliarSigils ? (card.ability ? `@${numSigils}` : `?${numSigils}`) : (card.ability ? " @" : " *")) : "  ";
		return (padTrim(`${singleCharStat(card.getPower(i))}${card.noSacrifice ? ":" : "/"}${singleCharStat(card.stats[1])}`, miniMonoSize-2) + sigilIcon).replaceAll(" ", conduit);
	}
	static displayBattleFullMono(battle: Battle): string {
		const header = ``;
		const player1Info = ``;
		const player0Info = ``;
		return `\`\`\`${header}\n${player1Info}\n${player0Info}\`\`\``;
	}
	static displayField(field: Card[]): string {
		if (field.some(c => c?.isWide)) {
			const card = field[0];
			const name = padTrim(`${" ".repeat(miniMonoSize+1)}${toProperFormat(card.name)}`, miniMonoSize * field.length - 1);
			const info = padTrim(`${" ".repeat(miniMonoSize+1)}${card.getPower(0)}${card.noSacrifice ? ":" : "/"}${card.stats[1]} ${"*".repeat([...card.sigils].length)}`, miniMonoSize * field.length - 1);
			return `${name}\n${info}`;
		} else {
			const names = field.map(c => c ? padTrim(c.abbrev, miniMonoSize) : emptyMiniMono).join("|");
			const info = field.map((c,i) => c ? this.cardStatsMiniMono(c, i) : emptyMiniMono).join("|");
			return `${names}\n${info}`;
		}
	}
	static displayBattleMiniMono(battle: Battle): string {
		const header = (battle.getBot()?.bossEffect && battle.players[1].candles > 1 ? `Next boss effect: ${toProperFormat(battle.getBot().bossEffect)}\n` : "") + battle.candleDisplay;
		const player1Info = battle.isHuman(1) ? this.displayPlayer(battle.getPlayer(1)) : this.displayBackfield(<AutoBattler>battle.players[1], "mini-mono");
		const separator = Array(battle.fieldSize).fill(lineMiniMono).join("+");
		const turnSeparator = Array(battle.fieldSize).fill(myTurnMiniMono).join("#");
		const player1Field = this.displayField(battle.field[1]);
		const player0Field = this.displayField(battle.field[0]);
		const player0Info = this.displayPlayer(battle.getPlayer(0));
		return `\`\`\`${header}\n${player1Info}\n${battle.actor ? turnSeparator : separator}\n${player1Field}\n${separator}\n${player0Field}\n${battle.actor ? separator : turnSeparator}\n${player0Info}\`\`\``;
	}
	static displayBattle(battle: Battle, displayMode: displayMode=defaultDisplayMode, actions?: MessageActionRow[]): Reply {
		switch (displayMode) {
			case "full-mono":
				return {content: this.displayBattleFullMono(battle), embeds: [], components: actions};
			case "mini-mono":
				return {content: this.displayBattleMiniMono(battle), embeds: [], components: actions};
			case "emoji-mono":
				return {content: ``, embeds: [], components: actions};
			case "embed-inline":
				return {content: ``, embeds: [], components: actions};
		}
	}
}
