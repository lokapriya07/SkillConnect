require('dotenv').config();
const mongoose = require('mongoose');

async function removeGhostIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // This targets the 'works' collection directly
        await mongoose.connection.collection('works').dropIndex('email_1');

        console.log("✅ Successfully dropped 'email_1' index!");
    } catch (err) {
        console.log("❌ Error:", err.message.includes('not found')
            ? "Index already gone!"
            : err.message);
    } finally {
        mongoose.disconnect();
    }
}

removeGhostIndex();