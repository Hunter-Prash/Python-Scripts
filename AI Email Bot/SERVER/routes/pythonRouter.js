import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/summarize", async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({ error: "Missing payload" });
    }

    // Forward to FastAPI backend
    const response = await axios.post("http://localhost:8100/chat", {
      email_prompt: payload,
    });

    return res.json(response.data); // forward reply back
  } catch (err) {
    console.error("Error forwarding request:", err.message);
    res
      .status(500)
      .json({ error: "INTERNAL SERVER ERROR: Failed to summarize" });
  }
});

export default router;
