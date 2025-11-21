;(function(){
  const base = "/api";
  async function parse(r){
    const ct = (r.headers.get("content-type")||"").toLowerCase();
    if(ct.includes("application/json")) { try { return await r.json(); } catch{} }
    const t = await r.text(); try { return JSON.parse(t); } catch { return { message:t||"Respuesta no válida" }; }
  }
  function authHeaders(){ const h={}; const tok=localStorage.getItem("token")||""; if(tok) h["Authorization"]="Bearer "+tok; return h; }
  async function tryFetch(urls, opts){
    const headers={ ...authHeaders(), ...(opts&&opts.headers||{}) };
    for(const u of urls){
      const r = await fetch(u,{ ...opts, headers });
      const j = await parse(r);
      if(r.ok) return j;
      if(r.status!==404) throw { status:r.status, ...j };
    }
    throw { status:404, message:"Endpoint no disponible" };
  }
  function qs(obj){
    const p = Object.entries(obj||{}).filter(([_,v])=>v!==undefined&&v!==null&&v!=="").map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return p.length?`?${p.join("&")}`:"";
  }
  async function get(){
    return await tryFetch([`${base}/carrito`,`${base}/cart`,`${base}/carrito/mio`],{ method:"GET" });
  }
  async function add(item){
    const body = JSON.stringify(item);
    return await tryFetch([`${base}/carrito/agregar`,`${base}/cart/add`],{ method:"POST", body, headers:{"Content-Type":"application/json"} });
  }
  async function update(itemId, cantidad){
    const body = JSON.stringify({ cantidad });
    const id = encodeURIComponent(itemId);
    return await tryFetch([`${base}/carrito/items/${id}`,`${base}/carrito/item/${id}`,`${base}/cart/items/${id}`],{ method:"PATCH", body, headers:{"Content-Type":"application/json"} });
  }
  async function remove(itemId){
    const id = encodeURIComponent(itemId);
    return await tryFetch([`${base}/carrito/items/${id}`,`${base}/carrito/item/${id}`,`${base}/cart/items/${id}`],{ method:"DELETE" });
  }
  async function clear(){
    return await tryFetch([`${base}/carrito`,`${base}/carrito/vaciar`,`${base}/cart`],{ method:"DELETE" });
  }
  async function configs(){
    return await tryFetch([`${base}/config/carrito`,`${base}/configuraciones`,`${base}/carrito/config`],{ method:"GET" });
  }
  async function shippingMethods(){
    return await tryFetch([`${base}/envios/metodos`,`${base}/shipping/methods`],{ method:"GET" });
  }
  async function checkout(payload){
    const body = JSON.stringify(payload);
    try{
      return await tryFetch([`${base}/carrito/checkout`,`${base}/pedidos`],{ method:"POST", body, headers:{"Content-Type":"application/json"} });
    }catch(e){ throw e; }
  }
  window.CartController = { get, add, update, remove, clear, configs, shippingMethods, checkout };
})();