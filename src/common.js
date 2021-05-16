import admin from "firebase-admin";
import fs from "fs";
import { join } from "path";

/**
 * @author Rohit T P
 * @returns {admin.app.App} Initalised Firebase App
 */
export function app()
{
	// Read the service account credentials from file.
	const serviceAccount = JSON.parse(fs.readFileSync(join(process.cwd(), "serviceAccountKey.json"), "utf-8"));

	// Login to firebase server then exports the loggin instance so we can use it in other files. 
	return admin.initializeApp(
		{
			credential: admin.credential.cert(serviceAccount),
			databaseURL: "https://bots-944.firebaseio.com"
		});
}
