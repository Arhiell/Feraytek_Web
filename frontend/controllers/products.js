// Controlador de Productos (frontend)
// Responsabilidad: consumir API de productos (lista, detalle, búsqueda, filtros)
// Mantiene respuestas en JSON y evita CORS usando ruta relativa /api

(function(){
  function computeImage(prod){
    const id = prod.id || prod.id_producto || prod.producto_id || prod.idProducto;
    const baseImg = (window.Feraytek && window.Feraytek.IMAGES && window.Feraytek.IMAGES.base) || "";
    if(prod.url_imagen) return prod.url_imagen;
    if(prod.imagen) return prod.imagen;
    if(prod.imagen_url) return prod.imagen_url;
    if(prod.foto) return prod.foto;
    if(prod.foto_url) return prod.foto_url;
    if(prod.image) return prod.image;
    if(prod.img) return prod.img;
    if(baseImg && id!=null) return `${baseImg}/productos/${id}.jpg`;
    return "";
  }
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
  async function fetchPrimaryImage(id){
    try{
      const base = getBase();
      const ts = Date.now();
      const r = await fetch(`${base}/imagenes_productos/producto/${id}?t=${ts}`,{ cache:"no-store", credentials:"omit" });
      const j = await parse(r);
      const arr = Array.isArray(j)?j:(j.items||j.data||[]);
      const first = Array.isArray(arr)&&arr.length?arr[0]:null;
      return first && (first.url_imagen || first.imagen_url || first.foto_url) || "";
    }catch{ return ""; }
  }
  async function enrichWithImages(arr){
    const tasks = arr.map(async(p)=>{
      const has = p.url_imagen || p.imagen || p.imagen_url || p.foto || p.foto_url || p.image || p.img;
      if(has) return { ...p, imagen: computeImage(p) };
      const id = p.id || p.id_producto || p.producto_id || p.idProducto;
      const url = id!=null ? await fetchPrimaryImage(id) : "";
      return { ...p, url_imagen: url, imagen: url || computeImage(p) };
    });
    return await Promise.all(tasks);
  }
  function qs(obj){
    const p = Object.entries(obj).filter(([_,v])=>v!==undefined&&v!==null&&v!=="").map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return p.length?`?${p.join("&")}`:"";
  }
  async function list({ page=1, limit=12, categoria, q }={}){
    const headers={};
    const tok=localStorage.getItem("token")||""; if(tok) headers["Authorization"]="Bearer "+tok;
    const base = getBase();
    const url = `${base}/productos${qs({page,limit,categoria,q})}`;
    const r = await fetch(url,{ headers, credentials:"omit", cache:"no-store" });
    const j = await parse(r); if(!r.ok) throw { status:r.status, ...j };
    const arr = j.items||j.data||j.productos||j.results||j;
    if(Array.isArray(arr)){
      const mapped = await enrichWithImages(arr);
      const out = { ...(typeof j==='object'?j:{}), items: mapped, data: mapped };
      return out;
    }
    return j;
  }
  async function detail(id){
    const headers={}; const tok=sessionStorage.getItem("token")||""; if(tok) headers["Authorization"]="Bearer "+tok;
    const base = getBase();
    const r = await fetch(`${base}/productos/${id}`,{ headers, credentials:"omit", cache:"no-store" });
    const j = await parse(r); if(!r.ok) throw { status:r.status, ...j };
    const data = j.data||j.item||j||{};
    let mapped = { ...data, imagen: computeImage(data) };
    if(!mapped.imagen){
      const id = mapped.id || mapped.id_producto || mapped.producto_id || mapped.idProducto;
      const url = id!=null ? await fetchPrimaryImage(id) : "";
      mapped = { ...mapped, url_imagen: url, imagen: url || mapped.imagen };
    }
    return { ...(typeof j==='object'?j:{}), data: mapped };
  }
  async function categories(){
    const headers={}; const tok=localStorage.getItem("token")||""; if(tok) headers["Authorization"]="Bearer "+tok;
    const base = getBase();
    const urls = [ `${base}/categorias/activas`, `${base}/productos/categorias` ];
    for(const u of urls){
      const r = await fetch(u,{ headers, credentials:"omit", cache:"no-store" });
      const j = await parse(r); if(r.ok) return j;
    }
    throw { status:404, message:"Categorías no disponibles" };
  }
  window.ProductController = { list, detail, categories };
})();
