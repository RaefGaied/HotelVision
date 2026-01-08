import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

const checkConnection = async () => {
    console.log("🔍 Checking MongoDB Atlas connection...");

    if (!process.env.MONGODB_URL) {
        console.error("❌ MONGODB_URL not found in .env file");
        process.exit(1);
    }

    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL, {
            maxPoolSize: 1,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });

        console.log("✅ Connection successful!");
        console.log(`📊 Database: ${connection.connection.name}`);
        console.log(`🌐 Host: ${connection.connection.host}`);
        console.log(`📍 Port: ${connection.connection.port}`);

        // Test simple query
        const collections = await connection.connection.db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);
        collections.forEach(collection => {
            console.log(`   - ${collection.name}`);
        });

        await mongoose.disconnect();
        console.log("🔌 Disconnected successfully");

    } catch (error) {
        console.error("❌ Connection failed:", error.message);

        if (error.message.includes("ENOTFOUND")) {
            console.log("💡 Tip: Check your cluster name and network connection");
        } else if (error.message.includes("Authentication failed")) {
            console.log("💡 Tip: Check your username and password");
        } else if (error.message.includes("ENOTAUTHORIZED")) {
            console.log("💡 Tip: Check IP whitelist in MongoDB Atlas");
        }

        process.exit(1);
    }
};

checkConnection();
