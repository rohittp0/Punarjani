/**
 * Punarjani is a discord bot that notifies you about slot availability at
 * CoWin vaccination centers.
 * Copyright (C) 2021  Sunith V S
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

const BOT_AVATAR = "";

/**
 * The list of commands, their format and an example.
 * TODO: Add what each command does. eg register lets the user save their details to our database.
 */
const COMMAND_LIST = 
{
	register: { format: "!register age", example: "!register 25", action: "what happens when user use this?" },
	slots: { format: "!slots date", example: "!slots may 19", action: "what happens when user use this?" }
};

/**
 * This function generate a embed for !help 
 * @author Sunith V S
 * 
 * 
 * @returns {Discord.MessageEmbed} 
 */
function helpEmbed()
{ 
	const embedObject = new Discord.MessageEmbed()
		.setColor("#f9cf03")
		.setTitle("Welcome to Punarjani !help ")
		.setDescription("Are you facing any difficulties 🤔 . Don't worry I'm here to help you 🥳")
		.setThumbnail(BOT_AVATAR)
		.addFields({ name:"How can we chat ? ", value: "\0" })
		.addFields({ name:"👉 You can call me by !help", value: "\0" })
		.addFields({ name:"👉 Send me !help  command-name and I will tell you how it works ", value: "\0" })
		.setTimestamp()
		.setFooter("Always happy to help");

	
	return embedObject;
}

/**
 * This function generate a embed (General template)  
 * @author Sunith V S
 * 
 * @param {string} command The command
 * @param {string} description Description about the command]
 * @param {string} example Example of that particular
 * @returns {Discord.MessageEmbed}
 */
function getEmbed(command, description, example)
{ 
	const embedObject = new Discord.MessageEmbed()
		.setColor("#f9cf03")
		.setTitle("Help")
		.setDescription("Welcome to Punarjani help")
		.setThumbnail(BOT_AVATAR)
		.addFields(
			{ name: `How ${command} works`, value: description },
			{ name: "Example", value: example },
			
		)
		.setTimestamp()
		.setFooter("Always happy to help");

		
	return embedObject;
}


/**
 * This function handle the !help command and send corresponding embed
 * 
 * @author Sunith V S
 * @param {Discord.Message} message The message that initiated this command.
 * @param {Array<string>} args Array containing district, age and user id.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
// eslint-disable-next-line no-unused-vars
export default async function help (message, args) 
{
	// @ts-ignore
	if(!args[0] || args[0].length < 2 || !COMMAND_LIST[args[0].replace("!", "")])
		return await message.channel.send(helpEmbed()).catch(), true;		
	
	const commandName = args[0].replace("!", "");
	// @ts-ignore Removing ! so that !register and register are the same.
	const command = COMMAND_LIST[commandName];	

	await message.channel.send(getEmbed(commandName, command.format, command.example)).catch();
	
	return true;
}
