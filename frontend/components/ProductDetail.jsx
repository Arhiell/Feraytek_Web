// Detalle de producto (frontend)
// Responsabilidad: obtener y mostrar detalle por ID


(function(){
  const { useState, useEffect } = React;

  function ProductDetail({ productId, onBack, onGoCart }){
    const [p,setP] = useState(null);
    const [err,setErr] = useState(null);
    const [msg,setMsg] = useState(null);
    const [adding,setAdding] = useState(false);
    const [variante,setVariante] = useState(null);
    const [images,setImages] = useState([]);
    const [imgIndex,setImgIndex] = useState(0);
    const [fav,setFav] = useState(false);

    useEffect(()=>{
      (async()=>{
        setErr(null);
        try{
          const res = await window.ProductController.detail(productId);
          const d = res.data||res.product||res;
          setP(d);
          try{
            if(Array.isArray(d?.variantes) && d.variantes.length){
              const v0 = d.variantes[0];
              const idv = v0?.id_variante||v0?.variante_id||v0?.id;
              setVariante(idv||null);
            } else { setVariante(null); }
            const base = (window.Feraytek && window.Feraytek.API && window.Feraytek.API.base) || "/api";
            let list = [];
            try{
              const r = await fetch(`${base}/imagenes_productos/producto/${productId}?t=${Date.now()}`,{ cache:"no-store" });
              const j = await r.json();
              list = Array.isArray(j)?j:(j.items||j.data||[]);
            }catch{}
            const isPlaceholder = (u)=> typeof u === "string" && /placehold\.co\//.test(u);
            const srvOrdered = (Array.isArray(list)?list:(list?.items||list?.data||[]))
              .map(x=> x?.url_imagen||x?.imagen_url||x?.foto_url )
              .filter(Boolean);
            const main = d.url_imagen||d.imagen||d.image||d.img||null;
            const real = srvOrdered.filter(u=> !isPlaceholder(u));
            let final = real.slice(0,3);
            if(final.length===0 && main && !isPlaceholder(main)) final = [main];
            if(final.length===0) final = ["https://placehold.co/800x500?text=Producto"];
            setImages(final);
            setImgIndex(0);
            try{ if(window.FavoritesController){ const idp = d.id||d.id_producto||d.idProducto||productId; setFav(window.FavoritesController.isFav(idp)); } }catch{}
          }catch{}
        }catch(e){ setErr(e.message||"Error al cargar producto"); }
      })();
    },[productId]);

    const img = images[imgIndex] || ((p&& (p.url_imagen||p.imagen||p.image||p.img)) || "https://placehold.co/800x500?text=Producto");
    const name = (p&& (p.nombre||p.title||p.name)) || "Producto";
    function priceOf(prod,vId){
      if(!prod) return "";
      const base = prod.precio_base!=null?prod.precio_base:(prod.precio!=null?prod.precio:(prod.price!=null?prod.price:null));
      if(vId!=null){
        const vs = prod.variantes||prod.variations||prod.opciones||prod.skus||[];
        const v = Array.isArray(vs)?vs.find(x=> (x.id_variante||x.variante_id||x.id)===vId ):null;
        const pv = v && (v.precio_base??v.precio??v.price);
        if(pv!=null) return pv;
      }
      return base!=null?base:"";
    }
    const price = priceOf(p,variante);
    const desc = (p&& (p.descripcion||p.description)) || "Sin descripción";
    function swapTo(i){
      setImages(prev=>{ const arr = Array.isArray(prev)?prev.slice():[]; if(i>=0 && i<arr.length){ const tmp = arr[0]; arr[0]=arr[i]; arr[i]=tmp; } return arr; });
      setImgIndex(0);
    }
    function normalizeVariant(v){
      if(!v) return {};
      const flat = {...v};
      const attrs = v.atributos||v.attributes||v.specs||{};
      Object.keys(attrs||{}).forEach(k=>{ if(flat[k]==null) flat[k]=attrs[k]; });
      const map={
        id_variante:"ID",
        variante_id:"ID",
        id:"ID",
        sku:"SKU",
        codigo:"Código",
        stock:"Stock",
        color:"Color",
        talla:"Talla",
        tamano:"Tamaño",
        size:"Talla",
        material:"Material",
        peso:"Peso",
        dimensiones:"Dimensiones",
        precio_base:"Precio",
        precio:"Precio",
        price:"Precio"
      };
      const o={};
      Object.keys(flat).forEach(k=>{
        if(typeof flat[k]==="object" && flat[k]!==null) return;
        if(["imagen","image","img","imagenes","images","gallery","producto_id"].includes(k)) return;
        const label = map[k]||k;
        o[label]=flat[k];
      });
      return o;
    }
    function allVariantKeys(vs){
      const keys=new Set();
      (vs||[]).forEach(v=>{ const o=normalizeVariant(v); Object.keys(o).forEach(k=>keys.add(k)); });
      return Array.from(keys);
    }

    async function addToCart(){
      if(!p) return;
      setAdding(true); setMsg(null);
      try{
        const id = p.id_producto||p.idProducto||p.id;
        let variante_id = (variante!=null?variante:(p.variante_id||p.id_variante||p.variant_id));
        const precio_unitario = p.precio_base!=null? p.precio_base : (p.precio!=null? p.precio : (p.price!=null? p.price : 0));
        const iva_porcentaje = p.iva_porcentaje!=null? p.iva_porcentaje : (p.iva!=null? p.iva : 0);
        await window.CartController.add({ producto_id:id, cantidad:1, variante_id, precio_unitario, iva_porcentaje });
        setMsg({type:"ok",text:"Agregado al carrito"});
      }catch(e){ setMsg({type:"error",text:e.message||"No se pudo agregar"}); }
      finally{ setAdding(false); }
    }

    return (
      React.createElement("div",{className:"product-detail"},
        React.createElement(window.Feraytek.Header,{onNavProducts:onBack,onUserClick:()=>{ if(window.Feraytek && typeof window.Feraytek.requireLogin==="function"){ window.Feraytek.requireLogin(()=>window.Feraytek.go("profile")); } else if(window.Feraytek){ window.Feraytek.go("profile"); } },onCartClick:onGoCart,onFavClick:()=>{ if(window.Feraytek){ if(typeof window.Feraytek.requireLogin === "function"){ window.Feraytek.requireLogin(()=>window.Feraytek.go("favorites")); } else { window.Feraytek.go("favorites"); } } }}),
        React.createElement("div",{className:"detail-wrap"},
          React.createElement("button",{className:"btn secondary",onClick:onBack},"Volver al catálogo"),
          err?React.createElement("div",{className:"msg error"},err):null,
          React.createElement("div",{className:"detail-card"},
            React.createElement("button",{className:"fav-pin"+(fav?" active":""),title:"Favorito",onClick:()=>{ try{ const idp = (p&& (p.id||p.id_producto||p.idProducto)) || productId; const payload = p||{ id:idp, nombre:name, imagen:img }; if(window.FavoritesController){ window.FavoritesController.toggle(payload); setFav(window.FavoritesController.isFav(idp)); } else { setFav(v=>!v); } }catch{ setFav(v=>!v); }}},
              React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 21l-1.5-1.3C6 16 4 13.8 4 11a4 4 0 014-4c1.6 0 3 .8 4 2 1-1.2 2.4-2 4-2a4 4 0 014 4c0 2.8-2 5-6.5 8.7L12 21z"}))
            ),
            React.createElement("div",{className:"gallery"},
              React.createElement("div",{className:"img-lg"},React.createElement("img",{src:img,alt:name,onError:(e)=>{try{const u=new URL(e.target.src);if(u.pathname.endsWith(".jpg")){u.pathname=u.pathname.replace(/\.jpg$/,".png");e.target.src=u.toString();return;} }catch{} e.target.src="https://placehold.co/800x500?text=Producto";}})),
              images.length>1?React.createElement("div",{className:"thumbs"},
                images.slice(1,3).map((src,i)=>
                  React.createElement("button",{key:src,className:"thumb",onClick:()=>swapTo(i+1)},
                    React.createElement("img",{src,alt:"Miniatura",onError:(e)=>{try{const u=new URL(e.target.src);if(u.pathname.endsWith(".jpg")){u.pathname=u.pathname.replace(/\.jpg$/,".png");e.target.src=u.toString();return;} }catch{} e.target.src="https://placehold.co/200x125?text=Producto";}})
                  )
                )
              ):null
            ),
            React.createElement("div",{className:"info-lg"},
              React.createElement("h2",{className:"name"},name),
              React.createElement("div",{className:"price"}, price!==""?`$${price}`:""),
              React.createElement("p",{className:"desc"},desc),
              React.createElement("div",{className:"actions"},
                Array.isArray(p?.variantes)&&p.variantes.length?React.createElement("div",{className:"field"},
                  React.createElement("label",null,"Variante"),
                  React.createElement("select",{className:"input",value:(variante??""),onChange:e=>{ const v=e.target.value; setVariante(v?Number(v):null); }},
                    p.variantes.map(v=>{
                      const idv = v?.id_variante||v?.variante_id||v?.id;
                      const nombre = v?.nombre||v?.name||v?.descripcion||"Variante";
                      return React.createElement("option",{key:idv,value:idv},nombre);
                    })
                  )
                ):null,
                React.createElement("button",{className:"btn primary",onClick:addToCart,disabled:adding},adding?"Agregando...":"Agregar al carrito"),
                React.createElement("button",{className:"btn secondary",onClick:onGoCart},"Ver carrito")
              )
              , Array.isArray(p?.variantes)&&p.variantes.length? (function(){
                  const vs = p.variantes;
                  const headers = allVariantKeys(vs);
                  const current = vs.find(v=> (v.id_variante||v.variante_id||v.id)===variante ) || vs[0];
                  const cur = normalizeVariant(current);
                  return React.createElement("div",{className:"variants-panel"},
                    React.createElement("h3",{className:"variants-title"},"Variantes"),
                    React.createElement("div",{className:"variant-row"},
                      headers.map(k=> React.createElement("div",{className:"var-td",key:k}, `${k}: ${cur[k]!==undefined?cur[k]:"-"}` ))
                    ),
                    React.createElement("div",{className:"variant-row"},
                      vs.map((v,i)=>{
                        const o=normalizeVariant(v);
                        return React.createElement("div",{className:"var-td",key:i}, headers.map(h=>`${h}: ${o[h]!==undefined?o[h]:"-"}`).join(" \u2022 "));
                      })
                    )
                  );
                })():null
            )
          )
        )
        , msg?React.createElement("div",{className:`msg ${msg.type}`},msg.text):null
      )
    );
  }

  window.Feraytek = window.Feraytek || {};
  window.Feraytek.ProductDetail = ProductDetail;
})();
