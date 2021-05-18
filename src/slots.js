/**
 * Punarjani is a discord bot that notifies you about slot availablity at
 * CoWin vaccination centers.
 * Copyright (C) 2021  SANU MUHAMED C
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
import {Client, Message} from "discord.js";
import {sendRequest} from "./common.js";


/**
 * @author SANU MUHAMMED C
 *
 * @param {string} title
 * @param {string} description
 * @param {any[]} options
 * @returns {Discord.MessageEmbed}
 */
function getEmbeding(title, description, options) 
{
	const fields = options.map((option) => 
		({ name: option.name, value: option.id, inline: true }));
 
	return new Discord.MessageEmbed()
		.setColor("#0099ff")
		.setTitle(title)
		.setDescription(description)
		.addFields(fields)
		.setTimestamp()
		.setFooter("Reply within 1 minute");
}

/**
 * This function handles manual checking of COWIN slots available  for users district in Punarjani.
 * 
 * @author SANU MUHAMMED C
 * @param {Client} client The discord client
 * @param {Message} message The message that initiated this command.
 * @param {Array<string>} args The arguments passed.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
// eslint-disable-next-line no-unused-vars
export default async function slots(client, message, args) 
{
	const response = await sendRequest("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=512&date=31-03-2021");	
	
	const centers = response.sessions.map((session) => ({ id: session.center_id, name: session.name, address: session.address, slots: session.available_capacity }));
        
	return true;
}
