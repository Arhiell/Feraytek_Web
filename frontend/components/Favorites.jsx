(function(){
  const { useState, useEffect } = React;
  function Favorites(){
    const [items,setItems] = useState([]);
    const [loading,setLoading] = useState(false);
    const [err,setErr] = useState(null);
    useEffect(()=>{ setLoading(true); setErr(null); try{ const list = JSON.parse(localStorage.getItem("favProducts")||"[]"); setItems(Array.isArray(list)?list:[]); }catch(e){ setErr("No se pudieron cargar favoritos"); } finally{ setLoading(false); } },[]);
    return (
      React.createElement("div",{className:"catalog"},
        React.createElement(window.Feraytek.Header,{}),
        React.createElement("div",{className:"catalog-top"},
          React.createElement("h1",{className:"page-title"},"Favoritos"),
          React.createElement("div",{className:"top-actions"},
            React.createElement("button",{className:"btn secondary",onClick:()=>{ if(window.Feraytek) window.Feraytek.go("catalog"); }},"Ver catálogo")
          )
        ),
        loading?React.createElement("div",{className:"loading"},"Cargando..."):
        items.length?React.createElement("div",{className:"catalog-grid"},items.map((p,i)=>React.createElement("div",{key:(p?.id||i),className:"product-card"},
          React.createElement("div",{className:"img-wrap"},React.createElement("img",{src:(p?.imagen||p?.image||"https://via.placeholder.com/600x400?text=Producto"),alt:(p?.nombre||"Producto")})),
          React.createElement("div",{className:"info"},React.createElement("div",{className:"name"},p?.nombre||"Producto"))
        ))):React.createElement("div",{className:"msg"},"Aún no tienes favoritos")
      )
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Favorites = Favorites;
})();