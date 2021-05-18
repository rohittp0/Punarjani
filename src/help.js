/**
 * Punarjani is a discord bot that notifies you about slot availablity at
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

// eslint-disable-next-line no-unused-vars
import {Channel, Client, Message} from "discord.js";
import Discord from "discord.js"

/**
 * This function generate a embed (Gereral templet)  
 * @author Sunith V S
 * 
 * @param {string} command The command
 * @param {string} discription Discription about the command]
 * @param {string} example Example of that particular
 * @returns {Discord.MessageEmbed}
 */
 function getEmbed(command,discription,example){ 
		const helpEmbed = new Discord.MessageEmbed()
		.setColor('#f9cf03')
		.setTitle('Help')
		.setDescription('Welcome to Punarjani help \n\n\n')
		.setThumbnail("https://user-images.githubusercontent.com/78996425/118526312-bca98580-b75d-11eb-9503-d3134dd9b18c.jpeg")
		.addFields(
			{ name: `How ${command} works`, value: discription },
			{ name: 'Example', value: example },
			
		)
		.setTimestamp()
		.setFooter('Always happy to help you');

		
		return helpEmbed;
 }


/**
 * This function handle the !help command and send coresponding embed
 * 
 * @author Sunith V S
 * @param {Client} client The discord client
 * @param {Message} message The message that initiated this command.
 * @param {Array<string>} args Array containing district, age and user id.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
// eslint-disable-next-line no-unused-vars
export default async function help (client, message, args) 
{	
	
	if(typeof(args[0])=='undefined'){ // checking the command is only !help or not

		const embeding =getEmbed('!help','!help command','!help register');
		const reply = await message.channel.send(embeding);	
	
	}else if(args[0]=='register'){

		const embeding =getEmbed('!register','!register age','!register 25');
		const reply = await message.channel.send(embeding);	

	}


	
	
	
	//const reply = await message.channel.send(embeding);
	//reply.channel.send(embeding);
	return true;
}
