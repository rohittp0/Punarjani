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

// eslint-disable-next-line no-unused-vars
import Discord from "discord.js";
// eslint-disable-next-line no-unused-vars
import NodeCache from "node-cache";
import {FieldValue} from "@google-cloud/firestore";
import {askPolar, getLocationEmbeds, TEXTS} from "../common.js";

/**
 * Helper function to sanitize required parameters.
 * 
 * @author Rohit T P
 * @param {any[]} args The arguments to be checked.
 * @param {string} uid The user id of the message author.
 * @param {FirebaseFirestore.Firestore} firestore An instance of firestore 
 * @param {NodeCache} cache
 * @returns {Promise<string|boolean>} Error message if any or false.
 */
async function checkArgs(args, uid, firestore, cache) 
{
	// This check would accept 18.123 but I think it is feature not a bug.
	if(!(Number(args[0]) >= 18)) // Check if the arguments passed contains a valid age.
		return `${TEXTS.ageError}\n${TEXTS.helpInfo}`;	
	
	// Check if user has already registered.
	const docs = firestore.collection("users").doc(uid).get();
	if(cache.get(uid+"exists") || !(await docs)?.exists)
		return cache.set(uid+"exists", true), TEXTS.existingUser; // If exists return the error message.	
	
	return false;
}

/**
 * A helper function to show a list of states and let the user pick one.
 * 
 * @param {Discord.User} user The author of message.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel The message channel.
 * @param {FirebaseFirestore.Firestore} firestore
 * 
 * @returns {Promise<{name: string, id: number}>} The selected state
 */
async function getState(user, channel, firestore) 
{
	// Get the list of state name and id from database.
	const states = (await firestore.doc("/locations/states").get()).get("list");
	
	/** @type {Discord.Message[]} */
	const sent = [];
	// Create embeds with the state list and user's avatar and send it.	
	const embeds = getLocationEmbeds(TEXTS.stateQuery[0], TEXTS.stateQuery[1], user.displayAvatarURL(), states);	
	embeds.forEach(async (embed) =>sent.push(await channel.send(embed)));

	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
	// Check if the reply is from the correct user and also a valid option. 
		response.author.id === user.id && !isNaN(Number(response.content));

	// Wait for the user to reply with the code of state they want to select.	
	const choice = await channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => Number(collected.first()?.content));
	
	// Delete unwanted messages	
	sent.forEach((msg) => msg.delete().catch(console.error));	

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
 * @param {FirebaseFirestore.Firestore} firestore
 * 
 * @returns {Promise<{name: any; id: any; ref: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>}|undefined>} The selected district.
 */
async function getDistrict(user, channel, state, firestore) 
{
	// Get the list of district name and id from database.
	const response = await firestore.collection("/locations/states/districts")
		.where("state_id", "==", Number(state.id))
		.orderBy("name").get();
			
	/** @type {{ name: any; id: any; ref: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>; }[]} */
	const districts = [];	
	// Format the response we got from the API to an object array.
	response.forEach((dist) => 
		districts.push({name: dist.get("name"), id: dist.get("id"), ref: dist}));	

	/** @type {Discord.Message[]} */
	const sent = [];
	// Create embeds with the district list and user's avatar and send it.	
	const embeds = getLocationEmbeds(TEXTS.districtQuery[0], TEXTS.districtQuery[1], user.displayAvatarURL(), districts);	
	embeds.forEach(async (embed) =>sent.push(await channel.send(embed)));

	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
	// Check if the reply is from the correct user and also a valid option. 
		response.author.id === user.id && !isNaN(Number(response.content));

	// Wait for the user to reply with the code of district they want to select.	
	const choice = await channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => Number(collected.first()?.content));

	// Delete unwanted messages	
	sent.forEach((msg) => msg.delete().catch(console.error));	

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
 * @param {{firestore: () => FirebaseFirestore.Firestore}} app The firebase app
 * @param {NodeCache} cache
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
export default async function register(message, args, app, cache) 
{
	// Get an instance of firestore to access the database.
	const firestore = app.firestore();

	// Checks the arguments to see if everything is ok.
	const errorMessage = await checkArgs(args, message.author.id, firestore, cache)
		.catch(() => TEXTS.generalError);
	// If there is some error send it to user and exit.
	if(errorMessage)
		return message.reply(`<@${message.author.id}> ${errorMessage}`), false;

	// Get the state name and ID of the user.	
	const state = await getState(message.author, message.channel, firestore);

	if(!state) // Check if the user selected a valid state.
		return message.reply(`${TEXTS.stateError}\n${TEXTS.tryAgain}`), false;	
	
	const district = await getDistrict(message.author, message.channel, state, firestore);	

	if(!district) // Check if the user selected a valid state.
		return message.reply(`${TEXTS.districtError}\n${TEXTS.tryAgain}`), false;

	// Send a message to the user that data collection has been completed.	
	message.reply(`<@${message.author.id}> ${TEXTS.infoCollected}`);

	// Write the collected user data to cloud firestore.
	const batch = firestore.batch();

	batch.create(firestore.collection("users").doc(message.author.id), {
		userID: message.author.id,
		userName: message.author.username,
		age: Number(args[0]),
		district: {id: district.id, name: district.name},
		distRef: district.ref.ref,
		state,
		avatar: message.author.displayAvatarURL(),
		hourlyUpdate: await askPolar(TEXTS.hourlyUpdate, message.channel, message.author.id)
	});

	batch.update(district.ref.ref, {users: FieldValue.increment(1)});

	const done =  await batch.commit()
		.then(()=>true)
		.catch((error) => (console.error(error), false));
	
	cache.set(message.author.id+"exists", done);	

	// Generate a status message 	
	const status = `<@${message.author.id}>` + 
			( done ?  TEXTS.regSuccess : `${TEXTS.regFailed}\n${TEXTS.tryAgain}`);
	
	// Send the generated status message to the message channel and as dm to user.		
	await message.reply(status);	

	// Return weather everything went well or not.
	return done;
}

