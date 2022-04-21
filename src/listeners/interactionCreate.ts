import { Client, Interaction, BaseCommandInteraction, ButtonInteraction, SelectMenuInteraction, CommandInteraction } from "discord.js";
import { DLM } from "../Command";
import { SlashCommands } from "../Commands";

async function handleCommand(interaction: CommandInteraction): Promise<void> {
	console.log(`Received a "${interaction.commandName}" command`);
	const command = SlashCommands.find(c => c.name === interaction.commandName);
	if (!command) {
		interaction.followUp({content: "An error has occurred!"});
		return;
	}
	await command.run(interaction);
}
async function handleButton(interaction: ButtonInteraction): Promise<void> {
	console.log(`Received a "${interaction.customId}" button interaction`);
	const command = SlashCommands.find(c => c.name === interaction.customId.split(DLM)[0]);
	if (!command?.button) {
		interaction.followUp({content: "An error has occurred!"});
		return;
	}
	await command.button(interaction, interaction.customId.split(DLM).slice(1));
}
async function handleSelectMenu(interaction: SelectMenuInteraction): Promise<void> {
	console.log(`Received a "${interaction.customId}" select menu interaction, value: ${interaction.values[0]}`);
	const command = SlashCommands.find(c => c.name === interaction.customId.split(DLM)[0]);
	if (!command?.menu) {
		interaction.followUp({content: "An error has occurred!"});
		return;
	}
	const args = interaction.customId.split(DLM).slice(1);
	if (interaction.values[0]) args.push(...interaction.values[0].split(DLM));
	await command.menu(interaction, args);
}

export default (client: Client): void => {
	client.on("interactionCreate", async(interaction: Interaction) => {
		if (interaction.isCommand()) {
			await handleCommand(interaction);
		} else if (interaction.isButton()) {
			await handleButton(interaction);
		} else if (interaction.isSelectMenu()) {
			await handleSelectMenu(interaction);
		} else {
			console.error("Received an unhandled interaction");
		}
	});
}