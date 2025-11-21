(function(){
  const { useState } = React;
  function Header({ onUserClick, onCartClick, onFavClick, onNavProducts }){
    const [open,setOpen] = useState(false);
    return (
      React.createElement("div",{className:"header" + (open?" open":"")},
        React.createElement("button",{className:"hamburger",onClick:()=>setOpen(o=>!o),title:"Menú"},
          React.createElement("span",null),React.createElement("span",null),React.createElement("span",null)
        ),
        React.createElement("div",{className:"logo"},"Feraytek"),
        React.createElement("nav",{className:"menu"},
          React.createElement("a",{className:"menu-item active"},"Home"),
          React.createElement("a",{className:"menu-item",onClick:onNavProducts||(()=>{})},"Productos"),
          React.createElement("a",{className:"menu-item"},"Ofertas"),
          React.createElement("a",{className:"menu-item"},"Contacto")
        ),
        React.createElement("div",{className:"tools"},
          React.createElement("div",{className:"search"},
            React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M10 18a8 8 0 100-16 8 8 0 000 16zm8.7-1.3l-3.5-3.5-1.4 1.4 3.5 3.5 1.4-1.4z"})),
            React.createElement("input",{placeholder:"Buscar",className:"search-input"})
          ),
          React.createElement("button",{className:"icon-btn",title:"Mi cuenta",onClick:onUserClick},
            React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 12a5 5 0 1 0-0.001-10.001A5 5 0 0 0 12 12zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z"}))
          ),
          React.createElement("button",{className:"icon-btn",title:"Carrito",onClick:onCartClick},
            React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M3 4h2l2 12h10l2-8H7"}))
          ),
          React.createElement("button",{className:"icon-btn",title:"Favoritos",onClick:onFavClick},
            React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 21l-1.5-1.3C6 16 4 13.8 4 11a4 4 0 014-4c1.6 0 3 .8 4 2 1-1.2 2.4-2 4-2a4 4 0 014 4c0 2.8-2 5-6.5 8.7L12 21z"}))
          )
        )
      )
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Header = Header;
})();