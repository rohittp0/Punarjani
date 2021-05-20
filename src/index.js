/**
 * Punarjani is a discord bot that notifies you about slot availability at
 * CoWin vaccination centers.
 * Copyright (C) 2021  Rohit T P
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
import {APIS, getApp, getSlotEmbed, sendRequest, TEXTS } from "./common.js";
// Importing command handlers.
import register from "./commands/register.js";
import help from "./commands/help.js";
import slots from "./commands/slots.js";
import edit from "./commands/edit.js";
import info from "./commands/info.js";
 
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
	{ name: "info",     handler: info     }
];

console.log("All globals set.");

active.onDisconnect().remove();

/**
 * @param {FirebaseFirestore.Firestore} firestore
 * @param {Discord.Client} dsClient
 */
async function sendHourlyUpdates(firestore, dsClient)
{
	// TODO remove
	console.log("Hourly updates");
	const districts = await firestore.collection("/locations/states/districts")
		.where("users", ">", 0).get();
	
	// TODO remove
	console.log("dist size ", districts.size, 63);	

	/** @type {Promise<any>[]} The promises got when sending embeds. */
	const promises = [];	
	
	districts.forEach(async (dist) => 
	{
		// TODO remove
		console.log(dist.get("name"), 71);

		const today = new Date();
		const date = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
		const response = sendRequest(`${APIS.byDistrict}${dist.get("id")}&date=${date}`).catch(()=>({sessions: []}));
	
		// TODO remove
		console.log(date, 78);

		const users = await firestore.collection("users")
			.where("district.id", "==", dist.get("id"))
			.where("hourlyUpdate", "==", true)
			.get();

		// TODO remove
		console.log("Users", users.size, 86);

		// @ts-ignore
		(await response).sessions.forEach(({min_age_limit, available_capacity, name, address, date}) => 
		{
			// TODO remove
			console.log("Min age", min_age_limit);

			const embed = getSlotEmbed(name, available_capacity, address, date);

			users.forEach(async (user) => 
			{
				// TODO remove
				console.log(user.get("userName"));

				const dm = await dsClient.users.fetch(user.get("id")).catch(console.error);

				if(dm && user.get("age") >= Number(min_age_limit) && Number(available_capacity) > 0)
					promises.push(
						new Promise((resolve)=> resolve(dm.send(embed)))
					);
			});
		});
	});
	// TODO remove
	return await Promise.all(promises).then(console.log).catch(console.error);
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

	const userRef = active.child(message.author.id); 	
	// Check if the user is doing something else
	const running = new Promise((resolve) => userRef.once("value", snapshot => resolve(snapshot.exists())));	
		
	// Removes prefix from input string then splits into words. 	
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	// Gets the command to command variable.
	const command = args.shift()?.toLowerCase();

	if(message.channel.type !== "dm" && command !== "help" && command !== "info")
		return message.reply(TEXTS.cantTalk+TEXTS.goToDM);	

	// Don't run if user has some other commands running for him/her/they
	if(command !== "help" && await running)
		return message.reply(TEXTS.runningError).catch(console.error);

	// Set the ser as trying to do something.
	const setRunning =  userRef.set(true).catch(console.error);	

	// Execute the command.
	const result = await commands.find(cmd => cmd.name === command)
		?.handler(message, args, app).catch(console.error);
	
	await setRunning;	
	await userRef.remove().catch(console.error);	

	console.log(`${command} execution ${result}`); 
});

client.on("ready", () => 
{
	console.log("Bot ready");									// One hour
	setInterval(() => sendHourlyUpdates(app.firestore(), client), 60*60*60*1000);
	sendHourlyUpdates(app.firestore(), client); // TODO remove
});
 
//Login to discord using TOKEN
if(process.env.BOT_TOKEN)
	client.login(process.env.BOT_TOKEN);
else 
	console.error("Discord-Bot Token missing."); // Print error message if token is missing.		
