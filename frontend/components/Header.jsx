(function(){
  const { useState, useEffect } = React;
  function Header({ onUserClick, onCartClick, onFavClick, onNavHome, onNavProducts, onNavOffers, onNavContact, onNavSupport, onNavOrders, onSearchChange, onSearchSubmit }){
    const [open,setOpen] = useState(false);
    const [q,setQ] = useState("");
    const [curr,setCurr] = useState((window.Feraytek && window.Feraytek.route) || "");
    useEffect(()=>{ try{ document.body.style.overflow = open?"hidden":""; }catch{} return ()=>{ try{ document.body.style.overflow=""; }catch{} }; },[open]);
    useEffect(()=>{ function onRoute(ev){ const r=(ev&&ev.detail&&ev.detail.route)||""; setCurr(r); } window.addEventListener("feraytek:route", onRoute); return ()=> window.removeEventListener("feraytek:route", onRoute); },[]);
    function goHome(){ if(onNavHome) onNavHome(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("landing"); setOpen(false); }
    function goProducts(){ if(onNavProducts) onNavProducts(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("catalog"); setOpen(false); }
    function goOffers(){ if(onNavOffers) onNavOffers(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("offers"); setOpen(false); }
    function goContact(){ if(onNavContact) onNavContact(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("contact"); setOpen(false); }
    function goSupport(){ if(onNavSupport) onNavSupport(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("support"); setOpen(false); }
    function goOrders(){ if(onNavOrders) onNavOrders(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("orders"); setOpen(false); }
    function goProfile(){ if(onUserClick) onUserClick(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("profile"); setOpen(false); }
    function goCart(){ if(onCartClick) onCartClick(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("cart"); setOpen(false); }
    function goFav(){ if(onFavClick) onFavClick(); else if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("favorites"); setOpen(false); }
    function submit(){ if(onSearchSubmit) { onSearchSubmit(q); } else { try{ window.Feraytek.searchQ = q; window.dispatchEvent(new CustomEvent("feraytek:search",{ detail:{ q } })); if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("catalog"); }catch{} } }
    function link(label,fn){ return React.createElement("a",{className:"menu-link",onClick:fn},label); }
    function cls(name){ return "menu-item" + (name?" ":"") + (name&&((name==="landing"&&curr==="landing")||(name==="catalog"&&(curr==="catalog"||curr==="product"))||(name==="offers"&&curr==="offers")||(name==="orders"&&curr==="orders")||(name==="contact"&&curr==="contact")||(name==="support"&&curr==="support"))?"active":""); }
    return (
      React.createElement(React.Fragment,null,
        React.createElement("div",{className:"header" + (open?" open":"")},
          React.createElement("button",{className:"hamburger",onClick:()=>setOpen(o=>!o),title:"Menú","aria-label":"Abrir menú"},
            React.createElement("span",null),React.createElement("span",null),React.createElement("span",null)
          ),
          React.createElement("button",{className:"logo",onClick:goHome,title:"Feraytek"},"Feraytek"),
          React.createElement("nav",{className:"menu"},
            React.createElement("a",{className:cls("landing"),onClick:goHome},"Home"),
            React.createElement("a",{className:cls("catalog"),onClick:goProducts},"Productos"),
            React.createElement("a",{className:cls("offers"),onClick:goOffers},"Ofertas"),
            React.createElement("a",{className:cls("orders"),onClick:goOrders},"Pedidos"),
            React.createElement("a",{className:cls("contact"),onClick:goContact},"Contacto"),
            React.createElement("a",{className:cls("support"),onClick:goSupport},"Soporte")
          ),
          React.createElement("div",{className:"tools"},
            React.createElement("div",{className:"search"},
              React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M10 18a8 8 0 100-16 8 8 0 000 16zm8.7-1.3l-3.5-3.5-1.4 1.4 3.5 3.5 1.4-1.4z"})),
              React.createElement("input",{placeholder:"Buscar",className:"search-input",value:q,onChange:e=>{ const v=e.target.value; setQ(v); if(onSearchChange) onSearchChange(v); },onKeyDown:e=>{ if(e.key==="Enter") submit(); }})
            ),
            React.createElement("button",{className:"icon-btn",title:"Mi cuenta",onClick:goProfile},
              React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 12a5 5 0 1 0-0.001-10.001A5 5 0 0 0 12 12zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z"}))
            ),
            React.createElement("button",{className:"icon-btn",title:"Carrito",onClick:goCart},
              React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M3 4h2l2 12h10l2-8H7"}))
            ),
            React.createElement("button",{className:"icon-btn",title:"Favoritos",onClick:goFav},
              React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 21l-1.5-1.3C6 16 4 13.8 4 11a4 4 0 014-4c1.6 0 3 .8 4 2 1-1.2 2.4-2 4-2a4 4 0 014 4c0 2.8-2 5-6.5 8.7L12 21z"}))
            )
          )
        ),
        React.createElement("div",{className:"drawer-backdrop" + (open?" open":""),onClick:()=>setOpen(false)}),
        React.createElement("div",{className:"mobile-drawer" + (open?" open":""),role:"menu"},
          React.createElement("div",{className:"drawer-top"},
            React.createElement("button",{className:"drawer-close",onClick:()=>setOpen(false),"aria-label":"Cerrar menú"},
              React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M6 6l12 12M18 6L6 18",stroke:"currentColor",strokeWidth:2,fill:"none",strokeLinecap:"round"}))
            )
          ),
          React.createElement("div",{className:"menu-list"},
            link("Home",goHome),
            link("Productos",goProducts),
            link("Ofertas",goOffers),
            link("Pedidos",goOrders),
            link("Contacto",goContact),
            link("Soporte",goSupport),
            link("Perfil",goProfile),
            link("Carrito",goCart),
            link("Favoritos",goFav)
          )
        )
      )
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Header = Header;
})();
