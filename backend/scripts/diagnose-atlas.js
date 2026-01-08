import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("🔍 MongoDB Atlas Diagnostic Tool");
console.log("================================");

// 1. Vérifier l'URL
const mongoUrl = process.env.MONGODB_URL;
console.log("\n📋 Connection String Analysis:");
console.log(`URL: ${mongoUrl}`);

if (!mongoUrl) {
    console.error("❌ MONGODB_URL not found in .env");
    process.exit(1);
}

// 2. Analyser l'URL
try {
    const url = new URL(mongoUrl);
    console.log(`✅ Protocol: ${url.protocol}`);
    console.log(`✅ Username: ${url.username}`);
    console.log(`✅ Host: ${url.hostname}`);
    console.log(`✅ Database: ${url.pathname.replace('/', '')}`);

    // Vérifier si le mot de passe est présent
    if (!url.password) {
        console.log("⚠️  Warning: No password found in URL");
    } else {
        console.log(`✅ Password: ${'*'.repeat(url.password.length)} (${url.password.length} chars)`);
    }

    // Vérifier les paramètres
    const params = new URLSearchParams(url.search);
    console.log(`✅ Params: ${params.toString()}`);

} catch (error) {
    console.error("❌ Invalid URL format:", error.message);
}

// 3. Conseils de dépannage
console.log("\n🛠️  Troubleshooting Checklist:");
console.log("1. ✅ Check if username 'Raef' exists in MongoDB Atlas");
console.log("2. ✅ Verify password is correct for user 'Raef'");
console.log("3. ✅ Ensure IP address is whitelisted in Atlas Network Access");
console.log("4. ✅ Check if cluster 'cluster0.v6scg' exists and is running");
console.log("5. ✅ Verify database user has permissions on 'connectify' database");

console.log("\n📝 Next Steps:");
console.log("1. Go to MongoDB Atlas → Database Access");
console.log("2. Check user 'Raef' exists and password matches");
console.log("3. Go to Network Access → Add current IP");
console.log("4. Try connection again with: npm run check-db");
