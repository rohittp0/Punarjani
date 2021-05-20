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
import { BOT_AVATAR } from "../common.js";

/**
 * The list of commands, their format and an example.
 * TODO: Add what each command does. eg register lets the user save their details to our database.
 */
const COMMAND_LIST = 
[
	{
		name: "register", 
		info: "A new user can use !register command to register in Punarjani.", 
		format: "!register <your-age>",
		details: "For example !register 19 starts registration for a person 19 years old."
	},

	{
		name: "edit", 
		info: "A registered user can use !edit command to edit the entry.", 
		format: "!edit",
		details: ""
	},

	{
		name: "slots", 
		info: "A registered user can use !slots to view the slots available.", 
		format: "!slots",
		details: ""
	},

	{
		name: "profile", 
		info: "A registered user can use !profile to view his/her own profile.", 
		format: "!profile",
		details: ""
	},

	{
		name: "info", 
		info: "If you want to know about me, use !info command", 
		format: "!info",
		details: ""
	}
];

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
		.addFields({ name:"How can we chat ? ", value: "\0" },
			{ name:"👉 You can call me by !help", value: "\0" },
			{ name:"👉 Send !help all to show all available commands.", value: "\0" },
			{ name:"👉 Send me !help  <command name> and I will tell you how it works ", value: "\0" }
		)
		.setTimestamp()
		.setFooter("Always happy to help");

	
	return embedObject;
}

/**
 * This function generate a embed (General template)  
 * @author Sunith V S
 * 
 * @param {string} name The command name
 * @param {string} info Description about the command
 * @param {string} format The format of that command
 * @param {string | undefined} details Some extra details.
 * @returns {Discord.MessageEmbed}
 */
function getEmbed(name, info, format, details)
{ 
	const embedObject = new Discord.MessageEmbed()
		.setColor("#f9cf03")
		.setTitle(`${name[0].toUpperCase()}${name.substr(1)}`)
		.setDescription(info)
		.setThumbnail(BOT_AVATAR)
		.addField("Format", format);

	if(details)
		embedObject.addField("Extra Info", details);	
		
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
export default function help (message, args) 
{
	const arg = (args[0] || "!").replace("!", "").toLowerCase().trim();
	const command = COMMAND_LIST.find((cmd) => cmd.name === arg);

	if(arg === "all")
	{
		let names = "";
		COMMAND_LIST.forEach(({name, format})=>names+= `${name} => ${format}\n`);
		return message.reply(`Available commands are,\n${names} Use !help <command-name> for more details.`)
			.then(() => true);
	}

	if(args[0] && !command)
		message.reply(`${args[0]} is not a valid command. Check out Punarjani help`);

	if(!command)
		return message.channel.send(helpEmbed()).then(() => true);		

	return message.channel.send(getEmbed(command.name, command.info, command.format, command.details))
		.then(() => true);	
}
