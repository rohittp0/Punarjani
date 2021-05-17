/**
 * Punarjani is a discord bot that notifies you about slot availablity at
 * CoWin vaccination centers.
 * Copyright (C) 2021  Sunith V S
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
import {Client, Message} from "discord.js";

/**
 * This function handles the user registration for Punarjani.
 * 
 * @author Sunith V S
 * @param {Client} client The discord client
 * @param {Message} message The message that initiated this command.
 * @param {Array<string>} args Array containing district, age and user id.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
// eslint-disable-next-line no-unused-vars
export default async function help(client, message, args) 
{
	return true;
}
