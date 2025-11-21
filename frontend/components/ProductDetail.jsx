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
          }catch{}
        }catch(e){ setErr(e.message||"Error al cargar producto"); }
      })();
    },[productId]);

    const img = (p&& (p.imagen||p.image||p.img)) || "https://placehold.co/800x500?text=Producto";
    const name = (p&& (p.nombre||p.title||p.name)) || "Producto";
    const price = p && (p.precio!=null?p.precio:(p.price!=null?p.price:""));
    const desc = (p&& (p.descripcion||p.description)) || "Sin descripción";

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