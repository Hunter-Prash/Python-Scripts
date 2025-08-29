import express from 'express'
import dotenv from "dotenv"
import { google } from 'googleapis'
import crypto from 'crypto'
import session from 'express-session'
import { promises as fs } from 'fs';
import cors from 'cors'

dotenv.config()

const app = express()
app.use(cors({
  origin: 'http://localhost:5173', // replace with your frontend URL
  credentials: true               // allow cookies/session to be sent
}))


app.get('/', (req, res) => {
    res.send('Hii from backend!@')
})

app.use(session({
    secret: 'random-secret-key',
    resave: false,
    saveUninitialized: true
}));

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);


const scopes = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly'
];

/* Global variable that stores user credential in this code example.
 * ACTION ITEM for developers:
 *   Store user's refresh token in your data store if
 *   incorporating this code into your real app.
 */
let storedRefreshToken = null;
let userCredential = null;
const filepath = 'C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\AI Email Bot\\SERVER\\accessToken.txt';

const writeToFile=async(filepath,content)=>{
    console.log(`Attempting to write to file.`);

    try{
        const jsonContent=JSON.stringify(content,null,2)
        await fs.writeFile(filepath,jsonContent,'utf-8')
        console.log('Successfully wrote to the file!');
    }
    catch (err) {
        console.error('Error writing to file:', err);
    }
}

const loadRefreshToken=async()=>{
    try{
        const data=await fs.readFile(filepath,'utf-8')
        const parsed=JSON.parse(data)
        storedRefreshToken=parsed.refresh_token

        if(storedRefreshToken){
            oauth2Client.setCredentials({refresh_token:storedRefreshToken})
        }
    }
    catch (err) {
    console.log("No refresh token found:", err);
  }
}

await loadRefreshToken()//calling this on server start-up


//go to oauth consent screen
app.get('/auth/google', (req, res) => {
    console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "Loaded" : "Missing");
console.log("Redirect URL:", process.env.GOOGLE_REDIRECT_URI);

  const state = crypto.randomBytes(32).toString('hex');
  req.session.state = state;

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
    state,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI
  });

  res.redirect(url);//redirect user to oauth consent page
});


//after user gives consent to oauth page handle the callback here.

//example req url sent by google after user consent in oauth     http://localhost:5100/auth/google/callback?code=4/0Ad...xyz&state=abc123

app.get('/auth/google/callback', async (req, res) => {
    console.log(req.query)

    if (req.query.state !== req.session.state) {
        return res.status(400).send('Invalid Sate: Failed to Authenticate')
    }

    const { code } = req.query
    const { tokens } = await oauth2Client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
    });
    oauth2Client.setCredentials(tokens);

    /** Save credential to the global variable in case access token was refreshed.
  * ACTION ITEM: In a production app, you likely want to save the refresh token
  *              in a secure persistent database instead. */
    userCredential = tokens;
    await writeToFile(filepath,userCredential)

      // tokens.access_token can now be used to call Gmail API
  console.log(tokens);
   {/*

    tokens sent by google with look something like this...
    {
  "access_token": "ya29.a0AWY7CkkJmabc123XYZ...",
  "refresh_token": "1//0gAbCDeFGhIJklMNOpQrStUV...",
  "scope": "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.readonly",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjA... (JWT token)",
  "expiry_date": 1693345380270
}
*/}

 res.redirect("http://localhost:5173/dashboard");
})



app.get('/me', async (req, res) => {
    // If no refresh token is stored, the user is not logged in
    if (!storedRefreshToken) 
        {
            return res.json({ loggedIn: false });
        }
    
    // Optionally refresh access token if it doesn't exist or expired
    if (!oauth2Client.credentials.access_token) { 
        // Calls Google's OAuth2 endpoint using stored refresh token
        // to obtain a new access token
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Update the oauth2Client with the new access token (and other tokens)
        oauth2Client.setCredentials(credentials);
    }

    // Create an OAuth2 service object to fetch user info
    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });

    // Get the logged-in user's profile information
    const userInfo = await oauth2.userinfo.get();

    // Respond to frontend with logged-in status and user info
    res.json({ loggedIn: true, user: userInfo.data });
});


app.listen(5100, (req, res) => {
    console.log('Server successfully started on port 5100')
})