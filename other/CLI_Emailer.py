import smtplib 

# Create an SMTP client object.'smtp.gmail.com' is the hostname of Gmail's SMTP server.587 is the standard port for submitting emails to an SMTP server using TLS encryption.
smtpObj = smtplib.SMTP('smtp.gmail.com', 587)

# Identify yourself to the SMTP server.
# This is a standard SMTP command that initiates a conversation with the server.
smtpObj.ehlo()

# Start Transport Layer Security (TLS) encryption.
# This upgrades the connection to a secure (encrypted) one, which is required by most email servers, including Gmail.
smtpObj.starttls()

# Log in to your Gmail account.
# 'plfw vppx ahtc kwjq' is an App Password generated for your Gmail account.
# Using an App Password is crucial for security, as direct Gmail passwords won't work due to security policies.
# The print statement will show the server's response to the login attempt (e.g., (235, b'2.7.0 Accepted')).
print(smtpObj.login('rajaji.prashant@gmail.com', 'plfw vppx ahtc kwjq'))


from_addr = 'rajaji.prashant@gmail.com'
to_addr = 'pctechtalks@gmail.com'
subject = 'Test Email from Python'
body = 'Hello, this is a test email sent from Python!'


message = f"Subject: {subject}\n\n{body}"

smtpObj.sendmail(from_addr, to_addr, message)
smtpObj.quit()

print("Email sent!")
