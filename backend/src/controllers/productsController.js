import Joi from "joi";
import { Op } from "sequelize";
import { Product } from "../models/Product.js";

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  categoria: Joi.any().optional(),
  q: Joi.string().allow("").optional(),
  estado: Joi.string().valid("activo","inactivo","todos").default("activo")
});

export async function list(req,res){
  const { value, error } = listSchema.validate(req.query||{});
  if(error) return res.status(400).json({ message:"Parámetros inválidos" });
  const { page, limit, categoria, q, estado } = value;
  const where = {};
  if(estado !== "todos") where.estado = estado;
  if(categoria != null && categoria !== "Todos") where.id_categoria = categoria;
  if(q) where[Op.or] = [
    { nombre:{[Op.like]:`%${q}%`} },
    { descripcion:{[Op.like]:`%${q}%`} }
  ];
  const offset = (page-1)*limit;
  const { rows, count } = await Product.findAndCountAll({ where, limit, offset, order:[["id","ASC"]] });
  res.json({ items: rows, total: count, page, limit });
}

export async function detail(req,res){
  const id = Number(req.params.id);
  if(!id) return res.status(400).json({ message:"ID inválido" });
  const p = await Product.findByPk(id);
  if(!p) return res.status(404).json({ message:"Producto no encontrado" });
  res.json(p);
}

const upsertSchema = Joi.object({
  nombre: Joi.string().min(2).max(128).required(),
  descripcion: Joi.string().allow("").optional(),
  precio_base: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  iva_porcentaje: Joi.number().min(0).max(100).default(21),
  stock_minimo: Joi.number().integer().min(0).default(0),
  id_categoria: Joi.number().integer().optional(),
  estado: Joi.string().valid("activo","inactivo").default("activo"),
  imagen: Joi.string().uri().allow("").optional()
});

export async function create(req,res){
  const { value, error } = upsertSchema.validate(req.body||{});
  if(error) return res.status(400).json({ message:"Datos inválidos" });
  const p = await Product.create(value);
  res.status(201).json(p);
}

export async function update(req,res){
  const id = Number(req.params.id);
  if(!id) return res.status(400).json({ message:"ID inválido" });
  const { value, error } = upsertSchema.validate(req.body||{});
  if(error) return res.status(400).json({ message:"Datos inválidos" });
  const p = await Product.findByPk(id);
  if(!p) return res.status(404).json({ message:"Producto no encontrado" });
  await p.update(value);
  res.json(p);
}

export async function remove(req,res){
  const id = Number(req.params.id);
  if(!id) return res.status(400).json({ message:"ID inválido" });
  const p = await Product.findByPk(id);
  if(!p) return res.status(404).json({ message:"Producto no encontrado" });
  await p.update({ estado:"inactivo" });
  res.json({ ok:true });
}

export async function activeCategories(req,res){
  const rows = await Product.findAll({ attributes:["id_categoria"], where:{ estado:"activo" } });
  const set = new Set(rows.map(r=>r.id_categoria).filter(v=>v!=null));
  const items = Array.from(set).map(id=>({ id, nombre:String(id) }));
  res.json({ items });
}

export async function categoryDetail(req,res){
  const id = Number(req.params.id);
  if(!id) return res.status(400).json({ message:"ID inválido" });
  const rows = await Product.findAll({ where:{ id_categoria:id, estado:"activo" }, order:[["id","ASC"]] });
  res.json({ id, items: rows });
}

export async function categoryStats(req,res){
  const rows = await Product.findAll();
  const stats = {};
  rows.forEach(p=>{
    const c = p.id_categoria || 0;
    stats[c] = stats[c] || { id_categoria:c, activos:0, inactivos:0, total:0 };
    stats[c].total++;
    if(p.estado === "activo") stats[c].activos++; else stats[c].inactivos++;
  });
  res.json({ items: Object.values(stats) });
}