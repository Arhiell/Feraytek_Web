import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { shippingMethods, checkout } from "./controllers/cartController.js";
import { requireAuth } from "./middlewares/auth.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001"],
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.options("*", cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/carrito", cartRoutes);
app.get("/api/envios/metodos", requireAuth, shippingMethods);
app.post("/api/carrito/checkout", requireAuth, checkout);

const PORT = process.env.PORT || 3000;

async function start() {
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
  });
}

start();