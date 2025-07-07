from flask import Flask, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
import sys

app = Flask(__name__)
CORS(app, resources={r"/ask": {"origins": "*"}}, supports_credentials=True)

# Verify ChromeDriver path
chrome_driver_path = "C:/chromedriver/chromedriver.exe"
if not os.path.exists(chrome_driver_path):
    print(f"❌ ChromeDriver not found at: {chrome_driver_path}")
    print("Please download ChromeDriver from: https://chromedriver.chromium.org/downloads")
    print("Make sure to download the version that matches your Chrome browser version")
    sys.exit(1)

# Verify Chrome binary path
chrome_binary_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
if not os.path.exists(chrome_binary_path):
    print(f"❌ Chrome not found at: {chrome_binary_path}")
    print("Please make sure Chrome is installed at the default location")
    sys.exit(1)

print("✅ Chrome and ChromeDriver paths verified")

# Verify user data directory
user_data_dir = "C:/Users/range/AppData/Local/Google/Chrome/User Data"
if not os.path.exists(user_data_dir):
    print(f"❌ Chrome user data directory not found at: {user_data_dir}")
    sys.exit(1)

print("✅ Chrome user data directory verified")

options = Options()
options.binary_location = chrome_binary_path
options.add_argument(f"--user-data-dir={user_data_dir}")
options.add_argument("--profile-directory=Profile 3")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)

# Additional options to prevent common issues
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")
options.add_argument("--disable-extensions")
options.add_argument("--disable-software-rasterizer")
options.add_argument("--disable-features=VizDisplayCompositor")
options.add_argument("--disable-features=IsolateOrigins,site-per-process")
options.add_argument("--disable-site-isolation-trials")
options.add_argument("--disable-web-security")
options.add_argument("--allow-running-insecure-content")
options.add_argument("--window-size=1920,1080")

print("Starting Chrome...")
try:
    service = Service(chrome_driver_path)
    driver = webdriver.Chrome(service=service, options=options)
    print("✅ Chrome started successfully")
    
    print("Navigating to ChatGPT...")
    max_retries = 3
    for attempt in range(max_retries):
        try:
            driver.get("https://chat.openai.com/")
            # Wait for the page to load
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
            print("✅ ChatGPT page loaded successfully")
            break
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"❌ Failed to load ChatGPT after {max_retries} attempts")
                raise
            print(f"Attempt {attempt + 1} failed, retrying...")
            time.sleep(2)
            
except Exception as e:
    print(f"❌ Error initializing Chrome driver: {str(e)}")
    print("\nTroubleshooting steps:")
    print("1. Make sure Chrome is not already running")
    print("2. Check if ChromeDriver version matches your Chrome browser version")
    print("3. Try running Chrome manually to ensure it works")
    print("4. Check if you have necessary permissions")
    print("5. Verify that Profile 3 exists in your Chrome user data directory")
    raise

input("Login manually if needed, then press Enter to continue...")

def send_to_chatgpt(prompt):
    print("send to chatgpt"+prompt)
    try:
        # Wait for page to be fully loaded
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        
        # Try multiple selector strategies for the contenteditable div
        selectors = [
            (By.CSS_SELECTOR, "div[data-virtualkeyboard='true']"),
            (By.CSS_SELECTOR, "div#prompt-textarea"),
            (By.CSS_SELECTOR, "div.ProseMirror")
        ]
        
        prompt_div = None
        for selector in selectors:
            try:
                print(f"Trying selector: {selector}")
                prompt_div = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located(selector)
                )
                if prompt_div:
                    print(f"Found prompt div using selector: {selector}")
                    break
            except Exception as e:
                print(f"Selector {selector} failed: {str(e)}")
                continue
        
        if not prompt_div:
            raise Exception("Could not find prompt input with any selector")
            
        # Wait for the div to be interactable
        try:
            WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "div[data-virtualkeyboard='true']"))
            )
            
            # Clear the existing content
            driver.execute_script("arguments[0].innerHTML = '';", prompt_div)
            
            # Set the new content
            driver.execute_script("arguments[0].innerHTML = arguments[1];", prompt_div, prompt)
            
            # Simulate Enter key press
            prompt_div.send_keys("\n")
            print("prompt sent")
            print(f"✅ Sent: {prompt}")
            
            # Wait for response
            time.sleep(6)
            try:
                messages = WebDriverWait(driver, 10).until(
                    EC.presence_of_all_elements_located((By.CLASS_NAME, "markdown"))
                )
                return messages[-1].text if messages else "⚠️ No response found"
            except Exception as e:
                print(f"Error getting response: {str(e)}")
                return "⚠️ Could not retrieve response"
                
        except Exception as e:
            print(f"Error interacting with prompt div: {str(e)}")
            return f"❌ Error interacting with prompt div: {str(e)}"
            
    except Exception as e:
        print(f"Detailed error: {str(e)}")
        return f"❌ Error: {str(e)}"

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    prompt = data.get("prompt", "")
    reply = send_to_chatgpt(prompt)
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000) 