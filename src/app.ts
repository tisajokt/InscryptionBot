
import "reflect-metadata";
import app_config from "../app_config.json";

import onReady from "./listeners/ready";
import onInteractionCreate from "./listeners/interactionCreate";

import { Client } from "discord.js";
import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from "typedjson";
const client = new Client({
	intents: ["GUILDS", "GUILD_MESSAGES"]
});
onReady(client);
onInteractionCreate(client);
client.login(app_config.botToken);
