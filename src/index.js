/**
 * Punarjani is a discord bot that notifies you about slot availability at
 * CoWin vaccination centers.
 * Copyright (C) 2021  Rohit TP, Sunith VS, Sanu Muhammed C
 * 
 *  This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>. 
 */

import Discord from "discord.js";
import NodeCache from "node-cache";
import {askPolar, getApp, getIndianTime, getSimilarity, getSlotEmbed, getSessions } from "./common.js";
// Importing command handlers.
import register from "./commands/register.js";
import help from "./commands/help.js";
import slots from "./commands/slots.js";
import edit from "./commands/edit.js";
import info from "./commands/info.js";
import profile from "./commands/profile.js";
import { TEXTS, UPDATE_FREQUENCY } from "./consts.js";

// Opens a cache.
const cache = new NodeCache();
// Create an instance of Client 
const client = new Discord.Client();
// Create an instance of firebase app
const app = getApp();
// Get a ref to active node
const active = app.database().ref("/active");
// Define a prefix to use when sending commands to bot.
const prefix = process.env.PREFIX || "!";

// An array of commands and functions to handle them.
const commands = 
[
	{ name: "register", handler: register }, 
	{ name: "help",     handler: help     },
	{ name: "slots",    handler: slots    },
	{ name: "edit",     handler: edit     }, 
	{ name: "info",     handler: info     },
	{ name: "profile",  handler: profile  }
];

console.log("All globals set.");

active.onDisconnect().remove();

/**
 * @param {FirebaseFirestore.Firestore} firestore
 * @param {Discord.Client} dsClient
 * @param {NodeCache} cache
 */
async function sendHourlyUpdates(firestore, dsClient, cache)
{
	const today = getIndianTime(undefined);

	console.log("Hourly updates ", today.toTimeString());

	const districts = await firestore.collection("/locations/states/districts")
		.where("users", ">", 0).get();	

	/** @type {Promise<any>[]} The promises got when sending embeds. */
	const promises = [];	
	
	districts.forEach(async (dist) => 
	{
		const date = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
		const response = await getSessions(dist.get("id"), date, cache);

		// Check if the difference between last checked and current time is less than half the update frequency
		if(response.time.getTime() - today.getTime() < Math.ceil(UPDATE_FREQUENCY/2))
			return; // If so exit without sending.

		const users = await firestore.collection("users")
			.where("district.id", "==", dist.get("id"))
			.where("hourlyUpdate", "==", true)
			.get();

		users.forEach(async (user) => 
		{
			const centers = response.sessions
				.map(({min_age_limit, name, available_capacity_dose1, available_capacity_dose2, pincode}) =>
					(
						{ 
							age: (Number(min_age_limit) <= user.get("age")), 
							slots: user.get("gotFirst") ? available_capacity_dose2 : available_capacity_dose1,
							name, 
							pincode 
						}
					))
				.filter(({age, slots})=> age && Number(slots) > 0);

			// If no centers have slots left return early.	
			if(centers.length === 0) return;	

			const dm = await dsClient.users.fetch(user.get("userID")).catch(console.error);

			for(const embed of getSlotEmbed({time: response.time, centers}))
				if(dm)
					promises.push(dm.send(embed));	
		});
	});

	return Promise.all(promises).catch(console.error);
}


/**
 * @param {string} input
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel
 * @param {string} id
 * @returns {Promise<((message: Discord.Message, args: string[], app: any, cache: NodeCache) => Promise<any>) | undefined>}
 */
async function getCommand(input, channel, id) 
{
	let similarity = 0;
	/** @type {{handler: ((message: Discord.Message, args: string[], app: any, cache: NodeCache) => Promise<any>) | undefined, name: string | undefined}}	 */
	const command = {handler: undefined, name: ""};

	for(const cmd of commands)
	{
		const sim = getSimilarity(cmd.name, input);
		if(sim > similarity)
		{
			command.handler = cmd.handler;
			command.name = cmd.name;
			similarity = sim;
		}

		if(sim === 1) break;
	}

	// Set the user to doing something in cache.
	cache.set(id+"running", true);
	if(similarity < 1 && !(await askPolar(`!${input} is not a valid command, did you mean !${command.name} ?`, channel, id))) 
		return undefined;
	
	return command.handler;	
}

/**
  * Add an on message handler to the discord bot. This handler will be 
  * the starting point for most of the functions handled by the bot.
  */
client.on("message", async (message) =>
{
	// Check if the message starts with prefix and is not send by bot it's self.
	if (!message.content.startsWith(prefix) || message.author.bot || message.content.length < 2) 
		return;
	
	// Check if the user is doing something else	
	const userRef = active.child(message.author.id); 	
	const running = new Promise((resolve) => userRef.once("value", snapshot => resolve(snapshot.exists())));		

	const args = message.content.slice(prefix.length).trim().split(/ +/); // Removes prefix from input string then splits into words.
	const command = args.shift()?.toLowerCase(); 	// Gets the command to command variable.

	if(message.channel.type !== "dm" && command !== "help" && command !== "info")
		return message.reply(TEXTS.cantTalk+TEXTS.goToDM);	
	
	// Don't run if user has some other commands running for him/her/they
	if(command !== "help" && (cache.get(message.author.id+"running") || await running))
		return message.reply(TEXTS.runningError).catch(console.error);

	// Set the ser as trying to do something.
	const setRunning =  userRef.set(true).catch(console.error);	

	// Get the correct handler for the command user wants to run.
	const handler = await getCommand(command || "", message.channel, message.author.id);

	let result;	
	if(handler)
	// Execute the command.
		result = await handler(message, args, app, cache).catch(console.error);	
	
	cache.set(message.author.id+"running", false);	
	await setRunning;	
	await userRef.remove().catch(console.error);	

	console.log(`${command} execution ${result}`); 
});

client.on("ready", () => 
{
	console.log("Bot ready");
	setInterval(sendHourlyUpdates, UPDATE_FREQUENCY, app.firestore(), client, cache);
});

client.on("guildCreate", async (guild) => 
{
	// Check if we can send message in system channel.
	if(!guild.systemChannel?.send) return;
	// Create a message object to send message.
	const message = {channel: guild.systemChannel};
	// Send the info message.
	await info(message).catch(console.error);

});
 
//Login to discord using TOKEN
if(process.env.BOT_TOKEN)
	client.login(process.env.BOT_TOKEN);
else 
	console.error("Discord-Bot Token missing."); // Print error message if token is missing.		
