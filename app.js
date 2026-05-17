/* Custom App Logic for MemeGemini */

// Global State Object
const state = {
    apiKey: '',
    uploadedImageSrc: '', // Base64 encoding
    originalImage: null,  // HTML Image object
    variants: [
        { topText: '', bottomText: '', description: '', fontFamily: 'Outfit', fontSize: 50, textColor: '#ffffff', strokeColor: '#000000', strokeWidth: 5 },
        { topText: '', bottomText: '', description: '', fontFamily: 'Outfit', fontSize: 50, textColor: '#ffffff', strokeColor: '#000000', strokeWidth: 5 },
        { topText: '', bottomText: '', description: '', fontFamily: 'Outfit', fontSize: 50, textColor: '#ffffff', strokeColor: '#000000', strokeWidth: 5 }
    ]
};

// Initialize Application on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    loadApiKey();
    setupEventListeners();
    setupCanvasInputListeners();
});

// Load API Key from LocalStorage
function loadApiKey() {
    const savedKey = localStorage.getItem('gemini_api_key');
    const statusBtn = document.getElementById('api-status-btn');
    const statusText = document.getElementById('api-status-text');
    const apiWarningTip = document.getElementById('api-warning-tip');

    if (savedKey) {
        state.apiKey = savedKey;
        document.getElementById('api-key-input').value = savedKey;

        // Update header status indicators
        statusBtn.className = 'status-btn key-configured';
        statusText.textContent = 'Key Configured';

        // Hide left panel warning tip
        apiWarningTip.classList.add('hidden');

        // Enable generate button if image is loaded
        toggleGenerateBtnState();
    } else {
        state.apiKey = '';
        document.getElementById('api-key-input').value = '';

        statusBtn.className = 'status-btn key-missing';
        statusText.textContent = 'Configure API Key';
        apiWarningTip.classList.remove('hidden');

        toggleGenerateBtnState();
    }
}

// Setup Drag and Drop / Form Listeners
function setupEventListeners() {
    const uploadZone = document.getElementById('upload-zone');
    const imageInput = document.getElementById('image-input');
    const changeImageBtn = document.getElementById('change-image-btn');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        }, false);
    });

    uploadZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files[0]) {
            handleImageUpload(files[0]);
        }
    }, false);

    imageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    });

    changeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click bubbling to uploadZone
        resetUploadedImage();
    });

    generateBtn.addEventListener('click', () => {
        generateMemes();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearWorkspace();
        });
    }
}

