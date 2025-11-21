// Controlador de Productos (frontend)
// Responsabilidad: consumir API de productos (lista, detalle, búsqueda, filtros)
// Mantiene respuestas en JSON y evita CORS usando ruta relativa /api

(function(){
  const base = "/api"; // proxy del server frontend -> backend:3000
  async function parse(r){
    const ct = (r.headers.get("content-type")||"").toLowerCase();
    if(ct.includes("application/json")){
      try { return await r.json(); } catch { return { message: "JSON inválido" }; }
    }
    const t = await r.text();
    try { return JSON.parse(t); } catch { return { message: t||"Respuesta no válida" }; }
  }
  function qs(obj){
    const p = Object.entries(obj).filter(([_,v])=>v!==undefined&&v!==null&&v!=="").map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return p.length?`?${p.join("&")}`:"";
  }
  async function list({ page=1, limit=12, categoria, q }={}){
    const headers={};
    const tok=localStorage.getItem("token")||""; if(tok) headers["Authorization"]="Bearer "+tok;
    const url = `${base}/productos${qs({page,limit,categoria,q})}`;
    const r = await fetch(url,{ headers, credentials:"omit" });
    const j = await parse(r); if(!r.ok) throw { status:r.status, ...j }; return j;
  }
  async function detail(id){
    const headers={}; const tok=localStorage.getItem("token")||""; if(tok) headers["Authorization"]="Bearer "+tok;
    const r = await fetch(`${base}/productos/${id}`,{ headers, credentials:"omit" });
    const j = await parse(r); if(!r.ok) throw { status:r.status, ...j }; return j;
  }
  async function categories(){
    const headers={}; const tok=localStorage.getItem("token")||""; if(tok) headers["Authorization"]="Bearer "+tok;
    const r = await fetch(`${base}/productos/categorias`,{ headers, credentials:"omit" });
    const j = await parse(r); if(!r.ok) throw { status:r.status, ...j }; return j;
  }
  window.ProductController = { list, detail, categories };
})();
