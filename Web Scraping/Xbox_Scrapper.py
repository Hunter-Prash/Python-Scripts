from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import datetime
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr


driver = webdriver.Edge()
driver.get('https://www.xbox.com/en-in/promotions/sales/sales-and-specials?xr=shellnav')

# Wait for product titles
WebDriverWait(driver, 20).until(
    EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'h3.c-heading.zpt'))
)

# Wait for prices
WebDriverWait(driver, 20).until(
    EC.presence_of_all_elements_located((By.CSS_SELECTOR, '.textpricenew.x-hidden-focus'))
)

# Extract titles
titles = driver.find_elements(By.CSS_SELECTOR, 'h3.c-heading.zpt')
prices = driver.find_elements(By.CSS_SELECTOR, '.textpricenew.x-hidden-focus')




print('========ALL DEALS=======')
for i in range(min(len(titles),len(prices))):
    a=titles[i].text
    b=prices[i].text[1:]

    # Skip entries where title or price is missing
    if not a or not b:
        continue
    
    print(f'=>: {a} = {b}')

    with open('C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\Web Scraping\\gameDeals.txt','a',encoding='utf-8') as f:
        f.write(f'{a} = {b}' + '\n' + '\n')

driver.quit()


'''
CSS selectors are not just for CSS anymore — tools like Selenium use them to find elements.
.className → finds by class
.class1.class2 → finds elements that have both classes
SYNTAX:
driver.find_elements(By.CSS_SELECTOR, '.class1.class2')

'''


smtpObj = smtplib.SMTP('smtp.gmail.com', 587)
smtpObj.ehlo()
smtpObj.starttls()
print(smtpObj.login('rajaji.prashant@gmail.com', 'plfw vppx ahtc kwjq'))
print('==Link established with SMTP server==')

dt=datetime.datetime.now()#creating a datetime object

from_addr = 'rajaji.prashant@gmail.com'
to_addr = 'pctechtalks@gmail.com'
subject = f'Xbox game deals as of {dt.day}/{dt.month}/{dt.year} :: {dt.hour}:{dt.minute}:{dt.second}'

with open('C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\Web Scraping\\gameDeals.txt','r') as f:
    data=f.read()

body = data

msg = MIMEText(body, 'plain', 'utf-8')
msg['Subject'] = Header(subject, 'utf-8')
msg['From'] = formataddr(('Prashant', from_addr))
msg['To'] = to_addr

smtpObj.sendmail(from_addr, to_addr, msg.as_string())
smtpObj.quit()


print("Email sent!")

#CLEAR THE FILE FOR NEXT RUN...
with open('C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\Web Scraping\\gameDeals.txt', 'w') as f:
    pass  # file is now empty
print('File cleared')