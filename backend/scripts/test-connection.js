import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

const testConnection = async (url, description) => {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`🔗 URL: ${url}`);

    try {
        const connection = await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ SUCCESS: Connected to ${connection.connection.name}`);
        console.log(`📊 Database: ${connection.connection.name}`);
        console.log(`🌐 Host: ${connection.connection.host}`);

        await mongoose.disconnect();
        return true;

    } catch (error) {
        console.error(`❌ FAILED: ${error.message}`);
        return false;
    }
};

const runTests = async () => {
    console.log("🔍 MongoDB Atlas Connection Tests");
    console.log("==================================");

    const baseUrl = "mongodb+srv://RaefGaied:nuV4wlKsfzurQUuL@cluster0.v6scg.mongodb.net";

    const tests = [
        {
            url: `${baseUrl}/test?retryWrites=true&w=majority`,
            description: "With database 'test'"
        },
        {
            url: `${baseUrl}/connectify?retryWrites=true&w=majority`,
            description: "With database 'connectify'"
        },
        {
            url: `${baseUrl}/admin?retryWrites=true&w=majority`,
            description: "With database 'admin'"
        },
        {
            url: `${baseUrl}?retryWrites=true&w=majority`,
            description: "Without specifying database"
        }
    ];

    let success = false;
    for (const test of tests) {
        const result = await testConnection(test.url, test.description);
        if (result) {
            success = true;
            console.log(`\n🎉 WORKING URL: ${test.url}`);
            break;
        }
    }

    if (!success) {
        console.log("\n🚨 All connection attempts failed!");
        console.log("\n📝 Possible issues:");
        console.log("1. IP address not whitelisted in Atlas");
        console.log("2. User permissions insufficient");
        console.log("3. Cluster not running");
        console.log("4. Incorrect username/password");

        console.log("\n🔧 Next steps:");
        console.log("1. Go to MongoDB Atlas → Network Access");
        console.log("2. Click 'Add IP Address' → 'Allow Access from Anywhere' (0.0.0.0/0)");
        console.log("3. Or add your current IP address");
        console.log("4. Try again: npm run check-db");
    }
};

runTests();
