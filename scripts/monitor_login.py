import asyncio
import os
import sys
from playwright.async_api import async_playwright

async def test_login():
    # Credentials to test with
    EMAIL = os.getenv("TEST_EMAIL", "admin@gocycle.com")
    PASSWORD = os.getenv("TEST_PASSWORD", "admin123")
    URL = "https://www.gocycle.ng/login"

    print(f"Starting automated login test for {URL}...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        try:
            # 1. Navigate to login page
            print("Navigating to login page...")
            await page.goto(URL, wait_until="networkidle")

            # 2. Fill in credentials
            print("Entering credentials...")
            await page.fill('input[name="identifier"]', EMAIL)
            await page.fill('input[name="password"]', PASSWORD)

            # 3. Click Login
            print("Clicking login button...")
            await page.click('button[type="submit"]')

            # 4. Wait for success toast or redirection
            print("Waiting for response...")
            
            # Check if it gets stuck on "AUTHENTICATING..."
            try:
                # Wait for the button text to change from AUTHENTICATING... to something else,
                # or wait for navigation to complete
                await page.wait_for_url("**/admin**", timeout=10000)
                print("✅ SUCCESS: Successfully redirected to the dashboard!")
            except Exception as e:
                # If it didn't redirect, check if it's stuck on AUTHENTICATING
                button_text = await page.inner_text('button[type="submit"]')
                if "AUTHENTICATING" in button_text.upper():
                    print("❌ ERROR: Login got stuck on 'AUTHENTICATING...' hang!")
                    sys.exit(1)
                elif "2FA" in await page.inner_text('body'):
                    print("✅ SUCCESS: Successfully reached 2FA screen (expected for admin).")
                else:
                    print(f"❌ ERROR: Failed to navigate to dashboard. Current URL: {page.url}")
                    sys.exit(1)

        except Exception as e:
            print(f"❌ TEST FAILED: {str(e)}")
            sys.exit(1)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_login())
