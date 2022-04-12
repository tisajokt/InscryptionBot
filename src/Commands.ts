import { SlashCommand } from "./Command";
import { ping } from "./commands/ping";
import { battle } from "./commands/battle";

export const SlashCommands: SlashCommand[] = [ping, battle];
