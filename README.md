# ⚡ Memegemini — AI Multi-Variant Meme Generator

> Upload any image. Add context. Watch Google Gemini craft three hilarious, sarcastic meme variants — ready to edit and download in seconds.

---

## What is Memegemini?

MemeGemini is a browser-based meme creation tool powered by **Google Gemini's multimodal AI**. It analyzes the visual content of any image you upload — reading expressions, body language, energy, and context — and automatically generates **3 distinct, caption-ready meme variants** with intelligent placement, dynamic font sizing, and real-time canvas editing.

No accounts. No servers. Just your image, your Gemini API key, and a lot of sarcasm.

---

## How to Use

### 1. Get a Gemini API Key
- Visit [Google AI Studio](https://aistudio.google.com/api-keys) and generate a free API key.
- In the app, click **"Configure API Key"** in the top-right header and paste your key.
- Your key is stored **only in your browser's local storage** — it is never sent to any third-party server.

### 2. Upload Your Image
- Drag and drop any image onto the upload zone, or click **"Browse File"** to select one.
- Supported formats: **PNG, JPG, JPEG, WEBP**.

### 3. (Optional) Add a Sarcastic Context
- Type a custom theme or topic in the text box — e.g., *"developer debugging production on a Friday evening"* or *"cat trying to understand taxes"*.
- If left blank, Gemini defaults to universally relatable, everyday humor.

### 4. Choose a Gemini Model
- Select your preferred Gemini model from the dropdown:
  - `gemini-3.1-pro-preview` (Recommended)
  - `gemini-2.5-pro`
  - `gemini-2.5-flash`

### 5. Generate
- Hit **"Generate 3 Meme Variants"** and watch the progress bar as Gemini analyzes your image and composes the captions.

### 6. Edit & Download
- Each of the 3 output variants has its own live editing panel:
  - Customize **top and bottom captions**
  - Adjust **font size, font family, text color, outline color, and outline thickness**
  - Changes are reflected on the canvas **in real-time**
- Click **"Download Meme"** to save a variant as a PNG, **"Copy"** to copy it directly to your clipboard, or **"Download All"** to grab all three at once.

### Try Without an API Key
- Click **"Try with Demo Mode"** to load pre-built mock captions and explore the editor without needing a key.

---

## Capabilities

**AI-Powered Visual Analysis**
Gemini reads the uploaded image at a multimodal level — identifying characters, expressions, visual energy, and situational context — to produce captions that are genuinely relevant to the image, not generic placeholder text.

**The Law of Emotional Inversion**
At the core of the caption engine is a humor formula: high-energy images get low-stakes, mundane captions; calm images get dramatic, existential reactions. This contrast is what makes memes actually funny.

**3 Distinct Humor Variants Per Generation**
Every generation produces three stylistically different takes:
- Classical internet sarcasm
- Modern meta / self-deprecating humor
- Creative situational comedy

**Dynamic Caption Placement**
The AI decides whether a meme works best with top text only, bottom text only, or both — keeping the layout clean and uncluttered per variant.

**AI-Suggested Font Sizing**
Caption font size is dynamically scaled by the AI based on caption length (short punchy captions get large text; longer captions get smaller, fitted text) and further adjusted to match the native resolution of your image.

**Real-Time Canvas Editing**
Every styling control — text content, font, size, color, outline — updates the meme canvas live as you type or adjust, with no re-generation needed.

**Smart Word-Wrap Engine**
A built-in canvas compositing engine handles multi-line text wrapping, drop shadows, and stroke rendering natively to produce crisp, properly formatted output at any image resolution.

**Custom Topic Support**
Provide a specific theme and Gemini will align all 3 variants to that context while still applying emotional inversion and visual analysis — making it useful for niche communities, professional inside jokes, or themed content.

**Privacy-First API Key Handling**
Your Gemini API key is stored locally in the browser. The app makes calls directly from your browser to Google's API — no backend, no key exposure to any intermediary.

**Demo Mode**
No key? No problem. A built-in demo mode loads pre-packaged mock captions so you can explore the full editing experience immediately.

---

## Tech Stack

- **Vanilla HTML / CSS / JavaScript** — zero frameworks, zero build steps
- **Google Gemini API** (`/v1beta/models/:model/generateContent`) with structured JSON schema response
- **HTML5 Canvas API** for meme compositing and text rendering
- **Browser LocalStorage** for API key persistence

---

## Running Locally

No installation, no build process, no terminal required.

**For non-technical users:**
1. On this GitHub page, click the green **"Code"** button near the top right.
2. Select **"Download ZIP"** from the dropdown.
3. Once downloaded, find the ZIP file (usually in your Downloads folder) and extract/unzip it.
4. Open the extracted folder and double-click **`index.html`**.
5. It will open directly in your browser — no installation needed.

**For developers:**
```bash
git clone https://github.com/your-username/memegemini.git
cd memegemini
open index.html
```
Or serve it with any static file server:
```bash
npx serve .
```

---

## Roadmap

**🔍 Google Search Grounding (Planned)**
The next major feature will enable [Google Search Grounding](https://ai.google.dev/gemini-api/docs/google-search) via the Gemini API — allowing the model to pull live, real-time information from the web as part of the generation call itself. No separate search tool or pipeline needed; Gemini will natively query Google Search before composing captions, grounding the humor in current trending topics, viral moments, and breaking news. The result: memes that are sharper, more timely, and far more likely to actually land.

---

## Disclaimer

All captions and jokes are dynamically generated by AI and do not reflect the views of the tool creator or the AI labs. Use responsibly. Note: You can update System instructions to fine-tune the tool for specific use cases or content policies.
> **Note:** This is an independent personal project, not affiliated with or endorsed by Google. All trademarks belong to their respective owners.
