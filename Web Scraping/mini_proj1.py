from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import webbrowser

def bing_search(query):
    driver = webdriver.Chrome()

    url = f"https://www.bing.com/search?q={query.replace(' ', '+')}"
    driver.get(url)

    # Give page time to load
    time.sleep(2)

    links = []
    # Bing result links have class 'title' inside <h2>
    results = driver.find_elements(By.CSS_SELECTOR, 'li.b_algo h2 a')

    for r in results[:3]:
        href = r.get_attribute('href')
        print(f"Found: {href}")
        links.append(href)

    driver.quit()

    # Open the links
    for link in links:
        webbrowser.open(link)

if __name__ == "__main__":
    search_query = input("Enter your search query: ")
    bing_search(search_query)
