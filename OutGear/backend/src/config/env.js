import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["PORT", "MONGO_URI"];

for (const v of requiredVars) {
  if (!process.env[v]) {
    console.error(`❌ Missing required environment variable: ${v}`);
    console.error("   Salin .env.example menjadi .env dan isi nilainya.");
    process.exit(1);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};
