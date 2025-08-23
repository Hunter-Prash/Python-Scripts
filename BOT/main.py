import google.genai as genai
from google.genai import types
import wave
import pygame
import time

def wave_file(filename, pcm, channels=1, rate=24000, sample_width=2):
   with wave.open(filename, "wb") as wf:
      wf.setnchannels(channels)
      wf.setsampwidth(sample_width)
      wf.setframerate(rate)
      wf.writeframes(pcm)

def generate_speech(text_to_speak, voice_name='Aoede', output_filename='response.wav'):
    """
    Generates an audio file from text using the Gemini TTS API.
    """
    client = genai.Client(api_key='AIzaSyDaLQFgly32RKBXWSURcmB8FOY0DS7_PY8')
    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=text_to_speak,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name,
                    )
                ),
            ),
        )
    )
    data = response.candidates[0].content.parts[0].inline_data.data
    wave_file(output_filename, data)

# Initialize the pygame mixer
pygame.mixer.init()

# Main chatbot script
client = genai.Client(api_key='AIzaSyDaLQFgly32RKBXWSURcmB8FOY0DS7_PY8')

chat = client.chats.create(model='gemini-2.5-flash', config=types.GenerateContentConfig(
    system_instruction="You are to address me as sir or boss."))

log_path = r'C:\Users\pctec\OneDrive\Desktop\BACKEND projects\Python Scripts\BOT\log.txt'

while True:
    prompt = input('Enter your query: ')

    if prompt.lower() == 'exit':
        break

    response_chunks = chat.send_message_stream(prompt)
    full_response = ""

    with open(log_path, 'a', encoding='utf-8') as f:
        f.write("USER: " + prompt + '\n')
        f.write("BOT: ")
        for chunk in response_chunks:
            chunk_text = chunk.text or ""
            full_response += chunk_text
            f.write(chunk_text)
            print(chunk_text, end="")
        f.write("\n---\n")

    print('\n')

    # Generate and play speech from the full response
    if full_response:
        audio_file_path = "bot_response.wav"
        generate_speech(full_response, output_filename=audio_file_path)
        print("Playing audio...")

        # Load and play the generated audio file
        pygame.mixer.music.load(audio_file_path)
        pygame.mixer.music.play()
        
        # Wait for the audio to finish playing
        while pygame.mixer.music.get_busy():
            time.sleep(1)
            
        #print("Done playing.")
        # After finished, stop and unload the file
        pygame.mixer.music.stop()
        pygame.mixer.music.unload() 
        print('====unloaded successfully....ready for next run====') 

# Clear the log file after exiting
with open(log_path, 'w', encoding='utf-8') as f:
    pass

print('======EXITING=========')