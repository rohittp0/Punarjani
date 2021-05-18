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

import admin from "firebase-admin";
import axios from "axios";

/**
 * Returns an instance of firebase admin after initalising it using
 * credentials stored in serviceAccountKey.json
 * 
 * @author Rohit T P
 * @returns {admin.app.App} Initalised Firebase App
 */
export function getApp()
{
	// Read the service account credentials from enviornment variables.
	const serviceAccount = JSON.parse(process.env.FIREBASE_KEY || "");

	// Login to firebase server then exports the loggin instance so we can use it in other files. 
	return admin.initializeApp(
		{
			credential: admin.credential.cert(serviceAccount),
			databaseURL: "https://punarjani-cowin-default-rtdb.firebaseio.com"
		});
}

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
