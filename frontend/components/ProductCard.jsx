(function(){
  function ProductCard({ product, onView, onAdd }){
    const img = product.imagen || product.image || product.img || "https://via.placeholder.com/600x400?text=Producto";
    const name = product.nombre || product.title || product.name || "Producto";
    const price = product.precio != null ? product.precio : (product.price != null ? product.price : "");
    const id = product.id || product.id_producto || product.idProducto || product.producto_id;
    return React.createElement("div",{className:"product-card"},
      React.createElement("div",{className:"img-wrap"},React.createElement("img",{src:img,alt:name})),
      React.createElement("div",{className:"info"},
        React.createElement("div",{className:"name"},name),
        React.createElement("div",{className:"price"}, price!==""?`$${price}`:"")
      ),
      React.createElement("div",{className:"actions"},
        React.createElement("button",{className:"btn secondary",onClick:()=>onAdd&&onAdd(product)},"Agregar"),
        React.createElement("button",{className:"btn primary",onClick:()=>onView&&onView(id)},"Ver detalles")
      )
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.ProductCard = ProductCard;
})();