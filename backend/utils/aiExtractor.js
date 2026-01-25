const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

// 1. MASTER SKILLS LIST
// These are the only tags the AI is allowed to return. 
// This ensures your database matching remains consistent.
const MASTER_SKILLS = [
    "plumbing", "drain_cleaning", "tap_repair", "water_tank_repair",
    "electrical", "wiring", "fan_repair", "switchboard_fix",
    "ac_repair", "ac_installation", "refrigerator_repair", "washing_machine", "microwave_repair",
    "carpentry", "furniture_assembly", "door_lock_repair", "cupboard_repair",
    "painting", "wall_putty", "waterproofing", "interior_design",
    "cleaning", "deep_cleaning", "bathroom_cleaning", "sofa_cleaning", "kitchen_cleaning",
    "pest_control", "termite_treatment", "rodent_control",
    "gardening", "landscaping", "plant_care",
    "beauty_salon", "haircut", "massage", "makeup_artist",
    "masonry", "tile_fixing", "construction", "welding",
    "general_handyman"
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Converts a local file path into a format Gemini understands
 */
const fileToGenerativePart = (path, mimeType) => {
    if (!path || !fs.existsSync(path)) return null;
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
};

/**
 * Multimodal Skill Extraction
 * Analyzes Text, Audio, and Image to find the best skill match.
 */
const extractSkillsFromMultimodal = async (text, audioPath, imagePath) => {
    // Use gemini-1.5-flash for multimodal & speed
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are a professional job-matching assistant for a home services app.
    
    INPUT DATA:
    - User Text: "${text || "None provided"}"
    - Image: Provided if a file is attached.
    - Audio: Provided if a file is attached.

    AVAILABLE SKILLS: [${MASTER_SKILLS.join(", ")}]

    TASK:
    1. Look at the image to identify the broken object or service needed.
    2. Listen to the audio. The user may speak in ANY language (Hindi, Telugu, Tamil, etc.). Translate the intent to find the service required.
    3. If the user is uneducated and provided no text, rely 100% on the Image and Audio.
    4. Return ONLY a JSON array of strings from the "AVAILABLE SKILLS" list.
    5. If no match is found, return ["general_handyman"].

    OUTPUT FORMAT:
    ["skill1", "skill2"]
    `;

    try {
        const parts = [prompt];

        // Attach Image (if exists)
        const imagePart = fileToGenerativePart(imagePath, "image/jpeg");
        if (imagePart) parts.push(imagePart);

        // Attach Audio (if exists)
        const audioPart = fileToGenerativePart(audioPath, "audio/m4a"); // Adjust mimeType if using different format
        if (audioPart) parts.push(audioPart);

        const result = await model.generateContent(parts);
        const responseText = result.response.text().trim();

        // Clean JSON formatting (remove markdown backticks)
        const cleanedJson = responseText.replace(/```json|```/g, "");

        const skills = JSON.parse(cleanedJson);

        // Final safety check: Ensure returned skills exist in MASTER_SKILLS
        return skills.filter(skill => MASTER_SKILLS.includes(skill));

    } catch (error) {
        console.error("❌ AI Multimodal Extraction Failed:", error);
        // Fallback to ensure the job is still visible to general workers
        return ["general_handyman"];
    }
};

module.exports = {
    extractSkillsFromMultimodal,
    MASTER_SKILLS
};