from fastapi import FastAPI
from pydantic import BaseModel
import google.genai as genai
from google.genai import types
from dotenv import load_dotenv
import uvicorn
import os

load_dotenv()

api_key=os.getenv('GEMINI_API_KEY')
log_path=os.getenv('LOG_FILE_PATH')

# Ensure API key is set before proceeding
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables or .env file.")

client = genai.Client(api_key=api_key)

# Create a persistent chat session
chat = client.chats.create(
    model='gemini-2.5-flash',
    config=types.GenerateContentConfig(system_instruction="You are to address me as sir.")
)

log_path = log_path

app = FastAPI()

class Query(BaseModel):
    message: str

@app.post("/chat")
def handle_query(query: Query):
    # Stream the chat response
    response = chat.send_message_stream(query.message)

    full_reply = ""
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write("USER: " + query.message + '\n')
        f.write("BOT: ")
        for chunk in response:
            f.write(chunk.text)
            full_reply += chunk.text
        f.write("\n---\n")

    return {"reply": full_reply.strip()}

@app.get("/")
def root():
    return {"message": "HIIII from backend"}

# Run server if this script is executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
