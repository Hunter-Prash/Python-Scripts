import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import time
import random
from email.mime.text import MIMEText
import smtplib 
import os
from dotenv import load_dotenv

# Configure Chrome options
options = uc.ChromeOptions()
options.add_argument("--no-sandbox") #This tells Chrome not to use the "sandbox" security mode when it runs.The sandbox is a built-in security mechanism in Chrome that isolates browser processes to protect your system from malicious code. Disabling it:
    #Reduces security ✔️
    #Increases compatibility

options.add_argument("--disable-dev-shm-usage") 

options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
#A user-agent string is a short message your browser sends to every website. It tells the website what kind of browser, OS, and rendering engine you're using.
#Why Override It in Selenium? Because:Selenium’s default user-agent is detectable (websites know it’s a bot).Many sites block or CAPTCHA Selenium bots by checking the user-agent.
#Mozilla/5.0	Legacy prefix (even Chrome/Edge include this)
#Windows NT 10.0; Win64; x64	OS: Windows 10, 64-bit
#AppleWebKit/537.36	Rendering engine (used by Chrome, Safari)
#Chrome/124.0.0.0	Chrome browser, version 124
#Safari/537.36	Used for compatibility with Safari-detection code


# Optional: Uncomment for visible browser automation
# options.add_argument("--headless=new")  # Avoid headless if scraping protected sites

load_dotenv(dotenv_path='C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\Web Scraping\\Motivation Bot\\cred.env')

email_user = os.getenv("EMAIL_USER")
email_pass = os.getenv("EMAIL_PASS")


# Start the browser
driver = uc.Chrome(options=options)

try:
    driver.get("https://www.brainyquote.com/topics/motivational-quotes")
    time.sleep(random.uniform(15, 18))  # Let page load + JS challenges settle

    # Simulate scrolling
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(random.uniform(1, 3))

    # Interact with the page like a human
    actions = ActionChains(driver)
    actions.move_by_offset(100, 100).perform()
    #.move_by_offset(100, 100) means:
        #Move the mouse cursor by 100 pixels right and 100 pixels down from its current position.
        # .perform() executes that action.

    # Scrape quote texts (modify as needed)
    quotes = driver.find_elements(By.CSS_SELECTOR, "a.b-qt")
    authors = driver.find_elements(By.CSS_SELECTOR, "a.bq-aut")

    file_path = 'C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\Web Scraping\\Motivation Bot\\quotes.txt'

    formatted_quotes = []
    for i in range(len(quotes)):
        quote = quotes[i].text.strip()
        author = authors[i].text.strip() if i < len(authors) else "Unknown"
        formatted_quotes.append(f"{quote} — {author}")

    if len(formatted_quotes) < 2:
        raise ValueError("Not enough quotes found on the page.")
    
    random_quotes=random.sample(formatted_quotes,k=2)
    ans='\n\n'.join(random_quotes)
    print('===ans string generated===')


       # === Compose and send email ===
    msg = MIMEText(ans, _charset="utf-8")
    msg["Subject"] = "Your Daily Motivation 💪"
    msg["From"] = email_user
    msg["To"] = "pctechtalks@gmail.com"

    smtpObj = smtplib.SMTP('smtp.gmail.com', 587)
    smtpObj.ehlo()
    smtpObj.starttls()
    smtpObj.login(email_user, email_pass)

    print('===Link with SMTP Server Established===')

    smtpObj.sendmail(email_user, msg["To"], msg.as_string())
    smtpObj.quit()

    print("✅ Email sent successfully!")

    print('===RUN SUCCESSFUL===')


except Exception as e:
    print(f"⚠️ Error occurred: {e}")
    print('===RUN FAILED====')

finally:
    driver.quit()# You already close the browser here
    del driver  # Tell Python: don't try to close it again
    

