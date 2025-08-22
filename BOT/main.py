from google import genai

client = genai.Client(api_key='AIzaSyDaLQFgly32RKBXWSURcmB8FOY0DS7_PY8')

log_path = r'C:\Users\pctec\OneDrive\Desktop\BACKEND projects\Python Scripts\BOT\log.txt'

while True:
    prompt = input('Enter your query: ')

    if prompt.lower() == 'exit':
        break

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        max_output_tokens=150
    )

    with open(log_path, 'a', encoding='utf-8') as f:
        f.write("USER: " + prompt + '\n')
        f.write("BOT: " + response.text + '\n')
        f.write("---\n")

    print(response.text)

# Clear the log file after exiting
with open(log_path, 'w', encoding='utf-8') as f:
    pass  # Opening in 'w' mode truncates the file

print('======EXITING=========')
