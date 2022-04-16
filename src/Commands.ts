import { SlashCommand } from "./Command";
import { ping } from "./commands/ping";
import { battle } from "./commands/battle";
import { admin } from "./commands/admin";

export const SlashCommands: SlashCommand[] = [ping, battle, admin];
