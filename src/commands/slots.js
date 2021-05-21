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
// eslint-disable-next-line no-unused-vars
import NodeCache from "node-cache";
import {APIS, getSlotEmbed, sendRequest, TEXTS} from "../common.js";

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
	const today = new Date();
	const date = new Date(dateString || "").getDate() ? new Date(dateString || "") : today;
	
	if(date.getFullYear() < today.getFullYear())
		date.setFullYear(today.getFullYear());
	
	if(date.getMonth() < today.getMonth() || (date.getMonth() === today.getMonth() && date.getDate() < today.getDate()))
		date.setFullYear(today.getFullYear() + 1);	
		
	return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
}


/**
 * This function handles manual checking of COWIN slots available  for users district in Punarjani.
 * 
 * @author Sanu Muhammed C
 * @param {Discord.Message} message The message that initiated this command.
 * @param {Array<string>} args The arguments passed.
 * @param {{firestore: () => FirebaseFirestore.Firestore}} app The firebase app
 * @param {NodeCache} cache
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
// eslint-disable-next-line no-unused-vars
export default async function slots(message, args, app, cache) 
{
	// Get an instance of firestore to access the database.
	const firestore = app.firestore();
 
	// Check if user has already registered.
	const user = await firestore.collection("users").doc(message.author.id).get();
		
	// If there is some error send it to user and exit.
	if(!user || !user.exists)
		return message.reply(TEXTS.notRegistered), false;	

	const date = getDate(args.join(" "));	
	const response = await sendRequest(`${APIS.byDistrict}${user.get("district").id}&date=${date}`, cache)
		.catch(()=>({sessions: [], time: "never"}));
	
	const available = {time: response.time, centers: []};

	available.centers = (response.sessions || [])
		// @ts-ignore
		.map(({min_age_limit, name, available_capacity_dose1, available_capacity_dose2, pincode}) =>
			(
				{ 
					age: (Number(min_age_limit) <= user.get("age")), 
					slots: user.get("gotFirst") ? available_capacity_dose2 : available_capacity_dose1,
					name, 
					pincode 
				}
			))
		// @ts-ignore
		.filter(({age, slots})=> age && Number(slots) > 0);
	
	for(const embed of getSlotEmbed(available))
		await message.channel.send(embed).catch(console.error);			
	
	if(available.centers.length === 0)
		message.reply(`No slots available in ${user.get("district").name} for ${date}`);	
		
	return true;
}
