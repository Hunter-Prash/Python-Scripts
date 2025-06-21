from  selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
import webbrowser
from selenium.webdriver.common.by import By


def amazon_search(query):
    driver = webdriver.Edge()
    url = f'https://www.flipkart.com/'
    driver.get(url)
    time.sleep(3)  # giving page time to load

    print(f"Locating search bar and typing: '{query}'")

    search_bar= driver.find_element(By.CLASS_NAME, "Pke_EE")
    print(search_bar)
    
    search_bar.send_keys(query)
    time.sleep(1) # See the text being typed

    
    search_bar.send_keys(Keys.RETURN)

    print("Search submitted. Waiting for results...")
    time.sleep(5) # Wait to see the search results

    driver.quit()


if __name__ == "__main__":
    search_query = input("Enter your search query: ")
    amazon_search(search_query)