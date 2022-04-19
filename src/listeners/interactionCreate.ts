import { Client, Interaction, BaseCommandInteraction, ButtonInteraction, SelectMenuInteraction, CommandInteraction } from "discord.js";
import { SlashCommands } from "../Commands";

async function handleCommand(client: Client, interaction: CommandInteraction): Promise<void> {
	console.log(`Received a "${interaction.commandName}" command`);
	const command = SlashCommands.find(c => c.name === interaction.commandName);
	if (!command) {
		interaction.followUp({content: "An error has occurred!"});
		return;
	}
	await command.run(client, interaction);
}
async function handleButton(client: Client, interaction: ButtonInteraction): Promise<void> {
	console.log(`Received a "${interaction.customId}" button interaction`);
	const command = SlashCommands.find(c => c.name === interaction.customId.split(".")[0]);
	if (!command?.button) {
		interaction.followUp({content: "An error has occurred!"});
		return;
	}
	await command.button(client, interaction, interaction.customId.split(".").slice(1));
}
async function handleSelectMenu(client: Client, interaction: SelectMenuInteraction): Promise<void> {
	console.log(`Received a "${interaction.customId}" select menu interaction, value: ${interaction.values[0]}`);
	const command = SlashCommands.find(c => c.name === interaction.customId.split(".")[0]);
	if (!command?.menu) {
		interaction.followUp({content: "An error has occurred!"});
		return;
	}
	const args = interaction.customId.split(".").slice(1);
	if (interaction.values[0]) args.push(...interaction.values[0].split("."));
	await command.menu(client, interaction, args);
}

export default (client: Client): void => {
	client.on("interactionCreate", async(interaction: Interaction) => {
		if (interaction.isCommand()) {
			await handleCommand(client, interaction);
		} else if (interaction.isButton()) {
			await handleButton(client, interaction);
		} else if (interaction.isSelectMenu()) {
			await handleSelectMenu(client, interaction);
		} else {
			console.error("Received an unhandled interaction");
		}
	});
}