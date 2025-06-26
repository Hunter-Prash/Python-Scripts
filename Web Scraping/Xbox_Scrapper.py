from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

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

print("🎮 Titles:")
for t in titles:
    print(t.text)

print("\n💰 Prices:")
for p in prices:
    print(p.text)

driver.quit()


'''
CSS selectors are not just for CSS anymore — tools like Selenium use them to find elements.
.className → finds by class
.class1.class2 → finds elements that have both classes
SYNTAX:
driver.find_elements(By.CSS_SELECTOR, '.class1.class2')

'''