(function(){
  const { useState } = React;
  function Offers(){
    const [route,setRoute] = useState("offers");
    function goCatalog(){ if(window.Feraytek && typeof window.Feraytek.go==="function") window.Feraytek.go("catalog"); }
    return (
      React.createElement("div",{className:"catalog"},
        React.createElement("div",{className:"catalog-top"},
          React.createElement("h1",{className:"page-title"},"Ofertas"),
          React.createElement("div",{className:"top-actions"},
            React.createElement("button",{className:"btn secondary",onClick:goCatalog},"Ver todo")
          )
        ),
        React.createElement(window.Feraytek.Catalog,{initialCategory:"Ofertas",onViewProduct:(id)=>{ if(window.Feraytek) { window.Feraytek.go("product"); } },onGoCart:()=>{ if(window.Feraytek) window.Feraytek.go("cart"); }})
      )
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Offers = Offers;
})();