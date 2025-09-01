// routes/gmailRoute.js
import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../index.js"; // import your oauth client
import fsSync from "fs";

const router = express.Router();

const loadTokens = () => {
  const tokens = JSON.parse(
    fsSync.readFileSync(
      "C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\AI Email Bot\\SERVER\\accessToken.txt",
      "utf-8"
    )
  );
  return tokens;
};



//RPUTER TO GET LABELS
router.get("/gmail/labels", async (req, res) => {
  try {
    const tokens = loadTokens();
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const response = await gmail.users.labels.list({ userId: "me" });
    const labels = response.data.labels || [];

    res.json({ labels }); // <-- return labels to frontend
  } catch (err) {
    console.error("Error fetching labels:", err);
    res.status(500).json({ error: "Failed to fetch labels" });
  }
});




router.get("/gmail/mails", async (req, res) => {
  try {
    const tokens = loadTokens();
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get list of messages (limit 10)
    const messagesResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      labelIds: ["INBOX"],
    });

    const messages = messagesResponse.data.messages || [];
    const fullMessages = [];

    // Helper function inside the router: clean text
    const getCleanText = (payload) => {
      let encodedBody = "";

      if (payload.parts) {
        const plain = payload.parts.find((p) => p.mimeType === "text/plain");
        const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");

        if (plain) encodedBody = plain.body.data;
        else if (htmlPart) encodedBody = htmlPart.body.data;
      } else {
        encodedBody = payload.body.data || "";
      }

      if (!encodedBody) return "";

      const buff = Buffer.from(encodedBody, "base64url");
      let text = buff.toString("utf-8");

      text = text.replace(/<br\s*\/?>/gi, "\n");
      text = text.replace(/<\/p>/gi, "\n\n");
      text = text.replace(/<[^>]+>/g, "");
      text = text.replace(/\r?\n\s+/g, "\n").trim();

      return text;
    };

    // Helper function inside the router: get HTML content
    const getHtmlContent = (payload) => {
      if (!payload) return "";
      //// Create an empty variable to store the HTML body (encoded in base64)
      let encodedBody = "";

      // If the email is split into parts (common: plain text + HTML + attachments)
      if (payload.parts) {
        // Find the part where mimeType is "text/html"
        // Example payload.parts = [
        //   { mimeType: "text/plain", body: { data: "SGVsbG8=" } },   // "Hello"
        //   { mimeType: "text/html",  body: { data: "PGgxPkhlbGxvPC9oMT4=" } } // "<h1>Hello</h1>"
        // ]
        const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");

        // If we found the HTML part, take its body.data (still base64 encoded)
        // Example: htmlPart.body.data = "PGgxPkhlbGxvPC9oMT4="
        if (htmlPart) encodedBody = htmlPart.body.data;
      }
      // Otherwise, if the email itself is a single HTML block 
      else if (payload.mimeType === "text/html") {
        // Take its body.data
        // Example payload = { mimeType: "text/html", body: { data: "PGgxPkhlbGxvIFdvcmxkPC9oMT4=" } }
        // encodedBody = "PGgxPkhlbGxvIFdvcmxkPC9oMT4="
        encodedBody = payload.body.data;
      }

      if (!encodedBody) return "";

      // Decode the base64url encoded string into readable HTML
      // Example: "PGgxPkhlbGxvPC9oMT4=" → "<h1>Hello</h1>"
      const buff = Buffer.from(encodedBody, "base64url");
      return buff.toString("utf-8");
    };

    // Fetch full messages
    for (const msg of messages) {
      const msgRes = await gmail.users.messages.get({//ask Gmail for the complete details of that specific email (not just the ID).
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const headers =  msgRes.data.payload.headers;//Every email has “headers” (like the envelope info: who sent it, subject, when it was sent, etc.)msgRes.data.payload.headers gives us a list of those headers.
      const subject = headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from = headers.find((h) => h.name === "From")?.value || "(Unknown Sender)";
      const date = headers.find((h) => h.name === "Date")?.value || "";

      const snippet = getCleanText(msgRes.data.payload);
      const html = getHtmlContent(msgRes.data.payload);

      // Determine category
      const labelIds = msgRes.data.labelIds || [];
      let category = "PRIMARY";
      if (labelIds.includes("CATEGORY_SOCIAL")) category = "SOCIAL";
      else if (labelIds.includes("CATEGORY_PROMOTIONS")) category = "PROMOTIONS";
      else if (labelIds.includes("CATEGORY_UPDATES")) category = "UPDATES";
      else if (labelIds.includes("CATEGORY_FORUMS")) category = "FORUMS";
      else if (labelIds.includes("CATEGORY_PERSONAL")) category = "PERSONAL";
      else if (labelIds.includes("SENT")) category = "SENT";
      else if (labelIds.includes("IMPORTANT")) category = "IMPORTANT";
      else if (labelIds.includes("TRASH")) category = "TRASH";
      else if (labelIds.includes("SPAM")) category = "SPAM";
      else if (labelIds.includes("STARRED")) category = "STARRED";
      else if (labelIds.includes("DRAFT")) category = "DRAFT";

      //Assemble the response objects
      fullMessages.push({
        id: msg.id,
        threadId: msg.threadId,
        subject,
        from,
        date,
        snippet,
        html,
        category,
      });
    }

    res.json({ messages: fullMessages });
  } catch (err) {
    console.error("Error fetching mails:", err);
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
});




export default router;
