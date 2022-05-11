import { Client } from "discord.js";
import { AppUser } from "../AppUser";
import { SlashCommands } from "../Commands";

export default (client: Client): void => {
	client.on("ready", async() => {
		if (!client.user || !client.application) return;
		await client.application.commands.set(SlashCommands);
		AppUser.initUsersData();
		console.log(`${client.user.username} is online!`);
	})
}