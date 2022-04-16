
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

/*@jsonObject
class InnerTest {
	@jsonMember
	innerFoo: number;
	constructor(foo: number) {
		this.innerFoo = foo;
	}
	increment(): void {
		this.innerFoo++;
	}
}

@jsonObject
class OuterTest {
	@jsonMember
	outerFoo: number;
	@jsonMember
	test: InnerTest;
	@jsonArrayMember(InnerTest)
	testArray: InnerTest[];
	constructor(foo: number) {
		this.outerFoo = foo;
		this.test = new InnerTest(foo);
	}
	increment(): void {
		this.outerFoo++;
	}
}
const testSerializer = new TypedJSON(OuterTest);

var test1 = new OuterTest(1);
var test2 = new OuterTest(2);
var testArr = [test1, test2];
console.log(testSerializer.stringifyAsArray(testArr));//*/
