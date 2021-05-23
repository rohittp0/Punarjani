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
import { TEXTS } from "../consts";

/**
 * @author Rohit T P
 * @param {Discord.Message} message The message that initiated this command.
 * @param {Array<string>} _args The arguments passed.
 * @param {{firestore: () => FirebaseFirestore.Firestore}} app The firebase app
 * @returns {Promise<boolean>} True if everything went well
 */
export default async function profile(message, _args, app) 
{
	const doc = await app.firestore().collection("users").doc(message.author.id).get();

	if(!doc || !doc.exists)
		return message.reply(TEXTS.notRegistered), false;
		
	return message.channel.send(
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
				{ name: "Got First Dose", value: doc.get("gotFirst") ? "Yes" : "No" }
			)
			.setFooter(`You have hourly updates ${doc.get("hourlyUpdate") ? "enabled" : "disabled"}`))
		.then(() => true);	
	
}
