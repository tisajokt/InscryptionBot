import { Client } from "discord.js";
import { SlashCommands } from "../Commands";

export default (client: Client): void => {
	client.on("ready", async() => {
		if (!client.user || !client.application) return;
		await client.application.commands.set(SlashCommands);
		const collection = await client.application.commands.fetch();
		collection.forEach((command) => {
			if (command.name == "admin") {
				// Typescript insists on forcing me to provide a guild, when all the tutorials say I omit one when updating a global command... ugh
				/*command.permissions.add({
					permissions: [
						{
							id: "202861545628237825",
							type: "USER",
							permission: true
						}
					]
				})*/
			}
		});
		console.log(`${client.user.username} is online!`);
	})
}