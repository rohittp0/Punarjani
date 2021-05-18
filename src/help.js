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
		.setThumbnail("https://user-images.githubusercontent.com/78996425/118526312-bca98580-b75d-11eb-9503-d3134dd9b18c.jpeg")
		.addFields({ name:"How can we chat ? ", value: "\0" })
		.addFields({ name:"👉 You can call me by !help", value: "\0" })
		.addFields({ name:"👉 Send me !help  queries-name   I will tell you how it works ", value: "\0" })
		.setTimestamp()
		.setFooter("Always happy to help you");

	
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
		.setDescription("Welcome to Punarjani help \n\n\n")
		.setThumbnail("https://user-images.githubusercontent.com/78996425/118526312-bca98580-b75d-11eb-9503-d3134dd9b18c.jpeg")
		.addFields(
			{ name: `How ${command} works`, value: description },
			{ name: "Example", value: example },
			
		)
		.setTimestamp()
		.setFooter("Always happy to help you");

		
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
	
	if(typeof(args[0])==="undefined")
	{ // checking the command is only !help or not

		const embed =helpEmbed();
		await message.channel.send(embed);	
	
	}
	else if(args[0]==="register")
	{

		const embed =getEmbed("!register", "!register age", "!register 25");
		await message.channel.send(embed);	

	}


	
	
	
	//const reply = await message.channel.send(embeding);
	//reply.channel.send(embeding);
	return true;
}