// Toggle Visibility of the API Modal Popup
function toggleApiModal(show) {
    const modal = document.getElementById('api-modal');
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

// Save API Key Function
function saveApiKey() {
    const keyInput = document.getElementById('api-key-input').value.trim();
    if (!keyInput) {
        showToast('Please enter a valid API key');
        return;
    }

    localStorage.setItem('gemini_api_key', keyInput);
    loadApiKey();
    toggleApiModal(false);
    showToast('Gemini API Key successfully saved!');
}

// Remove API Key Function
function removeApiKey() {
    localStorage.removeItem('gemini_api_key');
    document.getElementById('api-key-input').value = '';
    loadApiKey();
    toggleApiModal(false);
    showToast('API Key removed from browser storage.');
}

// Visibility Toggle for API Key Input (Masking)
function toggleKeyVisibility() {
    const input = document.getElementById('api-key-input');
    const icon = document.querySelector('#key-visibility-toggle i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

// Process Uploaded Image Files
function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Invalid file format. Please upload an image.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.originalImage = img;
            state.uploadedImageSrc = e.target.result;

            // Show upload preview overlay
            document.getElementById('upload-preview-img').src = e.target.result;
            document.getElementById('upload-preview-container').classList.remove('hidden');

            toggleGenerateBtnState();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Reset Upload State
function resetUploadedImage() {
    state.uploadedImageSrc = '';
    state.originalImage = null;

    document.getElementById('image-input').value = '';
    document.getElementById('upload-preview-img').src = '';
    document.getElementById('upload-preview-container').classList.add('hidden');

    toggleGenerateBtnState();
}

// Complete Reset of the entire Workspace State
function clearWorkspace() {
    // 1. Reset uploaded image state
    resetUploadedImage();

    // 2. Clear sarcastic context input
    document.getElementById('prompt-input').value = '';

    // 3. Clear global state text variants
    for (let i = 0; i < 3; i++) {
        state.variants[i].topText = '';
        state.variants[i].bottomText = '';
        state.variants[i].description = '';

        // Reset inputs in UI
        document.getElementById(`top-text-v${i}`).value = '';
        document.getElementById(`bottom-text-v${i}`).value = '';
        document.getElementById(`font-size-v${i}`).value = 50; // Reset font size default
        document.getElementById(`explanation-v${i}`).textContent = 'Analyzing context...';

        // Clear canvas
        const canvas = document.getElementById(`canvas-v${i}`);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 4. Hide output panels and restore waiting placeholder
    document.getElementById('output-success').classList.add('hidden');
    document.getElementById('output-loading').classList.add('hidden');
    document.getElementById('output-placeholder').classList.remove('hidden');

    showToast('Workspace cleared! Ready to start fresh 🎨');
}

// Determine if we can generate memes
function toggleGenerateBtnState() {
    const generateBtn = document.getElementById('generate-btn');
    const imageLoaded = !!state.originalImage;
    const hasKey = !!state.apiKey;

    // Enable generation button either if they have an API Key AND an image, or we enable it for demo triggers
    generateBtn.disabled = !imageLoaded || !hasKey;
}

// Triggers Toast Feedback
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Setup input listeners to redrawn canvas in real-time
function setupCanvasInputListeners() {
    for (let i = 0; i < 3; i++) {
        // Captions
        document.getElementById(`top-text-v${i}`).addEventListener('input', (e) => {
            state.variants[i].topText = e.target.value;
            redrawMemeCanvas(i);
        });

        document.getElementById(`bottom-text-v${i}`).addEventListener('input', (e) => {
            state.variants[i].bottomText = e.target.value;
            redrawMemeCanvas(i);
        });

        // Font Properties
        document.getElementById(`font-size-v${i}`).addEventListener('input', (e) => {
            state.variants[i].fontSize = parseInt(e.target.value) || 30;
            redrawMemeCanvas(i);
        });

        document.getElementById(`font-family-v${i}`).addEventListener('change', (e) => {
            state.variants[i].fontFamily = e.target.value;
            redrawMemeCanvas(i);
        });

        // Colors & Stroke
        document.getElementById(`text-color-v${i}`).addEventListener('input', (e) => {
            state.variants[i].textColor = e.target.value;
            redrawMemeCanvas(i);
        });

        document.getElementById(`stroke-color-v${i}`).addEventListener('input', (e) => {
            state.variants[i].strokeColor = e.target.value;
            redrawMemeCanvas(i);
        });

        document.getElementById(`stroke-width-v${i}`).addEventListener('input', (e) => {
            state.variants[i].strokeWidth = parseInt(e.target.value);
            redrawMemeCanvas(i);
        });
    }
}

// CORE COMPOSITING CANVAS ENGINE
function redrawMemeCanvas(index) {
    const variant = state.variants[index];
    const canvas = document.getElementById(`canvas-v${index}`);
    const ctx = canvas.getContext('2d');
    const img = state.originalImage;

    if (!img) return;

    // 1. Set Canvas logical resolution to native picture size for crystal clear rendering
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // 2. Draw base image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 3. Compute scaled sizing based on image dimensions
    // 500px width is used as our baseline proportion
    const scaleFactor = canvas.width / 500;
    const computedFontSize = Math.round(variant.fontSize * scaleFactor);
    const computedStrokeWidth = Math.round(variant.strokeWidth * scaleFactor);
    const computedLineHeight = Math.round(computedFontSize * 1.35); // Generous line spacing for tall condensed fonts (e.g. Impact)

    // 4. Setup style metrics
    ctx.fillStyle = variant.textColor;
    ctx.strokeStyle = variant.strokeColor;
    ctx.lineWidth = computedStrokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.miterLimit = 2;
    ctx.textAlign = 'center';

    // Impact font needs loading safely, otherwise defaults to Outfit or Arial
    // Omit non-standard weights (like 900) to guarantee proper browser parsing
    ctx.font = `bold ${computedFontSize}px "${variant.fontFamily}", sans-serif`;

    // Margin from boundaries
    const sideMargin = canvas.width * 0.05;
    const maxTextWidth = canvas.width - (sideMargin * 2);

    // 5. Draw Top Text
    if (variant.topText) {
        const topY = canvas.height * 0.05 + computedFontSize;
        drawWrappedText(ctx, variant.topText.toUpperCase(), canvas.width / 2, topY, maxTextWidth, computedLineHeight, scaleFactor, true);
    }

    // 6. Draw Bottom Text
    if (variant.bottomText) {
        const bottomY = canvas.height * 0.95;
        drawWrappedText(ctx, variant.bottomText.toUpperCase(), canvas.width / 2, bottomY, maxTextWidth, computedLineHeight, scaleFactor, false);
    }
}

// Smart word-wrap canvas engine supporting multi-line layouts
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, scaleFactor, isTop) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
        let testLine = currentLine + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());

    // Adjust lines layout
    if (isTop) {
        // Draw from top going down
        // 1. Draw strokes with an elegant subtle drop shadow for high readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = Math.round(5 * scaleFactor);
        ctx.shadowOffsetX = Math.round(3 * scaleFactor);
        ctx.shadowOffsetY = Math.round(3 * scaleFactor);

        for (let i = 0; i < lines.length; i++) {
            const lineY = y + (i * lineHeight);
            ctx.strokeText(lines[i], x, lineY);
        }

        // 2. Disable shadow and draw solid fills on top so they remain completely clean and crisp
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (let i = 0; i < lines.length; i++) {
            const lineY = y + (i * lineHeight);
            ctx.fillText(lines[i], x, lineY);
        }
    } else {
        // Draw from bottom going up (reverse index logic)
        // 1. Draw strokes with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = Math.round(5 * scaleFactor);
        ctx.shadowOffsetX = Math.round(3 * scaleFactor);
        ctx.shadowOffsetY = Math.round(3 * scaleFactor);

        for (let i = 0; i < lines.length; i++) {
            const index = lines.length - 1 - i;
            const lineY = y - (i * lineHeight);
            ctx.strokeText(lines[index], x, lineY);
        }

        // 2. Disable shadow and draw fills
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (let i = 0; i < lines.length; i++) {
            const index = lines.length - 1 - i;
            const lineY = y - (i * lineHeight);
            ctx.fillText(lines[index], x, lineY);
        }
    }
}

// Generate Memes via Gemini API Call
async function generateMemes() {
    if (!state.apiKey) {
        toggleApiModal(true);
        return;
    }

    const model = document.getElementById('model-selector').value;
    const userPrompt = document.getElementById('prompt-input').value.trim();

    // Switch UI panels to loading state
    document.getElementById('output-placeholder').classList.add('hidden');
    document.getElementById('output-success').classList.add('hidden');

    const loadingScreen = document.getElementById('output-loading');
    const progressBar = document.getElementById('loading-progress');
    const statusText = document.getElementById('loading-status-text');

    loadingScreen.classList.remove('hidden');

    // Simulate loading progress steps
    updateLoadingProgress(15, 'Compressing uploaded image canvas...');

    // Convert base64 base parameters to Gemini API structured image format
    const base64Data = state.uploadedImageSrc.split(',')[1];
    const mimeType = state.uploadedImageSrc.split(';')[0].split(':')[1];

    updateLoadingProgress(35, 'Composing prompt & contacting Google Gemini...');

    // Construct System Prompt
    const systemPrompt = `You are a sarcastic, witty, and internet-culture-savvy Meme Caption Analyst.
    
CRITICAL VISUAL ANALYSIS INSTRUCTION:
1. Deeply analyze the uploaded image: identify the characters (whether humans, animals, objects, food, or scenery), their exact expressions, body language, apparent personality, the action taking place, and the visual context.
2. Generate exactly 3 diverse, hilarious meme caption variants that are CUSTOM-FIT and DIRECTLY RELEVANT to the characters, actions, and vibe visually depicted in the image. The humor must stem organically and logically from the visual subject matter of the picture!

THE ABSOLUTE LAW OF EMOTIONAL INVERSION (HIGH DRAMA, LOW STAKES):
This is the single unbreakable law that governs all viral internet humor. The humor of a meme lives entirely in the *friction* between the emotional weight of the image and the triviality/contrast of the caption. You must apply this formula strictly:
1. Analyze the image's visual energy level on a scale of 1 to 10:
   - IF the image energy is HIGH (10/10: intense expressions, screaming, crying, heavy drama, high-stakes combat/cinematic vibes, wreckage/chaos):
     -> Write a caption about a LOW-STAKES, microscopic, mundane daily problem (e.g., a minor chore, a typo, a tiny unexpected expense, missing a water bottle, waiting 30 seconds for a microwave, leaving a room).
   - IF the image energy is LOW (1/10: calm stare, blank expression, sleeping animal, completely empty room):
     -> Write a caption about a HIGH-STAKES, level-10 existential crisis or dramatic internal reaction (e.g., career worries, a memory of an awkward interaction from 7 years ago, eye contact with a stranger, existential realizations at 3 AM).
2. CONTRAST CREATES COMEDY. Avoid literal or flat descriptions. Pair dramatic visuals with minor mundane problems, and calm visuals with intense mental standoffs or crisis reactions.

CRITICAL UNIVERSAL RELATABILITY & CONTEXT SELECTION INSTRUCTION:
1. The memes must be highly relatable, universally understandable, and perfectly suited to the visual context.
2. If the user HAS NOT specified a custom topic (the context input is empty):
   - You must strictly stick to general, everyday life themes (such as procrastination, general impatience, standard daily routines, simple human observations, eating, sleeping, weather, or standard relatable thoughts).
   - Do NOT reference or assume any specific workplace, industry, profession, corporate setting, or technical domain. Keep the jokes simple, globally clear, and funny to a general audience of any age or background.
3. If the user HAS explicitly provided a sarcastic context/topic (which is: "${userPrompt}"):
   - You MUST prioritize and strictly align all 3 meme variants to this requested topic: "${userPrompt}".
   - Override the generic-only constraint completely to focus aggressively on the user's topic, but make sure the captions remain direct, clever visual commentaries on the characters, expressions, and actions depicted in the image, strictly using the Law of Emotional Inversion.

CRITICAL PLACEMENT INSTRUCTION: You do NOT have to write both a top and a bottom text for every meme! Based on the image layout, subject position, and style of humor, you must dynamically decide the best text placement:
- If a meme is best served with both top and bottom captions, populate both topText and bottomText.
- If a meme is punchier with ONLY a bottom caption, leave topText as an empty string ("") and populate bottomText.
- If a meme is punchier with ONLY a top caption, populate topText and leave bottomText as an empty string ("").
Determine this dynamically for each of the 3 variants so they present a clean, un-cluttered, and professional aesthetic!

CRITICAL FONT-SIZE INSTRUCTION: You must dynamically suggest the optimal baseline font size (fontSize) as an integer between 25 and 65:
- For short, highly punchy captions (e.g., 1-4 words), choose a larger size (e.g., 52 to 65) to make it stand out dramatically.
- For medium length captions (e.g., 5-8 words), use standard sizing (e.g., 40 to 50).
- For longer captions (e.g., 9+ words), use smaller values (e.g., 25 to 35) to prevent text clipping and fit the lines beautifully.

CRITICAL GLOBAL RELATABILITY & TREND INSTRUCTION:
- Use globally recognized internet meme formats, universal daily humor styles, and widely understood situational irony.
- Employ simple, clear, globally accessible phrasing and universal internet formats (e.g., "POV: ...", "When you finally...", "Me trying to...", "Expectation vs. Reality", "That feeling when...", "Nobody:", "Before vs. After").
- Avoid highly regional, culturally specific, or localized slang that might not be understood by a global audience of different age groups, languages, or nationalities. The humor must be cross-cultural, universally clear, and easily relatable to any average person worldwide!
- Ensure the humor is razor-sharp, satirical, and aligns perfectly with how real people react online today!

Make sure to deliver distinct perspectives:
- Variant 1: Classical Internet Humor (simple, punchy, sarcastic using Emotional Inversion).
- Variant 2: Modern Meta Humor (highly relatable, self-deprecating, dry wit using Emotional Inversion).
- Variant 3: Creative situational comedy (using Emotional Inversion).

For each variant, also write a 1-sentence 'description' explaining the punchline. Keep your texts concise, punchy, and fully optimized to fit within typical meme dimensions.`;

    // API Payload configuration
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: systemPrompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }
        ],

        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    variants: {
                        type: "ARRAY",
                        description: "List of 3 meme text overlays",
                        items: {
                            type: "OBJECT",
                            properties: {
                                topText: { type: "STRING", description: "Top caption of the meme (leave empty if humor works better with only bottom text)" },
                                bottomText: { type: "STRING", description: "Bottom caption of the meme (leave empty if humor works better with only top text)" },
                                fontSize: { type: "INTEGER", description: "Suggested optimal baseline font size for this caption length, between 25 and 65 (default fallback: 45)" },
                                description: { type: "STRING", description: "Sarcastic description of the joke context" }
                            },
                            required: ["topText", "bottomText", "fontSize", "description"]
                        }
                    }
                },
                required: ["variants"]
            }
        }
    };

    updateLoadingProgress(60, `Gemini (${model}) is analyzing visual contents...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorDetails = await response.json().catch(() => ({}));
            throw new Error(errorDetails.error?.message || `HTTP status ${response.status}`);
        }

        updateLoadingProgress(85, 'Captions acquired! Rendering composites...');

        const resultJson = await response.json();

        // Extract contents
        const contentText = resultJson.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(contentText);

        if (!parsed.variants || parsed.variants.length < 3) {
            throw new Error("Gemini returned incomplete caption variations.");
        }

        // Apply generated captions to state
        for (let i = 0; i < 3; i++) {
            state.variants[i].topText = parsed.variants[i].topText || '';
            state.variants[i].bottomText = parsed.variants[i].bottomText || '';
            state.variants[i].description = parsed.variants[i].description || '';

            // Set dynamic AI suggested font size (fallback to 45 if not specified)
            const aiFontSize = parseInt(parsed.variants[i].fontSize) || 45;
            state.variants[i].fontSize = aiFontSize;

            // Render on Inputs
            document.getElementById(`top-text-v${i}`).value = state.variants[i].topText;
            document.getElementById(`bottom-text-v${i}`).value = state.variants[i].bottomText;
            document.getElementById(`font-size-v${i}`).value = state.variants[i].fontSize;
            document.getElementById(`explanation-v${i}`).textContent = `💡 Joke: ${state.variants[i].description}`;

            // Trigger Canvas drawing
            redrawMemeCanvas(i);
        }

        updateLoadingProgress(100, 'Memes generated successfully!');

        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            document.getElementById('output-success').classList.remove('hidden');
            showToast('3 meme variants prepared! Scroll down to edit.');
        }, 600);

    } catch (error) {
        console.error("Gemini API Error:", error);
        loadingScreen.classList.add('hidden');
        document.getElementById('output-placeholder').classList.remove('hidden');
        showToast(`API Failure: ${error.message}. Check your key and parameters.`);
    }
}

// Utility loading progress meter
function updateLoadingProgress(pct, statusMsg) {
    document.getElementById('loading-progress').style.width = `${pct}%`;
    document.getElementById('loading-status-text').textContent = statusMsg;
}

// Load a Mock Demo (Pre-packaged Developer-themed variants) for user to run immediately without keys
function loadMockDemo() {
    // 1. Check if they have loaded an image. If not, supply a beautiful mockup template.
    if (!state.originalImage) {
        // Construct a stylized canvas base internally
        const canvasMock = document.createElement('canvas');
        canvasMock.width = 600;
        canvasMock.height = 600;
        const ctx = canvasMock.getContext('2d');

        // Draw a premium solid grid gradient mock background so it looks polished
        const grad = ctx.createLinearGradient(0, 0, 600, 600);
        grad.addColorStop(0, '#120c1f');
        grad.addColorStop(0.5, '#240046');
        grad.addColorStop(1, '#7b2cbf');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 600);

        // Draw some funny visual elements inside the base mock image
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ MEMEGEMINI DEMO', 300, 240);

        ctx.font = '22px "Inter", sans-serif';
        ctx.fillStyle = '#a9a9bf';
        ctx.fillText('API Offline Mock Template', 300, 290);
        ctx.fillText('(Load your custom image to generate tailored captions)', 300, 325);

        ctx.font = '110px "Inter", sans-serif';
        ctx.fillText('👽', 300, 460);

        const mockImg = new Image();
        mockImg.onload = () => {
            state.originalImage = mockImg;
            state.uploadedImageSrc = canvasMock.toDataURL('image/png');
            document.getElementById('upload-preview-img').src = state.uploadedImageSrc;
            document.getElementById('upload-preview-container').classList.remove('hidden');
            triggerMockFulfill();
        };
        mockImg.src = canvasMock.toDataURL('image/png');
    } else {
        triggerMockFulfill();
    }
}

// Renders 3 classical generic jokes on their canvases
function triggerMockFulfill() {
    const mockCaptions = [
        {
            topText: "Me: I'm going to sleep early tonight",
            bottomText: "Also me at 3:00 AM researching why dinosaurs went extinct",
            fontSize: 45,
            description: "Variant 1: Relatable late-night procrastination, utilizing both top and bottom captions."
        },
        {
            topText: "",
            bottomText: "Me looking at the food in the microwave like it's going to cook faster if I stare at it",
            fontSize: 34,
            description: "Variant 2: Universal everyday impatience, utilizing ONLY a bottom caption."
        },
        {
            topText: "POV: You successfully set up a doctor's appointment all by yourself like a real adult",
            bottomText: "",
            fontSize: 32,
            description: "Variant 3: Sarcastic milestone of adulting, utilizing ONLY a top caption."
        }
    ];

    // Trigger local simulations
    document.getElementById('output-placeholder').classList.add('hidden');
    const loadingScreen = document.getElementById('output-loading');
    loadingScreen.classList.remove('hidden');

    updateLoadingProgress(30, 'Simulating mock analyzer contents...');

    setTimeout(() => {
        updateLoadingProgress(70, 'Building viral punchlines...');
        setTimeout(() => {

            for (let i = 0; i < 3; i++) {
                state.variants[i].topText = mockCaptions[i].topText;
                state.variants[i].bottomText = mockCaptions[i].bottomText;
                state.variants[i].fontSize = mockCaptions[i].fontSize;
                state.variants[i].description = mockCaptions[i].description;

                document.getElementById(`top-text-v${i}`).value = mockCaptions[i].topText;
                document.getElementById(`bottom-text-v${i}`).value = mockCaptions[i].bottomText;
                document.getElementById(`font-size-v${i}`).value = mockCaptions[i].fontSize;
                document.getElementById(`explanation-v${i}`).textContent = `💡 Mock Joke: ${mockCaptions[i].description}`;

                redrawMemeCanvas(i);
            }

            loadingScreen.classList.add('hidden');
            document.getElementById('output-success').classList.remove('hidden');
            showToast('Loaded developer mock templates! Customize freely.');
        }, 600);
    }, 500);
}

// Download Meme Image
function downloadMeme(index) {
    const canvas = document.getElementById(`canvas-v${index}`);
    const dataUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = `memegemini_variant_${index + 1}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Meme Variant ${index + 1} downloaded successfully!`);
}

// Copy Meme Canvas as PNG directly to Clipboard
function copyMemeToClipboard(index) {
    const canvas = document.getElementById(`canvas-v${index}`);

    try {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                showToast('Clipboard error: failed to read canvas data.');
                return;
            }
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            showToast(`Variant ${index + 1} copied to clipboard! Ready to paste.`);
        }, 'image/png');
    } catch (err) {
        console.error(err);
        showToast('Direct copying not supported by your browser. Use Download instead.');
    }
}

// Download all three memes sequentially
document.getElementById('download-all-btn').addEventListener('click', () => {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            downloadMeme(i);
        }, i * 350); // Small delay to prevent browsers blocking multiple downloads
    }
    showToast('Triggered download sequence for all 3 variants.');
});