// const mongoose = require("mongoose");

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);

//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (err) {
//         console.error(err.message);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("Connecting...");

        mongoose.connection.on("connecting", () => {
            console.log("Mongoose: connecting...");
        });

        mongoose.connection.on("connected", () => {
            console.log("Mongoose: connected");
        });

        mongoose.connection.on("error", (err) => {
            console.log("Mongoose Error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("Mongoose: disconnected");
        });

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("MongoDB Connected:", conn.connection.host);

    } catch (err) {
        console.log("Caught Error:");
        console.log(err);
    }
};

module.exports = connectDB;