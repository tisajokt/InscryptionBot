
import app_config from "../app_config.json";

import onReady from "./listeners/ready";
import onInteractionCreate from "./listeners/interactionCreate";

import { Client } from "discord.js";
import { Player, SoloBattle, DuelBattle, terrains, AI_SPEED } from "./Game";
import { pickRandom, sleep } from "./util";
const client = new Client({
	intents: ["GUILDS", "GUILD_MESSAGES"]
});
onReady(client);
onInteractionCreate(client);
client.login(app_config.botToken);

async function testBattle(): Promise<void> {
	var stats = {
		duel: [0,0],
		solo: [0,0]
	};
	var i = 0;
	while (true) {
		var player1 = new Player();
		var player2 = new Player();
		var options = {
			candles: 3,
			fieldSize: Math.random() < 0.5 ? 4 : 5,
			terrain: pickRandom(terrains),
			scale: i%2==0 ? 0 : -1
		};
		var battle = (i%2==0) ? new SoloBattle(player1, options) : new DuelBattle(player1, player2, options);
		const result = await battle.awaitCompletion();
		stats[battle.isHuman(1) ? "duel" : "solo"][result]++;
		console.log(`\nPlayer ${result} wins!`, stats);
		await sleep(AI_SPEED);
		i++;
	}
}
//testBattle();
