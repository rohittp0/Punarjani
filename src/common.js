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

/**
 * Returns an instance of firebase admin after initalising it using
 * credentials stored in serviceAccountKey.json
 * 
 * @author Rohit T P
 * @returns {admin.app.App} Initalised Firebase App
 */
function getApp()
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

export const app = getApp();
