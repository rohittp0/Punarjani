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
import {APIS, app, getEmbeds, sendRequest, TEXTS, askPolar} from "./common.js";

const emojiTable = 
[
	{ emoji:"🇸", option:"🇸 Change State", handler: setState },
	{ emoji:"🇩", option:"🇩 Change District", handler: setDistrict },
	{ emoji:"🇦", option:"🇦 Change Age", handler: setAge },
	{ emoji:"ℹ️", option:"ℹ️ Just show my details", handler: showInfo },
	{ emoji:"❌", option:"❌ Delete Account", handler: deleteUser },
	{ emoji:"🤷", option:"🤷 Do Nothing", handler: undefined}
];

/**
 * A helper function to show a list of states and let the user pick one.
 * 
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} doc The author of message.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel The message channel.
 * 
 * @returns {Promise<boolean>} True if everything went well
 */
async function setState(doc, channel) 
{
	// Get the list of state name and id from cowin API.
	const response = await sendRequest(APIS.states)
		.catch(() => ({states: []}));

	const states = response.states // Format the response we got from the API to an object array.
		.map((/** @type {any} */ state) => ({id: state.state_id, name: state.state_name}));	
	
	// Create embeds with the state list and user's avatar and send it.	
	const embeds = getEmbeds(TEXTS.stateQuery[0], TEXTS.stateQuery[1], doc.get("avatar"), states);	
	embeds.forEach(async (embed) =>await channel.send(embed));

	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
		// Check if the reply is from the correct user and also a valid option. 
		response.author.id === doc.get("userID") && !isNaN(Number(response.content));

	// Wait for the user to reply with the code of state they want to select.	
	const choice = await channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => Number(collected.first()?.content));

	// Search the states array for the state specified by the state code user sent. 	
	const state = states.find((/** @type {{ id: number; }} */ state) => state.id === choice);	

	if(!state)
		return await channel.send(`<@${doc.get("userID")}> You selected an invalid state`), false; 

	const status = await doc.ref.update({state}).catch(() => false);	
	
	if(!status)
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.generalError} ${TEXTS.tryAgain}`), false; 
	// Send an reply to the user.
	channel.send(`<@${doc.get("userID")}> Welcome to ${state.name}, nice to meet you 🎊`);	
	
	return true;
}


/**
 * A helper function to show a list of states and let the user pick one.
 * 
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} doc The author of message.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel The message channel.
 * 
 * @returns {Promise<boolean>} True if everything went well
 */
async function setDistrict(doc, channel) 
{
	// Get the list of district name and id from cowin API.
	const response = await sendRequest(`${APIS.districts}${doc.get("state").id}`)
		.catch(() => ({districts: []}));

	const districts = response.districts // Format the response we got from the API to an object array.
		.map((/** @type {any} */ dist) => ({id: dist.district_id, name: dist.district_name}));	
	
	// Create embeds with the district list and user's avatar and send it.	
	const embeds = getEmbeds(TEXTS.districtQuery[0], TEXTS.districtQuery[1], doc.get("avatar"), districts);	
	embeds.forEach(async (embed) =>await channel.send(embed));

	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
	// Check if the reply is from the correct user and also a valid option. 
		response.author.id === doc.get("userID") && !isNaN(Number(response.content));

	// Wait for the user to reply with the code of district they want to select.	
	const choice = await channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => Number(collected.first()?.content));

	// Search the districts array for the code user sent. 	
	const district = districts.find((/** @type {{ id: number; }} */ state) => state.id === choice);	

	if(!district)
		return await channel.send(`<@${doc.get("userID")}> You selected an invalid district`), false;

	const status = await doc.ref.update({district}).catch(undefined);	

	if(!status)
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.generalError} ${TEXTS.tryAgain}`), false; 
	
	// Send an reply to the user.
	await channel.send(`<@${doc.get("userID")}> You are now in ${district.name}`).catch(console.error);
	
	return true;
}

