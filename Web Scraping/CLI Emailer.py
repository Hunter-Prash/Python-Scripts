
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time


def cli_emailer():
    
    driver=uc.Chrome()

    #
    driver.get('https://mail.google.com')
    print('Please login manually')
    time.sleep(30)

    # Step 2: Navigate to compose after login
    driver.get('https://mail.google.com/mail/u/0/?ogbl#inbox?compose=new')
    time.sleep(5)

if __name__ == "__main__":
    cli_emailer()