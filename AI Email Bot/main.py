from fastapi import FastAPI
from pydantic import BaseModel
import google.genai as genai
from google.genai import types
from dotenv import load_dotenv
import uvicorn
import os

load_dotenv()

api_key=os.getenv('GEMINI_API_KEY')

if not api_key:
    raise ValueError('GEMINI_API_KEY not found in environment variables or .env file.')

client=genai.Client(api_key=api_key)

# Create a persistent chat session
chat=client.chats.create(
    model='gemini-2.5-flash',
    config=types.GenerateContentConfig(system_instruction="""
        You are an AI assistant whose only task is to summarize emails. 
        Always respond based only on the email content provided. 
        Use concise summaries in bullet points.
        """)
)

app=FastAPI()

# Pydantic model to parse incoming JSON
class ChatRequest(BaseModel):
    email_prompt: str

@app.get("/")
def root():
    return {"message": "HIIII from backend"}

@app.post("/chat")
def handle_query(request: ChatRequest):
    full_reply = ""
    # Send the prompt from Node.js
    response_stream = chat.send_message_stream(request.email_prompt)

    # Concatenate streamed chunks
    for chunk in response_stream:
        full_reply += chunk.text

    return {"reply": full_reply.strip()}


# Run server if this script is executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8100, reload=True)