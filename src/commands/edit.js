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

import Discord from "discord.js";
import {FieldValue} from "@google-cloud/firestore";
import {askPolar} from "../common.js";
import { TEXTS } from "../consts.js";

const emojiTable = 
[
	{ emoji:"🇸", option:"🇸 Change State", handler: setState },
	{ emoji:"🇩", option:"🇩 Change District", handler: setDistrict },
	{ emoji:"🇦", option:"🇦 Change Age", handler: setAge },
	{ emoji:"🕒", option:"🕒 Toggle Hourly Update", handler: toggleUpdate },
	{ emoji:"💉", option:"💉 Set First Vaccination Status", handler: changeShot },
	{ emoji:"❌", option:"❌ Delete Account", handler: deleteUser },
	{ emoji:"🤷", option:"🤷 Do Nothing", handler: undefined}
];

/**
 * A helper function to show a list of states and let the user pick one.
 * 
 * @author Rohit T P
 * 
 * @param {FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>} doc Firestore document containing users data.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel A channel to send and receive message
 * @param {FirebaseFirestore.Firestore} firestore An instance of the database.
 * 
 * @returns {Promise<boolean>} True if everything went well
 */
async function setState(doc, channel, firestore) 
{
	// Get the list of state name and id from database.
	const states = firestore.doc("/locations/states").get();
	
	// Send an image with the list of states.
	const sent = await channel.send({files: ["images/states.png"]});

	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
		// Check if the reply is from the correct user and also a valid option. 
		response.author.id === doc.get("userID") && !isNaN(Number(response.content));

	// Wait for the user to reply with the code of state they want to select.	
	const choice = await channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => Number(collected.first()?.content));

	// Delete unwanted messages	
	sent.delete().catch(console.error);	

	// Search the states array for the state specified by the state code user sent. 	
	const state = (await states).get("list").find((/** @type {{ id: number; }} */ state) => state.id === choice);	

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
 * @author Rohit T P
 * 
 * @param {FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>} doc Firestore document containing users data.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel A channel to send and receive message
 * @param {FirebaseFirestore.Firestore} firestore An instance of the database.
 * 
 * @returns {Promise<boolean>} True if everything went well
 */
