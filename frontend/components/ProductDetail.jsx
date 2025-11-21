// Detalle de producto (frontend)
// Responsabilidad: obtener y mostrar detalle por ID


(function(){
  const { useState, useEffect } = React;

  function ProductDetail({ productId, onBack, onGoCart }){
    const [p,setP] = useState(null);
    const [err,setErr] = useState(null);
    const [msg,setMsg] = useState(null);
    const [adding,setAdding] = useState(false);

    useEffect(()=>{
      (async()=>{
        setErr(null);
        try{
          const res = await window.ProductController.detail(productId);
          const d = res.data||res.product||res;
          setP(d);
        }catch(e){ setErr(e.message||"Error al cargar producto"); }
      })();
    },[productId]);

    const img = (p&& (p.imagen||p.image||p.img)) || "https://via.placeholder.com/800x500?text=Producto";
    const name = (p&& (p.nombre||p.title||p.name)) || "Producto";
    const price = p && (p.precio!=null?p.precio:(p.price!=null?p.price:""));
    const desc = (p&& (p.descripcion||p.description)) || "Sin descripción";

    async function addToCart(){
      if(!p) return;
      setAdding(true); setMsg(null);
      try{
        const id = p.id_producto||p.idProducto||p.id;
        const variante_id = p.variante_id||p.id_variante||p.variant_id;
        await window.CartController.add({ producto_id:id, cantidad:1, variante_id });
        setMsg({type:"ok",text:"Agregado al carrito"});
      }catch(e){ setMsg({type:"error",text:e.message||"No se pudo agregar"}); }
      finally{ setAdding(false); }
    }

    return (
      React.createElement("div",{className:"product-detail"},
        React.createElement(window.Feraytek.Header,{onNavProducts:onBack,onUserClick:()=>{},onCartClick:onGoCart,onFavClick:()=>{}}),
        React.createElement("div",{className:"detail-wrap"},
          React.createElement("button",{className:"btn secondary",onClick:onBack},"Volver al catálogo"),
          err?React.createElement("div",{className:"msg error"},err):null,
          React.createElement("div",{className:"detail-card"},
            React.createElement("div",{className:"img-lg"},React.createElement("img",{src:img,alt:name})),
            React.createElement("div",{className:"info-lg"},
              React.createElement("h2",{className:"name"},name),
              React.createElement("div",{className:"price"}, price!==""?`$${price}`:""),
              React.createElement("p",{className:"desc"},desc),
              React.createElement("div",{className:"actions"},
                React.createElement("button",{className:"btn primary",onClick:addToCart,disabled:adding},adding?"Agregando...":"Agregar al carrito"),
                React.createElement("button",{className:"btn secondary",onClick:onGoCart},"Ver carrito")
              )
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