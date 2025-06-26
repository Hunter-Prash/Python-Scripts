import webbrowser


file_path = r'C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\Web Scraping\\play.txt'

# # If you wanna write plain strings to the file
#
# try:
#     Open the file in append mode ('a'). If the file does not exist, it will be created.

#     with open(file_path, 'a') as f:
#         word = 'HII'  # The string to be written to the file.
#         f.write(word)  # Write the string to the file.
#         print(f'Successfully wrote {word} to file')  # Inform the user of success.

# except Exception as e:
#     # If any exception occurs during file operations, print the error message.
#     print(e)


try:
    with open(file_path, 'ab') as file:  # Open in append binary mode
        file.write(b'HII\n')  # Write bytes using the 'b' prefix
    print(f"Successfully appended 'HII' to {file_path}")
   
    with open(file_path,'rb') as f:
        data=f.read()
        print(data.decode('utf-8'))

except IOError as e:
    print(f"Error writing to file: {e}")

