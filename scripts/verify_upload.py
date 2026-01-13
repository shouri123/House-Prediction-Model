import os
import time
from playwright.sync_api import sync_playwright

def verify_upload():
    # Use the existing frontend URL
    url = "http://localhost:5173"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print(f"Navigating to {url}...")
            page.goto(url)

            # Wait for the "Click to upload" text which is visible
            print("Waiting for upload area...")
            page.wait_for_selector("text=Click to upload", timeout=10000)

            # Create a dummy CSV file for testing
            csv_content = """longitude,latitude,housing_median_age,total_rooms,total_bedrooms,population,households,median_income,ocean_proximity
-122.23,37.88,41.0,880.0,129.0,322.0,126.0,8.3252,NEAR BAY
-122.22,37.86,21.0,7099.0,1106.0,2401.0,1138.0,8.3014,NEAR BAY"""

            with open("test_housing.csv", "w") as f:
                f.write(csv_content)

            print("Uploading file...")
            # We target the hidden input directly. Playwright handles this fine for set_input_files
            page.locator('input[type="file"]').set_input_files("test_housing.csv")

            # There is no button to click, the upload happens onChange of the input.

            # Wait for results
            print("Waiting for results...")

            # The header is "PREDICTED PRICE" (uppercase in CSS)
            # We can look for that text.
            page.wait_for_selector("text=PREDICTED PRICE", timeout=20000)
            print("Found header: PREDICTED PRICE")

            # Verify we have some dollar values in the table
            # The code formats as $452,600.00
            # Look for a cell starting with $

            # Get text content of the page to debug if needed
            content = page.content()

            if "$" in content:
                print("Found dollar signs in content, indicating predictions are displayed.")
            else:
                print("WARNING: No dollar signs found.")

            print("Taking screenshot...")
            page.screenshot(path="verification_success.png")
            print("Verification Successful!")

        except Exception as e:
            print(f"Verification Failed: {e}")
            page.screenshot(path="verification_failure.png")
            raise e
        finally:
            browser.close()
            # Cleanup
            if os.path.exists("test_housing.csv"):
                os.remove("test_housing.csv")

if __name__ == "__main__":
    verify_upload()
