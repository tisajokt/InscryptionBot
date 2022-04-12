import { Client, Interaction, BaseCommandInteraction, ButtonInteraction, SelectMenuInteraction } from "discord.js";
import { SlashCommands } from "../Commands";

async function handleCommand(client: Client, interaction: BaseCommandInteraction): Promise<void> {
	const command = SlashCommands.find(c => c.name === interaction.commandName);
	if (!command) {
		interaction.followUp({content: "An error has occurred!"});
		return;
	}
	await command.run(client, interaction);
}
async function handleButton(client: Client, interaction: ButtonInteraction): Promise<void> {
	const command = SlashCommands.find(c => c.name === interaction.customId.split(".")[0]);
	if (!command?.button) return;
	await command.button(client, interaction, interaction.customId.split(".")[1]);
}
async function handleSelectMenu(client: Client, interaction: SelectMenuInteraction): Promise<void> {
	const command = SlashCommands.find(c => c.name === interaction.customId.split(".")[0]);
	if (!command?.menu) return;
	await command.menu(client, interaction, interaction.customId.split(".")[1]);
}

export default (client: Client): void => {
	client.on("interactionCreate", async(interaction: Interaction) => {
		if (interaction.isCommand() || interaction.isContextMenu()) {
			await handleCommand(client, interaction);
		} else if (interaction.isButton()) {
			await handleButton(client, interaction);
		} else if (interaction.isSelectMenu()) {
			await handleSelectMenu(client, interaction);
		}
	});
}