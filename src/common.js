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

import admin from "firebase-admin";
import Discord from "discord.js";
import axios from "axios";
import { BOT_AVATAR, TEXTS } from "./consts.js";

/**
 * Returns an instance of firebase admin after initalizing it using
 * credentials stored in serviceAccountKey.json
 * 
 * @author Rohit T P
 * @returns {admin.app.App} Initialized Firebase App
 */
export const getApp = () => admin.initializeApp(
	{
		credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY || "")),
		databaseURL: "https://punarjani-cowin-default-rtdb.firebaseio.com"
	});

/**
 * Gets indian time from the date string passed or returns current time in IST.
 * 
 * @author Rohit T P
 * @param {string | undefined} dateString The date string to use
 * @returns {Date} IST Date
 */
export function getIndianTime(dateString) 
{
	const date = new Date(dateString || "").getDate() ? new Date(dateString || "") : new Date();
	const offset = date.getTimezoneOffset() + 330;   // IST offset UTC +5:30
 
	return new Date(date.getTime() + offset*60000);
}	

/**
 * Gets the sessions available by district id for the specified date.
 * If for some reason API request fails return an object with empty sessions array
 * and time of fetching Date(0)
 * 
 * 
 * @author Rohit T P
 * 
 * @param {string | number} id The district ID
 * @param {string} date The date for which sessions are needed in the dd-mm-yyyy format 
 * @param {{set: any, get:any}} cache A per opened cache.
 * 
 * 
 * @returns {Promise<{sessions: any[], time: Date}>} The available sessions and time of fetching.  
 */
export async function getSessions(id, date, cache) 
{
	const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${id}&date=${date}`;
	const result = await axios.get(url).then(({data}) => data).catch(() =>undefined);

	let data = result?.data;

	if(!data || !data.sessions) // If no data was got try getting the data from cache
		data = cache.get(url);
	else 
		cache.set("slots"+id+date, data, 5*60*60*1000);	// If valid data is got save it in cache

	if(!data || !data.sessions) 
		return { sessions: [], time: new Date(0) }; // If data was not found in cache also then return a place holder.
	if(!data.time) 
		data.time = getIndianTime(undefined); // If data dose not have time set set it to current time. 

	return data;
}

/**
 * Helper function to create embed for available slots.
 * 
 * @author Rohit T P
 * @param {{centers: { slots: number; name: string; pincode: number; }[], time: Date}} sessions The available sessions for the user.
 * @param {string} displayDate
 * @returns {Discord.MessageEmbed[]}
 */
export function getSlotEmbed(sessions, displayDate)
{
	const embeds = [];
	const fields = sessions.centers.map(({slots, name, pincode}) => 
		({ name: `_\n${name}`, value: `Slots ${slots}\nPIN ${pincode}`}));
	
	while(fields.length)
		embeds.push(new Discord.MessageEmbed()
			.setColor("#f9cf03")
			.addFields(fields.splice(0, 25))
			.setThumbnail(BOT_AVATAR));

	
	embeds[0].setTitle("Available Slots")
		.setURL("https://www.cowin.gov.in/home") //url for redirecting user  to cowin website
		.setDescription(`${TEXTS.slotsDescription} ${displayDate}`);
	
	embeds[embeds.length-1]
		.setFooter(`Last checked at ${sessions.time.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true })}`); 	

	return embeds;	
}

/**
 * Helper function ask a yes or no question and return what user decided.
 * 
 * @author Rohit T P
 * @param {string} question The question to be asked.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel The channel were question has to be asked
 * @param {any} uid The user who is supposed to respond.
 *
 * @returns {Promise<boolean>} The response
 */
export async function askPolar(question, channel, uid) 
{
	// @ts-ignore
	const filter = (reaction, user) => ["👍", "👎"].includes(reaction.emoji.name) && user.id === uid;

	// Send the message and wait for reactions.
	const message = await channel.send(question);
	const result = message.awaitReactions(filter, { max: 1 })
		.then(collected => collected.first()?.emoji.name === "👍")
		.catch(() => false)
		.finally(() => message.delete().catch(console.error));

	// Pre set the reactions that the user can use.	
	await Promise.all([
		message.react("👍"),
		message.react("👎")
	])
		.catch(console.error);

	return result;
		
}
  

/**
 * Checks how similar is s1 and s2 using Levenshtein distance.
 * Returns 1 if s1===s2 or a number between 0 (inclusive) and 1 (exclusive) 
 * 
 * @author StackOverflow.overlord1234
 * @param {string} s1 First string
 * @param {string} s2 Second string
 * @returns {number} similarity between s1 and s2 (0 to 1)
 */
export function getSimilarity(s1, s2) 
{
	let longer = s1.toLowerCase();
	let shorter = s2.toLowerCase();

	if (s1.length < s2.length) 
	{
		longer = s2;
		shorter = s1;
	}
	
	const longerLength = longer.length;
	if (longerLength === 0) 
		return 1.0;

	const costs = new Array();
	for (let i = 0; i <= longer.length; i++) 
	{
		let lastValue = i;
		for (let j = 0; j <= shorter.length; j++) 
			if (i === 0)
				costs[j] = j;
			else 
			
			if (j > 0) 
			{
				let newValue = costs[j - 1];
				
				if (longer.charAt(i - 1) !== shorter.charAt(j - 1))
					newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
				
				costs[j - 1] = lastValue;
				lastValue = newValue;
			}
		
		if (i > 0)
			costs[shorter.length] = lastValue;
	}
	
	const editDistance = costs[shorter.length];
	
	return (longerLength - editDistance) / longerLength;
}
