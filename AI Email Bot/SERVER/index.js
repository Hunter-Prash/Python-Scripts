import express from 'express'
import dotenv from "dotenv"
import { google } from 'googleapis'
import crypto from 'crypto'
import session from 'express-session'
import fsSync from 'fs';
import cors from 'cors'
import gmailRouter from "./routes/gmailRoute.js";
import pythonRouter from "./routes/pythonRouter.js";

dotenv.config()


const app = express()
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true           
}))
app.use(express.json());
//BASE ROUTE
app.get('/', (req, res) => {
    res.send('Hii from backend!@')
})

app.use(session({
    secret: 'random-secret-key',
    resave: false,
    saveUninitialized: true
}));

export const oauth2Client = new google.auth.OAuth2(
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
const filepath = 'C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\AI Email Bot\\SERVER\\accessToken.txt';


// Utility function to safely read token file
function readTokensFile(filepath) {
  try {
    if (!fsSync.existsSync(filepath)) {
      console.log("Token file does not exist. Returning empty object.");
      return {}; // return empty object if file doesn't exist
    }

    const fileContent = fsSync.readFileSync(filepath, 'utf-8').trim();
    if (!fileContent) {
      console.log("Token file is empty. Returning empty object.");
      return {}; // return empty object if file is empty
    }

    return JSON.parse(fileContent); // valid JSON
  } catch (err) {
    console.error("Error reading token file:", err.message);
    return {}; // return empty object if corrupted or unreadable
  }
}


//go to oauth consent screen
app.get('/auth/google', (req, res) => {
    console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "Loaded" : "Missing");
console.log("Redirect URL:", process.env.GOOGLE_REDIRECT_URI);

  const state = crypto.randomBytes(32).toString('hex');
  req.session.state = state;

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt:'consent',
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


    // Save tokens immediately to file (synchronously)
    fsSync.writeFileSync(filepath, JSON.stringify(tokens, null, 2), 'utf-8');

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

//So every time the access token refreshes (about once an hour), Google will emit tokens, and this listener will persist the latest full token object into your file.

// when ever the server restarts..this listner runs automatically..
oauth2Client.on('tokens', (tokens) => {
  let existingTokens = {};

  try {
    const fileContent = fsSync.readFileSync(filepath, 'utf-8').trim();
    if (fileContent) {
      existingTokens = JSON.parse(fileContent);
    } else {
      console.log("Token file is empty. Starting fresh.");
    }
  } catch (err) {
    console.log("Token file corrupted or unreadable. Resetting...", err.message);
    existingTokens = {};
  }
  //merging
  // Merge new tokens into existing tokens
  if (tokens.refresh_token) {
    existingTokens.refresh_token = tokens.refresh_token;
  }
  if (tokens.access_token) {
    existingTokens.access_token = tokens.access_token;
  }

  // Write updated tokens back to file
  fsSync.writeFileSync(filepath, JSON.stringify(existingTokens, null, 2), 'utf-8');
  console.log("Tokens updated successfully.");
});


app.get('/me', async (req, res) => {
  try {
    const savedTokens = readTokensFile(filepath);

    if (!savedTokens.refresh_token) {
      return res.json({ loggedIn: false });
    }

    storedRefreshToken = savedTokens.refresh_token;
    oauth2Client.setCredentials({ refresh_token: storedRefreshToken });

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const userInfo = await oauth2.userinfo.get();

    return res.json({ loggedIn: true, user: userInfo.data });
  } catch (err) {
    console.error("Error fetching user info:", err);

    if (err.response?.data?.error === "invalid_grant") {
      console.log("Refresh token expired or revoked. Clearing tokens...");
      fsSync.writeFileSync(filepath, JSON.stringify({}), 'utf-8');
    }

    return res.json({ loggedIn: false });
  }
});


//GMAIL ROUTER
app.use("/api", gmailRouter);

//FORWARD PROMPT TO PYTHON FASTAPI SERVER
app.use('/api',pythonRouter)

app.listen(5100, (req, res) => {
    console.log('Server successfully started on port 5100')
})