import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL, {
            // Options pour MongoDB Atlas (version Mongoose 7+)
            maxPoolSize: 10, // Maintient jusqu'à 10 connexions socket
            serverSelectionTimeoutMS: 5000, // Timeout après 5s
            socketTimeoutMS: 45000, // Ferme les sockets après 45s d'inactivité
            family: 4, // Force IPv4
        });

        console.log("✅ MongoDB Atlas Connected Successfully");
        console.log(`📊 Database: ${connection.connection.name}`);

    } catch (error) {
        console.error("❌ Error connecting to MongoDB Atlas:", error.message);
        process.exit(1);
    }
};

export default dbConnection;