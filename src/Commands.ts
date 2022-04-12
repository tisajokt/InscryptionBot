import { Command } from "./Command";
import { ping } from "./commands/ping";
import { battle } from "./commands/battle";

export const Commands: Command[] = [ping, battle];
