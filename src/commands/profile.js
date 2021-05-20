/**
 * Punarjani is a discord bot that notifies you about slot availability at
 * CoWin vaccination centers.
 * Copyright (C) 2021  SANU MUHAMMED C
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
import {TEXTS} from "../common.js";

/**
 * @author SANU MUHAMMED C
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} doc
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel
 * @returns {Promise<boolean>} True if everything went well
 */
export default async function profile(doc, channel) 
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
		.then(() => true);	
	
}
