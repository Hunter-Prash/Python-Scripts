from fastapi import FastAPI
from pydantic import BaseModel
import google.genai as genai
from google.genai import types
import uvicorn


client = genai.Client(api_key='AIzaSyDaLQFgly32RKBXWSURcmB8FOY0DS7_PY8')

# Create a persistent chat session
chat = client.chats.create(
    model='gemini-2.5-flash',
    config=types.GenerateContentConfig(system_instruction="You are to address me as sir.")
)


log_path = r'C:\Users\pctec\OneDrive\Desktop\BACKEND projects\Python Scripts\BOT\log.txt'


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
