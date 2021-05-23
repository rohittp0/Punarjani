![BFH Banner](https://trello-attachments.s3.amazonaws.com/542e9c6316504d5797afbfb9/542e9c6316504d5797afbfc1/39dee8d993841943b5723510ce663233/Frame_19.png)

[<img align="right" src="https://user-images.githubusercontent.com/45072928/119271215-3807ad00-bc1e-11eb-9be3-034f8421ce53.png" width="150"/>](https://discord.com/oauth2/authorize?client_id=843422427185807380&scope=bot&permissions=445504)

# Punarjani 
Punarjani is a project by us students of CUSAT made as part of the BHF competition conducted by TinkerHub.  Punarjani aims to democratize the vaccination process. We believe that everyone must get equal opportunity and equal care when it comes to critical sectors like health and education. We may not be able to solve the vaccine shortage but we can definitely be part of the solution. 

## What We Did
We made a Discord bot, our dear Mr. PJ. Mr. PJ integrates Cowin public API directly into your discord server. Long page load times and frustrating wait for OTP are now over. Mr. PJ will update you hourly ( if you prefer ) about vaccine availability in your district tailored to your details like age and which dose you need.

## Key Features
 - [x] **Simple UI/UX**
	 - Mr. PJ might be a bot, but it was built with humans in mind so you are assured a smooth learning curve.
 - [x] **Hourly Notification**
	 - Now you don't even have to check, you will be updated every hour automatically.
 - [x] **Manual  Slot Checking**
	 - Just send *!slot  "some date"* and  Mr. PJ got you covered.
 - [x]  **Free Fore Ever**
	 - Yes forever! That is not until a certain period or with a specific cap to the how much you can use. It is truly unlimited.
 - [x] **Fully Opensource**
 - [x]  **Works on any OS**
     - Anywhere you can install Discord Mr. PJ will be there for you.
 - [x] **Unlimited Number of Device Support**
	 - Can get updates on any number of devices simultaneously.
  

## How it Works?
Our bot Mr. PJ follows a chatbot-like scheme. You can tell him to do what you want by using commands. Our commands are single words prepended with ! Exciting right !!

**Mr. PJ is banned from chatting in channels other than DM to protect your privacy.** Help and info commands should still work everywhere.

### Commands

 - **!help** This is the most basic command. It tells you how other commands work just in case you find it difficult.
 - **!register** As the name suggests this command lets you register an account. Just send *!register <your_age>*
 - **!slots** Now as you have told us all the details and completed the registration you can use the *!slots* command to see slots available for you. The format is *!slots <a_date>* or just *!slots* . 
 - **!edit** Just noticed you did something silly during the register don't worry you can edit everything you said. Just send *!edit* and select what you want to change from the menu that pops up.
 - **!profile** So you have edited your details and now want to see how you look, just send *!profile* and Mr. PJ will tell you about yourself!!
 - **!info** This must be the last command you might want to run, but still, it is there if you want to know some details about Mr. PJ

## Want To Know More?
Check out our [website](https://punarjani-cowin.web.app/) for a detailed walk-through, or see this video for a glance.

## Team members
1. [Rohit T P](https://github.com/rohittp0)
2. [Sunith V S](https://github.com/sunithvs)
3. [Sanu Muhammed C](https://github.com/sanumuhammedc)

## Team Id
 Our Team ID of Build From Home is BFH/recMwpT0ZE1CPdRPX/2021

## Libraries used
| Library | Version | Remark|
|--|--|--|
| axios | ^0.21.1  | 
|discord.js| ^12.5.3 |
|firebase-admin| ^9.8.0 |
|node-cache | ^5.1.2 |
|dotenv	| ^9.0.2	| Dev
|eslint	|^7.26.0	| Dev
|nodemon|^2.0.7	| Dev

## How to configure
This might be easier than adding Mr. PJ to your discord but still here are the steps :

#### 1. Clone this repo 
  You need to clone our repo to your local machine or use something like GitPod.

    git clone https://github.com/rohittp0/Punarjani.git

#### 2. Install Dependencies
This is the usual npm stuff.
    npm install
#### 3. Create A Bot
Go to [Dicord](https://discord.com/developers/applications) and create a discord bot. Copy the bot Token to a .env file in the format,

    BOT_TOKEN=your_token

#### 4. Create A Firebase Project
Go to [Firebase](https://console.firebase.google.com/) and create a project. Download the service account.json and convert it to a JSON string. Now add the JSON string to the .env file in the format,

    FIREBASE_KEY=json_string   

And that's it. You are all set to test drive your version of Mr. PJ. You can call it PJ Junior

## How to Run
You can run this project locally using

    npm run watch

   or you can go the extra mile to run it with
    
    node -r dotenv/config src/index.js

If you want to host your bot there is an extensive how-to guide on [Heroku](heroku.com) just follow it and if you get stuck just open an issue here.
