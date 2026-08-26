# Google Sheets contact-form setup

1. Create a new Google Sheet in the Google account that should own the enquiries.
2. In that sheet, open **Extensions > Apps Script**.
3. Replace the editor contents with `google-apps-script.gs` from this project.
4. Change `YOUR_EMAIL@example.com` to the inbox that should receive notifications.
5. Copy the Sheet ID from its URL and replace `YOUR_GOOGLE_SHEET_ID` in the script.
   For a URL like `https://docs.google.com/spreadsheets/d/ABC123/edit`, the ID is
   `ABC123`.
6. Click **Deploy > New deployment**, select **Web app**, then use:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. Click **Deploy**, authorize the requested access, and copy the `/exec` Web app URL.
8. In `index.html`, replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` with that URL.
9. Upload/deploy the updated website, submit one test enquiry, and confirm both the
   **Enquiries** sheet tab and the notification inbox receive it.

If you edit the Apps Script later, create a new deployment version from
**Deploy > Manage deployments > Edit**. Keep using the same `/exec` URL.

The browser uses a `no-cors` request because Apps Script redirects web-app
responses. That means the website can confirm that the browser handed off the
request, but it cannot read Apps Script's final response. Always perform the test
in step 9 before publishing.
