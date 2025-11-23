import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { User } from "../models/User.js";
import { onlyDigits, passwordStrong } from "../utils/patterns.js";

const SECRET = process.env.JWT_SECRET || "dev-secret";

const registerSchema = Joi.object({
  nombre_usuario: Joi.string().min(3).max(32).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordStrong).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
  dni: Joi.string().pattern(onlyDigits).min(6).max(12).optional(),
  nombre: Joi.string().max(64).optional(),
  apellido: Joi.string().max(64).optional(),
  telefono: Joi.string().pattern(onlyDigits).min(7).max(15).optional(),
  direccion: Joi.string().max(128).optional(),
  ciudad: Joi.string().max(64).optional(),
  provincia: Joi.string().max(64).optional(),
  pais: Joi.string().max(64).optional(),
  codigo_postal: Joi.string().pattern(onlyDigits).min(3).max(10).optional(),
  fecha_nacimiento: Joi.date().optional()
});

const loginSchema = Joi.alternatives().try(
  Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() }),
  Joi.object({ nombre_usuario: Joi.string().min(3).max(32).required(), password: Joi.string().required() }),
  Joi.object({ identificador: Joi.string().min(3).max(128).required(), password: Joi.string().required() })
);

export async function register(req, res) {
  const { nombre_usuario, email, password, dni, nombre, apellido, telefono, direccion, ciudad, provincia, pais, codigo_postal, fecha_nacimiento } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email ya registrado" });
  const existingUser = await User.findOne({ where: { nombre_usuario } });
  if (existingUser) return res.status(409).json({ message: "Nombre de usuario ya existe" });
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ nombre_usuario, email, password_hash, dni, nombre, apellido, telefono, direccion, ciudad, provincia, pais, codigo_postal, fecha_nacimiento, rol: "cliente" });
  const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, usuario: { id: user.id, nombre_usuario: user.nombre_usuario, email: user.email, rol: user.rol } });
}

export async function login(req, res) {
  const { email, nombre_usuario, identificador, password } = req.body;
  let user = null;
  if (email) {
    user = await User.findOne({ where: { email } });
  } else {
    const uname = nombre_usuario || identificador;
    if (!uname) return res.status(400).json({ message: "Datos inválidos" });
    user = await User.findOne({ where: { nombre_usuario: uname } });
  }
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });
  if (user.estado !== "activo") return res.status(403).json({ message: "Usuario inhabilitado" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });
  const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET, { expiresIn: "7d" });
  res.json({ token, usuario: { id: user.id, nombre_usuario: user.nombre_usuario, email: user.email, rol: user.rol } });
}

export async function me(req, res) {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "No encontrado" });
  res.json({ id: user.id, nombre_usuario: user.nombre_usuario, email: user.email, rol: user.rol });
}

export const schemas = { registerSchema, loginSchema };