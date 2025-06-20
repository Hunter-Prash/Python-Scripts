import webbrowser
import pyperclip



# Get address from clipboard
address = pyperclip.paste().strip()

if not address:
    print("Clipboard is empty. Please copy an address first.")
else:
    
    webbrowser.open('https://www.google.com/maps/place/' +address)


