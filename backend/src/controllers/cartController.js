import Joi from "joi";
import { Cart, CartItem } from "../models/Cart.js";
import { sequelize } from "../config/database.js";

async function getActiveCart(userId){
  let cart = await Cart.findOne({ where:{ user_id:userId, estado:"activo" } });
  if(!cart) cart = await Cart.create({ user_id:userId, estado:"activo" });
  return cart;
}

export async function get(req,res){
  const cart = await getActiveCart(req.user.id);
  const items = await CartItem.findAll({ where:{ cart_id:cart.id }, order:[["id","ASC"]] });
  res.json(items);
}

const addSchema = Joi.object({ producto_id:Joi.any().required(), cantidad:Joi.number().integer().min(1).default(1), variante_id:Joi.any().optional() });

export async function add(req,res){
  const { value, error } = addSchema.validate(req.body||{});
  if(error) return res.status(400).json({ message:"Datos inválidos" });
  const { producto_id, cantidad, variante_id } = value;
  const cart = await getActiveCart(req.user.id);
  const where = { cart_id:cart.id, producto_id:String(producto_id), variante_id: variante_id?String(variante_id):null };
  let item = await CartItem.findOne({ where });
  if(item){
    item.cantidad = item.cantidad + cantidad;
    await item.save();
  } else {
    const precio_base = 0; const iva_porcentaje = 21;
    item = await CartItem.create({ ...where, cantidad, precio_base, iva_porcentaje });
  }
  const items = await CartItem.findAll({ where:{ cart_id:cart.id }, order:[["id","ASC"]] });
  res.status(201).json({ items });
}

export async function update(req,res){
  const id = Number(req.params.id);
  const qty = Number(req.body && req.body.cantidad);
  if(!id || !qty || qty<1) return res.status(400).json({ message:"Cantidad inválida" });
  const cart = await getActiveCart(req.user.id);
  const item = await CartItem.findOne({ where:{ id, cart_id:cart.id } });
  if(!item) return res.status(404).json({ message:"Item no encontrado" });
  item.cantidad = qty; await item.save();
  res.json(item);
}

export async function remove(req,res){
  const id = Number(req.params.id);
  const cart = await getActiveCart(req.user.id);
  const item = await CartItem.findOne({ where:{ id, cart_id:cart.id } });
  if(!item) return res.status(404).json({ message:"Item no encontrado" });
  await item.destroy();
  res.json({ ok:true });
}

export async function clear(req,res){
  const cart = await getActiveCart(req.user.id);
  await CartItem.destroy({ where:{ cart_id:cart.id } });
  res.json({ ok:true });
}

export async function shippingMethods(req,res){
  res.json([{ id:"standard", nombre:"Estándar" },{ id:"express", nombre:"Express" }]);
}

export async function checkout(req,res){
  const cart = await getActiveCart(req.user.id);
  await sequelize.transaction(async(t)=>{
    await Cart.update({ estado:"cerrado" },{ where:{ id:cart.id }, transaction:t });
  });
  res.status(201).json({ ok:true });
}