# Upload the Tcharize Chrome extension

## Test it on your computer

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Select **Load unpacked**.
4. Choose `apps/extension/.output/chrome-mv3`.
5. Pin Tcharize from Chrome's Extensions menu.
6. Open a normal website, select Tcharize, and paste a live API key.
7. Choose Hausa, Igbo, Yorùbá, or Naijá and select **Translate this page**.
8. Select **Show original English** to restore the page.

Chrome does not let extensions change `chrome://` pages or the Chrome Web Store. Google Search and other normal `https://` pages are supported.

## Upload it to the Chrome Web Store

1. Sign in to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
2. Pay Google's one-time developer registration fee if the account has not paid it yet.
3. Select **New item**.
4. Upload `apps/extension/.output/tcharizeextension-0.1.0-chrome.zip`.
5. Add the store description, screenshots, icon, category, and support details.
6. In the privacy form, explain that page text is sent to the Tcharize API only after the user taps translate. State that passwords, inputs, editable fields, code, hidden text, and ignored regions are skipped.
7. Submit the item for review.

## Usage and limits

The extension requires a Tcharize API key. Every translated word is charged to the workspace that owns that key. When the plan limit is reached, the extension shows the API error and stops instead of silently using another translator.

API keys are saved in Chrome extension storage on the user's device. They are sent only to the configured Tcharize API over HTTPS.
