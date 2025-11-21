// Detalle de producto (frontend)
// Responsabilidad: obtener y mostrar detalle por ID

(function(){
  const { useState, useEffect } = React;

  function ProductDetail({ productId, onBack }){
    const [p,setP] = useState(null);
    const [err,setErr] = useState(null);

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

    return (
      React.createElement("div",{className:"product-detail"},
        React.createElement(window.Feraytek.Header,{onNavProducts:onBack,onUserClick:()=>{},onCartClick:()=>{},onFavClick:()=>{}}),
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
                React.createElement("button",{className:"btn primary"},"Agregar al carrito")
              )
            )
          )
        )
      )
    );
  }

  window.Feraytek = window.Feraytek || {};
  window.Feraytek.ProductDetail = ProductDetail;
})();