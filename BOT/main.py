import google.genai as genai

client = genai.Client(api_key='AIzaSyDaLQFgly32RKBXWSURcmB8FOY0DS7_PY8')
chat=client.chats.create(model='gemini-2.5-flash') #create a chat session

log_path = r'C:\Users\pctec\OneDrive\Desktop\BACKEND projects\Python Scripts\BOT\log.txt'

while True:
    prompt = input('Enter your query: ')

    if prompt.lower() == 'exit':
        break

    response = chat.send_message_stream(prompt)

    with open(log_path, 'a', encoding='utf-8') as f:
        f.write("USER: " + prompt + '\n')

        f.write("BOT: ")
        for chunk in response:
            f.write(chunk.text or "")   # append chunk text
            print(chunk.text, end="")   # also print in real-time
        f.write("\n---\n")
        
    print('\n')


# Clear the log file after exiting
with open(log_path, 'w', encoding='utf-8') as f:
    pass  # Opening in 'w' mode truncates the file


print('======EXITING=========')
