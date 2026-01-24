const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
// Expanded Master Skill List integrated directly
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

const extractSkillsFromDescription = async (text) => {
    // Using gemini-1.5-flash for fast and cost-effective extraction
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Job Description: "${text}"
    Available Skills: [${MASTER_SKILLS.join(", ")}]

    Task:
    1. Identify the most relevant skills from the "Available Skills" list that match the description.
    2. Return ONLY a JSON array of strings (e.g., ["plumbing", "tap_repair"]). 
    3. If no clear match exists, return ["general_handyman"].
    4. Provide no markdown formatting, no code blocks, and no explanation.
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Clean up any potential markdown formatting the AI might include
        const cleanedJson = responseText.replace(/```json|```/g, "");

        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("AI Skill Extraction Failed:", error);
        // Fallback to general category to ensure the job is still findable
        return ["general_handyman"];
    }
};

module.exports = { extractSkillsFromDescription };