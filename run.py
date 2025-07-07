from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time
import os
import tempfile

def setup_driver():
    # Create a temporary directory for Chrome user data
    temp_dir = tempfile.mkdtemp()
    
    # Set up Chrome options
    chrome_options = Options()
    
    # Add Chrome options
    chrome_options.add_argument(f"--user-data-dir={temp_dir}")
    chrome_options.add_argument("--remote-debugging-port=9222")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-software-rasterizer")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")
    
    # Add experimental options
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)
    chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    
    try:
        # Initialize the Chrome driver with Service
        service = Service()
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"Error initializing Chrome driver: {str(e)}")
        print("\nTroubleshooting steps:")
        print("1. Make sure Chrome is not already running")
        print("2. Check if ChromeDriver version matches your Chrome browser version")
        print("3. Try running Chrome manually to ensure it works")
        print("4. Check if you have necessary permissions")
        raise

def send_message(driver, message):
    try:
        # Wait for the chat input box to be present
        chat_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "textarea[data-id='root']"))
        )
        
        # Send the message
        chat_input.send_keys(message)
        chat_input.submit()
        
        # Wait for the response
        time.sleep(2)  # Give some time for the response to start
        
        # Wait for the response to be complete
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-message-author-role='assistant']"))
        )
        
        # Get the response
        response = driver.find_element(By.CSS_SELECTOR, "div[data-message-author-role='assistant']").text
        return response
    
    except TimeoutException:
        return "Timeout waiting for response"
    except Exception as e:
        return f"Error: {str(e)}"

def main():
    try:
        print("Starting Chrome...")
        # Initialize the driver
        driver = setup_driver()
        
        print("Navigating to ChatGPT...")
        # Navigate to ChatGPT
        driver.get("https://chat.openai.com/")
        
        # Wait for the page to load
        time.sleep(5)
        
        print("Sending test message...")
        # Example usage
        message = "Hello, how are you?"
        response = send_message(driver, message)
        print(f"Response: {response}")
        
        # Keep the browser open
        input("Press Enter to close the browser...")
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
    finally:
        # Close the browser
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    main() 