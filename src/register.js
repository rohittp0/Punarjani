/**
 * Punarjani is a discord bot that notifies you about slot availablity at
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
import fetch from "node-fetch";

const Texts = 
{
	helpInfo: "Don't worry you can always ask for !help 😉",
	ageError: "Did you really forget your age, or are you trolling me 🤔.",
	sateQuery: 
	[ 
		"Select The Sate", 
		"Select the state from where you wan't to get vaccinated. Don't worry you can change it latter." 
	]
};

const fetchOptions = { 
	method: "GET",
	headers: {
		accept: "application/json",
		"Accept-Language": "hi_IN",
		Host: "cdn-api.co-vin.in",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
	}
};

/**
 * @author Rohit T P
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
 * This function handles the user registration for Punarjani.
 * 
 * @author Rohit T P
 * @param {Discord.Client} client The discord client
 * @param {Discord.Message} message The message that initiated this command.
 * @param {Array<string>} args Array containing age.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
export default async function register(client, message, args) 
{
	if(!(Number(args[0]) >= 18))
		return message.reply(`${Texts.ageError}\n${Texts.helpInfo}`), false;

	const response = await fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states", fetchOptions)
		.then((res) => res.json());
	
	const states = response.states
		.map((/** @type {any} */ state) => ({id: state.state_id, name: state.state_name}));	
		
	const embeding = getEmbeding(Texts.sateQuery[0], Texts.sateQuery[1], states);	
	const reply = await message.channel.send(embeding);

	// @ts-ignore
	const numberFilter = (response) => !isNaN(response.content);

	const choise = await reply.channel.awaitMessages(numberFilter, {max: 1, errors: ["time"]})
		.then((collected) => [ Number(collected.first()?.content), collected.first()?.author ])
		.catch(() => [NaN, {}]);

	const state = states.find((/** @type {{ id: number; }} */ state) => state.id === choise[0])?.name;	

	// @ts-ignore
	reply.channel.send(`@${choise[1]?.username} selected ${state}`);

	return true;
}

