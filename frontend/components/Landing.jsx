// Feraytek UI - Componente Landing
// Responsabilidad: pantalla principal post‑autenticación con header full‑width,
// hero dominante, slider simple y estética premium oscura acorde a la marca.

(function(){
  const { useState } = React;

  function Landing({ usuario, onGoProfile, onGoCatalog }){
    const items=[
      {title:"Nuevas Colecciones",subtitle:"Explora piezas seleccionadas con estilo moderno.",image:"https://images.unsplash.com/photo-1517705008128-1c66f59a6db1?auto=format&fit=crop&w=1600&q=60"},
      {title:"Ofertas Destacadas",subtitle:"Descubre promociones en productos premium.",image:"https://images.unsplash.com/photo-1520975596571-37c1dd3e3e77?auto=format&fit=crop&w=1600&q=60"},
      {title:"Tendencias",subtitle:"Lo último en colecciones para esta temporada.",image:"https://images.unsplash.com/photo-1511981839932-9ed141221f53?auto=format&fit=crop&w=1600&q=60"}
    ];
    const [i,setI]=useState(0);
    function prev(){setI(v=> (v-1+items.length)%items.length)}
    function next(){setI(v=> (v+1)%items.length)}
    const it=items[i];

    return (
      React.createElement("div",{className:"landing"},
        React.createElement(window.Feraytek.Header,{onUserClick:onGoProfile,onCartClick:()=>{},onFavClick:()=>{},onNavProducts:onGoCatalog}),
        React.createElement("div",{className:"hero"},
          React.createElement("button",{className:"arrow left",onClick:prev},
            React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M15 6l-6 6 6 6"}))
          ),
          React.createElement("div",{className:"banner"},
            React.createElement("div",{className:"hero-left"},
              React.createElement("div",{className:"eyebrow"},"Bienvenido"),
              React.createElement("h1",{className:"hero-title"},it.title),
              React.createElement("p",{className:"hero-sub"},it.subtitle),
              React.createElement("div",{className:"hero-actions"},
                React.createElement("button",{className:"btn primary",onClick:onGoCatalog},"Explorar ahora")
              )
          ),
            React.createElement("div",{className:"hero-right"},
              React.createElement("div",{className:"image-wrap"},
                React.createElement("img",{src:it.image,alt:"Destacado"})
              )
            )
          ),
          React.createElement("button",{className:"arrow right",onClick:next},
            React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M9 6l6 6-6 6"}))
          )
        )
      )
    );
  }

  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Landing = Landing;
})();

// Comentarios:
// - Header y hero amplificados para presencia visual y full‑width.
// - Slider simple con flechas grandes (incremental) y 3 ítems destacados.
// - CTA visible y coherente con paleta azul/celeste de Feraytek.
