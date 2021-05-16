/**
 * Punarjani is a discord bot that notifies you about slot availablity at
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
import register from "./register.js";

// Create an instance of Client 
const client = new Discord.Client();
// Define a prefix to use when sending commands to bot.
const prefix = process.env.PREFIX || "!";
// An array of commands and functions to handle them.
const commands = 
[
	{ name: "register", handler: register }
];

/**
 * Add an on message handler to the discord bot. This handler will be 
 * the starting point for most of the functions handled by the bot.
 */
client.on("message", message => 
{
	// Check if the message starts with prefix and is not send by bot it's self.
	if (!message.content.startsWith(prefix) || message.author.bot || message.content.length < 2) 
		return;
	
	// Removes prefix from input string then splits into words. 	
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	// Gets the commad to command variable.
	const command = args.shift()?.toLowerCase();

	commands.find(cmd => cmd.name === command)?.handler(client, message, args);

});

//Login to discord using TOKEN
if(process.env.BOT_TOKEN)
	client.login(process.env.BOT_TOKEN);
else 
	console.error("Discord-Bot Token missing."); // Print error message if token is missing.	
