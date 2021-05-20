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

import admin from "firebase-admin";
import Discord from "discord.js";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import NodeCache from "node-cache";

export const TEXTS = 
{
	helpInfo: "Don't worry you can always ask for !help 😉",
	tryAgain: "Don't worry you can try again later 🤘",
	generalError: "Oops something went wrong 😵‍💫",
	infoCollected: "That's all I need to know 👍 I will write it in my 📖 and let you know.",
	regSuccess: "Your registration has been completed 🎊 Welcome to Punarjani 🙋",
	regFailed: "Sorry your registration failed 😞 Looks like I forgot how to write 😵",
	profileDesc: "I found this written in my 📖 about you.",
	ageQuestion: "Hmm you look soo young, tell me your real age?",
	confirmDele: "Are you sure you want to delete your account? 😨",
	noDelete: "Oof that was close 😌, I was really scared.",
	cantTalk: "Some one told my developers that I am too noisy 😡 now I am banned from talking here 😭 ",
	goToDM: "We can still chat in DM 😉,But you have to swear you won't complain on me 🤫",
	hourlyUpdate: "Do you want to get hourly update for CoWin slots ?",
	existingUser: "Hmm you look familiar... Aah I know you have registered a while back, no need to do it again.",
	stateQuery: 
	[ 
		"Select The Sate", 
		"Select the state from where you want to get vaccinated. Don't worry you can change it latter." 
	],
	districtQuery:
	[
		"Select The District",
		"Select your preferred district. Only showing districts from the state you selected."
	],
	embedFields: 
	{
		title: "Edit Info",
		description: "Hmm so you have decided to edit your personal details. You can do the following:",
		footer: "React with appropriate emoji"
	},
	ageError: "Did you really forget your age, or are you trolling me 🤔",
	stateError: "Registration has been canceled due to invalid state selection 😭",
	districtError: "Registration has been canceled due to invalid district selection 😭",
	notRegistered: "Looks like you haven't registered yet. Use !register to get yourself registered.",
	runningError: "You asked me to do something else complete it first."
};

export const APIS = 
{
	byDistrict: "https://cowin.rabeeh.me/api/v2/appointment/sessions/public/findByDistrict?district_id="
};

export const BOT_AVATAR = "https://raw.githubusercontent.com/rohittp0/Punarjani/main/bot-avatar.png";

// Login to firebase server then exports the logging instance so we can use it in other files. 
export const getApp = () => admin.initializeApp(
	{
		credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY || "")),
		databaseURL: "https://punarjani-cowin-default-rtdb.firebaseio.com"
	});

/**
 * Returns an instance of firebase admin after initalizing it using
 * credentials stored in serviceAccountKey.json
 * 
 * @author Rohit T P
 * @returns {admin.app.App} Initialized Firebase App
 */

/**
 * Sends get request to cowin rest api specified by the url passed.
 * 
 * @author Rohit T P
 * @param {string} url The url to get.
 * @param {NodeCache} cache A per opened cache.
 * @returns {Promise<{[key: string]: any}>} Response JSON converted to JS object.  
 * @throws If request failed and cache was also not found.
 */
export async function sendRequest(url, cache) 
{
	const result = await axios.get(url, 
		{
			headers: {
				accept: "application/json",
				"Accept-Language": "hi_IN",
				//Host: "cdn-api.co-vin.in",
				//"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
			}
		}
	).catch(() =>undefined);

	let data = result?.data;

	if(!data)
		data = cache.get(url);
	else 
		cache.set(url, data, 5*60*60*1000);	

	if(!data) throw "Request failed and cache also didn't hit.";

	return data;
}

/**
 * Helper function to create embed for selecting state or district.
 * 
 * @author Rohit T P
 * @param {string} title The title of the embed.
 * @param {string} description The description of the embed.
 * @param {string} avatar The url to an image to use as avatar.
 * @param {{name: string, id: number}[]} options An object containing options to list.
 * @returns {Discord.MessageEmbed[]} The embed created using given data.
 */
export function getLocationEmbeds(title, description, avatar, options) 
{
	const embeds = [];
	const fields = options.map((option) => 
		({ name: `${option.name} - ${option.id}`, value: "‾", inline: true }));
	
	while(fields.length)
		embeds.push(new Discord.MessageEmbed()
			.setThumbnail(avatar)
			.setColor("#0099ff")
			.addFields(fields.splice(0, 25)));
	
	embeds[0].setTitle(title)
		.setDescription(description);
	
	embeds[embeds.length-1].setTimestamp()
		.setFooter("Reply within 1 minute", avatar); 	

	return embeds;	
}

/**
 * This function generate an embed containing the vaccination center and available slots 
 * 
 * @author Sunith V S
 * @param {string} center The name of the vaccination center 
 * @param {number}	slots the number of available slots
 * @param {string} address The address of the center
 * @param {string} date Date on which slot is available.
 * @returns {Discord.MessageEmbed} The created embed 
 */
export function getSlotEmbed(center, slots, address, date)
{
	const embedObject = new Discord.MessageEmbed()
		.setDescription("Click the ☝️ to go to CoWin site.")
		.setURL("https://www.cowin.gov.in/home")  //url for redirecting user  to cowin website
		.setColor("#f9cf03")
		.setTitle(center)
		.setThumbnail(BOT_AVATAR)
		.addFields(
			{ name: "Vaccination center", value: center },
			{ name: "Available Dose", value: slots  },
			{ name: "Address", value: address }
			
		)
		.setFooter(`Slots available on ${date}`);

	return embedObject;
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
	// @ts-ignore A filter to only allow select emoji and user to react.
	const filter = (reaction, user) => ["👍", "👎"].includes(reaction.emoji.name) && user.id === uid;

	// Send the message and wait for reactions.
	const message = await channel.send(question);
	const result = message.awaitReactions(filter, { max: 1 })
		.then(collected => collected.first()?.emoji.name === "👍")
		.catch(() => false)
		.finally(() => message.delete().catch(console.log));

	// Pre set the reactions that the user can use.	
	await Promise.all([
		message.react("👍"),
		message.react("👎")
	])
		.catch(console.error);

	return result;
		
}
