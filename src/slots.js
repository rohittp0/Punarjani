/**
 * Punarjani is a discord bot that notifies you about slot availability at
 * CoWin vaccination centers.
 * Copyright (C) 2021  Sanu Muhammed C
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
import Discord from "discord.js";
import {sendRequest} from "./common.js";

const BOT_AVATAR = "https://raw.githubusercontent.com/rohittp0/Punarjani/main/bot-avatar.png";
const COWIN_API_URL = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=";
const DIST_ID = 512; // TODO: Automatically get this from database.
//add user's age from the database here......

/**
 * Converts date from human readable format to the format required by cowin API.
 * If an invalid date is passed or if no date is passed returns the date of current day.
 * 
 * @author Rohit T P
 * @param {string | undefined} dateString The string to convert.
 * @returns {string} The converted date
 * 
 * @example may 18 or 18 may or 18 may 2020 => 18-5-2021
 * @example 5-18 => 18-5-2021
 * @example 18/5/2020 => This won't work we need in mm/dd/yy format.
 */
function getDate(dateString) 
{
	const date = dateString ? new Date(dateString) : new Date();
	if(date.getFullYear() < 2021)
		date.setFullYear(new Date().getFullYear());
		
	return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
}

/**
 *this function generate an embed containing the vaccination center and available slots 
 * @author Sunith V S
 * @param {string} center The string containing name of the vaccination center 
 * @param {any}	slots the number of available slots ( can we change any to number ? )
 * @returns {Discord.MessageEmbed} Embed including number of slots ,vaccination center and redirecting link to cowin website 
 */


function slotsAvailableEmbed(center, slots)
{
	const embedObject = new Discord.MessageEmbed()
		.setDescription("\0")
		.setURL("https://www.cowin.gov.in/home")  //url for redirecting user  to cowin website
		.setColor("#f9cf03")
		.setTitle("Slots available  for vaccine registration book now ")
		.setThumbnail(BOT_AVATAR)
		.addFields(
			{ name: "Vaccination center", value: `${center}` },
			{ name: "Available slots", value: `${slots}`  }
			
		)
		.setTimestamp()
		.setFooter("Book your slots now");

		
	return embedObject;
}


/**
 * This function handles manual checking of COWIN slots available  for users district in Punarjani.
 * 
 * @author Sanu Muhammed C
 * @param {Discord.Message} message The message that initiated this command.
 * @param {Array<string>} args The arguments passed.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
// eslint-disable-next-line no-unused-vars
export default async function slots(message, args) 
{
	const response = await sendRequest(`${COWIN_API_URL}${DIST_ID}&date=${getDate(args.join(" "))}`);	// response contains all fields 
	const centers = response.sessions.map((/** @type {{[key: string]: any}} */ session) => // Used to get required fields from the response
		({ 
			id: session.center_id, // Actually no use .......
			name: session.name, 
			address: session.address, 
			slots: session.available_capacity,
			age: session.min_age_limit,
			district:session.district
		}));
		// Not included the check for the age 
	if(centers.length!==0)
	{
			
		let index=0; // control variable to the loop 
			
		for (index = 0 ; index < centers.length; index++) 
		
			await message.channel.send(slotsAvailableEmbed(centers[index].name, centers[index].slots)).catch();
				
		// loop for embedding all slots available

	
	}

		
	
	
	return true;
}