/**
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} doc
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel
 * @returns {Promise<boolean>} True if everything went well
 */
async function setAge(doc, channel) 
{
	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
	// Check if the reply is from the correct user and also a valid option. 
		response.author.id === doc.get("userID") && !isNaN(Number(response.content));

	// Ask the user form age.	
	channel.send(`<@${doc.get("userID")}> ${TEXTS.ageQuestion}`);
	const age = await channel.awaitMessages(numberFilter, {max: 1})
		.then((got) => Number(got.first()?.content))
		.catch(() => 0);

	// This check would accept 18.123 but I think it is feature not a bug.
	if(age < 18) // Check if the arguments passed contains a valid age.
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.ageError}\n${TEXTS.helpInfo}`), false;
	
	const status = await doc.ref.update({age});	

	if(!status)
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.generalError} ${TEXTS.tryAgain}`), false; 
	
	await channel.send(`<@${doc.get("userID")}> You are now officially ${age} years old 🎂`).catch(console.error);	

	return true;	
}

/**
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} doc
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel
 * @returns {Promise<boolean>} True if everything went well
 */
function showInfo(doc, channel) 
{
	return channel.send(
		new Discord.MessageEmbed()
			.setThumbnail(doc.get("avatar"))
			.setColor("#0099ff")
			.setTitle("Your Profile")
			.setDescription(TEXTS.profileDesc)
			.addFields(
				{ name: "User Name", value: doc.get("userName") },
				{ name: "Age", value: doc.get("age") },
				{ name: "State", value: doc.get("state").name },
				{ name: "District", value: doc.get("district").name },
			)
			.setTimestamp())
		.then(() => true)	
		.catch(() => false);
}

/**
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} doc
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel
 * @returns {Promise<boolean>} True if everything went well
 */
async function deleteUser(doc, channel) 
{
	if(!(await askPolar(TEXTS.confirmDele, channel, doc.get("userID"))))
		return await channel.send(`<@${doc.get("userID")}>${TEXTS.noDelete}`).catch(console.error), false;
	
	const status = await doc.ref.delete().catch(() => false);	

	if(!status)
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.generalError} ${TEXTS.tryAgain}`), false; 
	
	await channel.send(`<@${doc.get("userID")}> Good bye friend.`).catch(console.error);	

	return true;	
}

/**
 * This function handles the user registration for Punarjani.
 * 
 * @author Rohit T P
 * @param {Discord.Message} message The message that initiated this command.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
export default async function edit(message) 
{
	// Start creating an embed in background.
	const menuEmbed = new Promise((resolve) => resolve(new Discord.MessageEmbed()
		.setThumbnail(message.author.displayAvatarURL())
		.setColor("#ffdb38")
		.setTitle(TEXTS.embedFields.title)
		.setDescription(TEXTS.embedFields.description)
		.setFooter(TEXTS.embedFields.footer)))
		.then((menu) => (emojiTable.forEach(({option}) => menu.addField(option, "\0")), menu));

	// Get an instance of firestore to access the database.
	const firestore = app.firestore();
 
	// Check if user has already registered.
	const user = (await firestore.collection("users").where("userID", "==", message.author.id).get()).docs[0];
	
	// If there is some error send it to user and exit.
	if(!user.exists)
		return message.reply(TEXTS.notRegistered), false;

	const menu = await message.channel.send(await menuEmbed);
	emojiTable.forEach(({emoji}) => menu.react(emoji).catch(console.error));

	// @ts-ignore
	const filter = (reaction, user) => reaction.emoji.name && user.id === message.author.id;
	
	const choice = await menu.awaitReactions(filter, { max: 1 }).then((got) => got.first()?.emoji.name )
		.catch(console.error);	

	const handler = emojiTable.find(({emoji})=> emoji === choice)?.handler;

	let done = false;
	if(handler) 
		done = await handler(user, message.channel).catch(() => false);
	
	if(!done) await message.reply("Edit Canceled").catch(console.error);
	
	return done;
}
 
