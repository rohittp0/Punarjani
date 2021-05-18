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

import Discord from "discord.js";
import {sendRequest, app} from "./common.js";

const Texts = 
{
	helpInfo: "Don't worry you can always ask for !help 😉",
	tryAgain: "Don't worry you can try again later 🤘",
	infoCollected: "That's I need to know 👍 I will write it in my 📖 and let you know.",
	regSuccess: "Your registration has been completed 🎊 Welcome to Punarjani 🙋",
	regFailed: "Sorry your registration failed 😞 Looks like I forgot how to write 😵",
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
	ageError: "Did you really forget your age, or are you trolling me 🤔",
	stateError: "Registration has been canceled due to invalid state selection 😭",
	districtError: "Registration has been canceled due to invalid district selection 😭"
};

/**
 * Helper function to sanitize required parameters.
 * 
 * @author Rohit T P
 * @param {any[]} args The arguments to be checked.
 * @param {string} uid The user id of the message author.
 * @param {FirebaseFirestore.Firestore} firestore An instance of firestore 
 * @returns {Promise<string|boolean>} Error message if any or false.
 */
async function checkArgs(args, uid, firestore) 
{
	// This check would accept 18.123 but I think it is feature not a bug.
	if(!(Number(args[0]) >= 18)) // Check if the arguments passed contains a valid age.
		return `${Texts.ageError}\n${Texts.helpInfo}`;	
	
	// Check if user has already registered.
	const docs = await firestore.collection("users").where("userID", "==", uid).get();
	if(!docs.empty)
	{   // If the user already has a registration get details related to it.
		const dist = docs.docs[0].get("district")?.name;
		const age = docs.docs[0].get("age");
		
		// Return the error message.
		return `${Texts.existingUser[0]}${dist}${Texts.existingUser[1]}${age}${Texts.existingUser[2]}`;
	}

	return false;
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
function getEmbeds(title, description, avatar, options) 
{
	const embeds = [];
	const fields = options.map((option) => 
		({ name: `${option.name} - ${option.id}`, value: "_", inline: true }));
	
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
 * A helper function to show a list of states and let the user pick one.
 * 
 * @param {Discord.User} user The author of message.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel The message channel.
 * 
 * @returns {Promise<{name: string, id: number}>} The selected state
 */
async function getState(user, channel) 
{
	// Get the list of state name and id from cowin API.
	const response = await sendRequest("https://cdn-api.co-vin.in/api/v2/admin/location/states")
		.catch(() => ({states: []}));

	const states = response.states // Format the response we got from the API to an object array.
		.map((/** @type {any} */ state) => ({id: state.state_id, name: state.state_name}));	
	
	// Create embeds with the state list and user's avatar and send it.	
	const embeds = getEmbeds(Texts.stateQuery[0], Texts.stateQuery[1], user.displayAvatarURL(), states);	
	embeds.forEach(async (embed) =>await channel.send(embed));

	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
	// Check if the reply is from the correct user and also a valid option. 
		response.author.id === user.id && !isNaN(Number(response.content));

	// Wait for the user to reply with the code of state they want to select.	
	const choice = await channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => Number(collected.first()?.content));

	// Search the states array for the state specified by the state code user sent. 	
	const state = states.find((/** @type {{ id: number; }} */ state) => state.id === choice);	

	// Send an appropriate reply to the user.
	channel.send(`<@${user.id}> You selected ${state ? state.name : "an invalid state"}`);
	
	return state;
}

/**
 * @param {Discord.User} user
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel
 * @param {{ name: any; id?: number; }} state
 */
async function getDistrict(user, channel, state) 
{
	// Get the list of district name and id from cowin API.
	const response = await sendRequest(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state.id}`)
		.catch(() => ({districts: []}));

	const districts = response.districts // Format the response we got from the API to an object array.
		.map((/** @type {any} */ dist) => ({id: dist.district_id, name: dist.district_name}));	
	
	// Create embeds with the district list and user's avatar and send it.	
	const embeds = getEmbeds(Texts.districtQuery[0], Texts.districtQuery[1], user.displayAvatarURL(), districts);	
	embeds.forEach(async (embed) =>await channel.send(embed));

	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
	// Check if the reply is from the correct user and also a valid option. 
		response.author.id === user.id && !isNaN(Number(response.content));

	// Wait for the user to reply with the code of district they want to select.	
	const choice = await channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => Number(collected.first()?.content));

	// Search the districts array for the code user sent. 	
	const district = districts.find((/** @type {{ id: number; }} */ state) => state.id === choice);	

	// Send an appropriate reply to the user.
	channel.send(`<@${user.id}> You selected ${district ? district.name : "an invalid district"}`);
	
	return district;
}

/**
 * This function handles the user registration for Punarjani.
 * 
 * @author Rohit T P
 * @param {Discord.Message} message The message that initiated this command.
 * @param {Array<string>} args Array containing age.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
export default async function register(message, args) 
{
	// Get an instance of firestore to access the database.
	const firestore = app.firestore();

	// Checks the arguments to see if everything is ok.
	const errorMessage = await checkArgs(args, message.author.id, firestore)
		.catch(() => "Something went wrong.");
	// If there is some error send it to user and exit.
	if(errorMessage)
		return message.reply(`<@${message.author.id}> ${errorMessage}`), false;

	// Get the state name and ID of the user.	
	const state = await getState(message.author, message.channel);

	if(!state) // Check if the user selected a valid state.
		return message.reply(`${Texts.stateError}\n${Texts.tryAgain}`), false;	
	
	const district = await getDistrict(message.author, message.channel, state);	

	if(!district) // Check if the user selected a valid state.
		return message.reply(`${Texts.districtError}\n${Texts.tryAgain}`), false;

	// Send a message to the user that data collection has been completed.	
	message.reply(`<@${message.author.id}> ${Texts.infoCollected}`);

	// Write the collected user data to cloud firestore.
	const done =  await firestore.collection("users").add(
		{
			userID: message.author.id,
			userName: message.author.username,
			age: Number(args[0]),
			district,
			state
		})
		.then(()=>true)
		.catch((error) => (console.error(error), false));
	
	// Generate a status message 	
	const status = `<@${message.author.id}>` + 
			( done ?  Texts.regSuccess : `${Texts.regFailed}\n${Texts.tryAgain}`);
	
	// Send the generated status message to the message channel and as dm to user.		
	message.author.dmChannel?.send(status);
	await message.reply(status);	

	// Return weather everything went well or not.
	return done;
}

