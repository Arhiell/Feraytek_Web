import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3001"], credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
  });
}

start();