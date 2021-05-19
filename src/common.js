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

export const TEXTS = 
{
	helpInfo: "Don't worry you can always ask for !help 😉",
	tryAgain: "Don't worry you can try again later 🤘",
	generalError: "Oops something went wrong 😵‍💫",
	infoCollected: "That's I need to know 👍 I will write it in my 📖 and let you know.",
	regSuccess: "Your registration has been completed 🎊 Welcome to Punarjani 🙋",
	regFailed: "Sorry your registration failed 😞 Looks like I forgot how to write 😵",
	profileDesc: "I found this written in my 📖 about you.",
	ageQuestion: "Hmm you look soo young, tell me your real age?",
	confirmDele: "Are you sure you want to delete your account? 😨",
	noDelete: "Oof that was close 😌, I was really scared.",
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
	existingUser:
	[
		"You have already registered at ",
		" with age as ",
		"\nIf you want to edit this use !edit"
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
	notRegistered: "Looks like you haven't registered yet. Use !register to get yourself registered."
};

export const APIS = 
{
	states: "https://cdn-api.co-vin.in/api/v2/admin/location/states",
	districts: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/"
};

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
 * @returns {Promise<{[key: string]: any}>} Response JSON converted to JS object.  
 */
export async function sendRequest(url) 
{
	const result = await axios.get(url, 
		{
			headers: {
				accept: "application/json",
				"Accept-Language": "hi_IN",
				Host: "cdn-api.co-vin.in",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
			},
			// proxy: {
			// 	host: "104.211.201.68",
			// 	port: 3128
			// }
			
		}
	);

	return result.data;
}

/**
 * Helper function to create embed from passed data.
 * 
 * @author Rohit T P
 * @param {string} title The title of the embed.
 * @param {string} description The description of the embed.
 * @param {string} avatar The url to an image to use as avatar.
 * @param {{name: string, id: number}[]} options An object containing options to list.
 * @returns {Discord.MessageEmbed[]} The embed created using given data.
 */
export function getEmbeds(title, description, avatar, options) 
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
		.catch(() => false);

	// Pre set the reactions that the user can use.	
	await Promise.all([
		message.react("👍"),
		message.react("👎")
	])
		.catch(console.error);

	return result;
		
}