async function setDistrict(doc, channel, firestore) 
{
	// Send an image with the list of states.
	const sent = await channel.send({files: [`images/Districts/${Number(doc.get("state").id)}.png`]});

	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
	// Check if the reply is from the correct user and also a valid option. 
		response.author.id === doc.get("userID") && !isNaN(Number(response.content));

	// Wait for the user to reply with the code of district they want to select.	
	const choice = await channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => Number(collected.first()?.content));
	
	// Get the district from database.
	const districts = await firestore.collection("/locations/states/districts")
		.where("state_id", "==", Number(doc.get("state").id))
		.where("id", "==", Number(choice)).get();	

	// Delete unwanted message	
	if(sent.deletable) sent.delete().catch(console.error);		
	
	let district;	// Create the district object.
	if(!districts.empty)
		district = 
		{ 
			name: districts.docs[0].get("name"), 
			id: districts.docs[0].get("id"), 
			ref: districts.docs[0].ref
		};	

	if(!district || !district.ref || !district.id)
		return await channel.send(`<@${doc.get("userID")}> You selected an invalid district`), false;

	const batch = firestore.batch();

	batch.update(doc.ref, {district, distRef: district.ref});

	if(doc.get("hourlyUpdate") === true)
	{
		batch.update(district.ref, {users: FieldValue.increment(1)});
		batch.update(doc.get("distRef"), {users: FieldValue.increment(-1)})	;
	}
	
	const status = await batch.commit();

	if(!status)
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.generalError} ${TEXTS.tryAgain}`), false; 
	
	// Send an reply to the user.
	await channel.send(`<@${doc.get("userID")}> You are now in ${district.name}`);
	
	return true;
}

/**
 * A helper function to ask user his/her age and save it to database.
 * 
 * @author Rohit T P
 * 
 * @param {FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>} doc Firestore document containing users data.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel A channel to send and receive message
 * 
 * @returns {Promise<boolean>} True if everything went well
 */
async function setAge(doc, channel) 
{
	// Define a function to filter the replies from the user.
	const numberFilter = (/** @type {Discord.Message} */ response) => 
	// Check if the reply is from the correct user and also a valid option. 
		response.author.id === doc.get("userID") && !isNaN(Number(response.content));

	// Ask the user form age.	
	const msg = channel.send(`<@${doc.get("userID")}> ${TEXTS.ageQuestion}`);
	const age = await channel.awaitMessages(numberFilter, {max: 1})
		.then((got) => Number(got.first()?.content))
		.catch(() => 0);

	// Delete useless message.	
	(await msg).delete().catch(console.error);
	
	// This check would accept 18.123 but I think it is feature not a bug.
	if(age < 18 || !(age < 120) ) // Check if the arguments passed contains a valid age.
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.ageError}\n${TEXTS.helpInfo}`), false;
	
	const status = await doc.ref.update({age});	

	if(!status)
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.generalError} ${TEXTS.tryAgain}`), false; 
	
	await channel.send(`<@${doc.get("userID")}> You are now officially ${age} years old 🎂`);	

	return true;	
}

/**
 * A helper function to ask user if he/she wants hourly update and save it to database.
 * 
 * @author Rohit T P
 * 
 * @param {FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>} doc Firestore document containing users data.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel A channel to send and receive message
 * 
 * @returns {Promise<boolean>} True if everything went well
 */
async function toggleUpdate(doc, channel) 
{
	const update = await askPolar(TEXTS.hourlyUpdate, channel, doc.get("userID"));

	let status = true;
	if(doc.get("hourlyUpdate") !== update)
		status = await doc.ref.update({hourlyUpdate: update}).then(() => true).catch(() => false);

	if(status)	
		channel.send(`Hourly update turned ${update ? "ON" : "OFF"}`);	

	return status;	
}

/**
 * A helper function to ask user if he/she got the first dose and save it to database.
 * 
 * @author Rohit T P
 * 
 * @param {FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>} doc Firestore document containing users data.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel A channel to send and receive message
 * 
 * @returns {Promise<boolean>} True if everything went well
 */
async function changeShot(doc, channel) 
{
	const update = await askPolar(TEXTS.gotShot, channel, doc.get("userID"));
 
	let status = true;
	if(doc.get("gotFirst") !== update)
		status = await doc.ref.update({gotFirst: update}).then(() => true).catch(() => false);
 
	if(status)	
		channel.send("Your vaccination status changed.");	
 
	return status;	
}

/**
 * This function deletes the user referenced by the doc object after asking
 * the user for confirmation.
 * 
 * @author Rohit T P
 * 
 * @param {FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>} doc Firestore document containing users data.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel A channel to send and receive message
 * @param {FirebaseFirestore.Firestore} firestore An instance of the database.
 * @param {{get: any, set:any}} cache A pre opened cache
 * 
 * @returns {Promise<boolean>} True if everything went well
 */
async function deleteUser(doc, channel, firestore, cache) 
{
	if(!(await askPolar(TEXTS.confirmDele, channel, doc.get("userID"))))
		return await channel.send(`<@${doc.get("userID")}>${TEXTS.noDelete}`).catch(console.error), false;
	
	const batch = firestore.batch();

	batch.delete(doc.ref);

	if(doc.get("hourlyUpdate") === true)
		batch.update(doc.get("distRef"), {users: FieldValue.increment(-1)});
	
	const status = await batch.commit().then(() => true).catch(() => false);

	if(!status)
		return await channel.send(`<@${doc.get("userID")}> ${TEXTS.generalError} ${TEXTS.tryAgain}`), false; 
	
	cache.set(doc.get("userID")+"exists", !status);
		
	await channel.send(`<@${doc.get("userID")}> Good bye friend.`).catch(console.error);	

	return true;	
}

/**
 * This function handles the !edit command.
 * 
 * @author Rohit T P
 * 
 * @param {Discord.Message} message The message that initiated this command.
 * @param {string[]} args The arguments.
 * @param {{firestore: () => FirebaseFirestore.Firestore}} app The firebase app
 * @param {{get: any, set:any}} cache A pre opened cache
 * 
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
export default async function edit(message, args, app, cache) 
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
	const user = await firestore.collection("users").doc(message.author.id).get();
	
	// If there is some error send it to user and exit.
	if(!user || !user.exists)
		return message.reply(TEXTS.notRegistered), false;

	const menu = await message.channel.send(await menuEmbed);
	emojiTable.forEach(({emoji}) => menu.react(emoji).catch(console.error));

	// @ts-ignore
	const filter = (reaction, user) => reaction.emoji.name && user.id === message.author.id;
	
	const choice = await menu.awaitReactions(filter, { max: 1 }).then((got) => got.first()?.emoji.name )
		.catch(console.error);	

	if(menu.deletable) menu.delete();	

	const handler = emojiTable.find(({emoji})=> emoji === choice)?.handler;

	let done = false;
	if(handler) 
		done = await handler(user, message.channel, firestore, cache).catch(() => false);
	
	if(!done) await message.reply("Edit Canceled");
	
	return done;
}
 
