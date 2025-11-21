// Catálogo de productos (frontend)
// Responsabilidad: listar y filtrar productos consumiendo ProductController


(function(){
  const { useState, useEffect } = React;

  function Catalog({ onViewProduct, onGoCart }){
    const [items,setItems] = useState([]);
    const [cats,setCats] = useState(["Todos","Hombre","Mujer","Accesorios","Ofertas"]);
    const [cat,setCat] = useState("Todos");
    const [q,setQ] = useState("");
    const [loading,setLoading] = useState(false);
    const [err,setErr] = useState(null);
    const [msg,setMsg] = useState(null);

    async function load(){
      setLoading(true); setErr(null);
      try{
        const res = await window.ProductController.list({ page:1, limit:12, categoria: cat!=="Todos"?cat:undefined, q:q||undefined });
        const data = res.data||res.items||res.productos||res.results||res;
        setItems(Array.isArray(data)?data:[]);
      }catch(e){
        setErr(e.message||"Error al cargar productos");
        setItems([]);
      }finally{ setLoading(false); }
    }
    useEffect(()=>{ load(); },[cat]);

    async function add(p){
      try{
        const id = p.id_producto||p.idProducto||p.id||p.producto_id;
        const variante_id = p.variante_id||p.id_variante||p.variant_id;
        await window.CartController.add({ producto_id:id, cantidad:1, variante_id });
        setMsg({type:"ok",text:"Agregado al carrito"}); setTimeout(()=>setMsg(null),1600);
      }catch(e){ setMsg({type:"error",text:e.message||"No se pudo agregar"}); setTimeout(()=>setMsg(null),2000); }
    }
    function card(p){
      const img = p.imagen||p.image||p.img||"https://via.placeholder.com/600x400?text=Producto";
      const name = p.nombre||p.title||p.name||"Producto";
      const price = p.precio!=null?p.precio:(p.price!=null?p.price:"");
      return React.createElement("div",{className:"product-card"},
        React.createElement("button",{className:"fav-btn",title:"Favorito"},"❤"),
        React.createElement("div",{className:"img-wrap"},React.createElement("img",{src:img,alt:name})),
        React.createElement("div",{className:"info"},
          React.createElement("div",{className:"name"},name),
          React.createElement("div",{className:"price"}, price!==""?`$${price}`:"")
        ),
        React.createElement("div",{className:"actions"},
          React.createElement("button",{className:"btn secondary",onClick:()=>add(p)},"Agregar al carrito"),
          React.createElement("button",{className:"btn primary",onClick:()=>onViewProduct&&onViewProduct(p.id||p.id_producto||p.idProducto||p.id)},"Ver detalles")
        )
      );
    }

    return (
      React.createElement("div",{className:"catalog"},
        React.createElement(window.Feraytek.Header,{onNavProducts:()=>{},onUserClick:()=>{},onCartClick:onGoCart,onFavClick:()=>{}}),
        React.createElement("div",{className:"catalog-top"},
          React.createElement("h1",{className:"page-title"},"Catálogo"),
          React.createElement("div",{className:"top-actions"},
            React.createElement("button",{className:"btn secondary"},"Filtrar"),
            React.createElement("div",{className:"search"},
              React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M10 18a8 8 0 100-16 8 8 0 000 16zm8.7-1.3l-3.5-3.5-1.4 1.4 3.5 3.5 1.4-1.4z"})),
              React.createElement("input",{className:"search-input",placeholder:"Buscar productos",value:q,onChange:e=>setQ(e.target.value),onKeyDown:e=>{ if(e.key==="Enter") load(); }})
            )
          )
        ),
        React.createElement("div",{className:"category-bar"},
          cats.map(c=>React.createElement("button",{key:c,className:"chip"+(c===cat?" active":""),onClick:()=>setCat(c)},c))
        ),
        err?React.createElement("div",{className:"msg error"},err):null,
        msg?React.createElement("div",{className:`msg ${msg.type}`},msg.text):null,
        loading?React.createElement("div",{className:"loading"},"Cargando..."):
        React.createElement("div",{className:"catalog-grid"},
          items.map(p=>React.createElement("div",{key:(p.id||p.id_producto||p.idProducto||p.nombre)},card(p)))
        )
      )
    );
  }

  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Catalog = Catalog;
})();