(function(){
  function getBase(){
    const cfg = (typeof window!=="undefined" && window.Feraytek && window.Feraytek.API) || {};
    return cfg.base || "/api";
  }
  async function parse(r){
    const ct = (r.headers.get("content-type")||"").toLowerCase();
    if(ct.includes("application/json")){
      try { return await r.json(); } catch { return { message: "JSON inválido" }; }
    }
    const t = await r.text();
    try { return JSON.parse(t); } catch { return { message: t||"Respuesta no válida" }; }
  }
  function authInit(method){
    const headers = {};
    const tok = localStorage.getItem("token")||""; if(tok) headers["Authorization"] = "Bearer "+tok;
    const init = { method, headers, credentials:"omit" };
    return init;
  }
  function authJsonInit(method,payload){
    const headers = { "Content-Type":"application/json" };
    const tok = localStorage.getItem("token")||""; if(tok) headers["Authorization"] = "Bearer "+tok;
    const init = { method, headers, credentials:"omit", body: JSON.stringify(payload) };
    return init;
  }
  async function history({ page=1, limit=20, status, sort }={}){
    const params = [];
    if(page) params.push(`page=${encodeURIComponent(page)}`);
    if(limit) params.push(`limit=${encodeURIComponent(limit)}`);
    if(status) params.push(`status=${encodeURIComponent(status)}`);
    if(sort) params.push(`sort=${encodeURIComponent(sort)}`);
    const qs = params.length?`?${params.join("&")}`:"";
    const base = getBase();
    const r = await fetch(`${base}/historial_pedidos${qs}`, authInit("GET"));
    const j = await parse(r); if(!r.ok) throw { status:r.status, ...j }; return j;
  }
  async function order(id){
    const base = getBase();
    const urls = [`${base}/historial_pedidos/pedido/${id}`, `${base}/pedidos/${id}`];
    for(const u of urls){
      const r = await fetch(u, authInit("GET"));
      const j = await parse(r);
      if(r.ok) return j;
      if(r.status!==404) throw { status:r.status, ...j };
    }
    throw { status:404, message:"Pedido no encontrado" };
  }
  async function create(payload){
    const base = getBase();
    const urls = [ `${base}/pedidos`, `${base}/orders` ];
    let lastErr = null;
    for(const u of urls){
      const r = await fetch(u, authJsonInit("POST", payload));
      const j = await parse(r);
      if(r.ok) return j;
      lastErr = { status:r.status, ...j };
      if(r.status!==404) break;
    }
    throw lastErr || { status:404, message:"No se pudo crear el pedido" };
  }
  async function shipments(){
    const base = getBase();
    const urls = [ `${base}/envios`, `${base}/envios/metodos` ];
    let lastErr = null;
    for(const u of urls){
      const r = await fetch(u, authInit("GET"));
      const j = await parse(r);
      if(r.ok) return j;
      lastErr = { status:r.status, ...j };
    }
    throw lastErr || { status:404, message:"No se pudieron cargar envíos" };
  }
  async function shipment(id){
    const base = getBase();
    const r = await fetch(`${base}/envios/${id}`, authInit("GET"));
    const j = await parse(r); if(!r.ok) throw { status:r.status, ...j }; return j;
  }
  async function shippingCost(payload){
    const base = getBase();
    const r = await fetch(`${base}/envios/costo`, authJsonInit("POST", payload));
    const j = await parse(r); if(!r.ok) throw { status:r.status, ...j }; return j;
  }
  window.OrdersController = { history, order, create, shipments, shipment, shippingCost };
})();