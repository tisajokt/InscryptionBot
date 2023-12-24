import { SlashCommand } from "./Command";
import { ping } from "./commands/ping";
import { battle } from "./commands/battle";
import { deck } from "./commands/deck";
import { help } from "./commands/help";

export const SlashCommands: SlashCommand[] = [ping, battle, deck, help];
