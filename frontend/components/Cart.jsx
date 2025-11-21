;(function(){
  const { useState, useEffect } = React;
  function Cart({ onBack }){
    const [items,setItems]=useState([]);
    const [loading,setLoading]=useState(false);
    const [err,setErr]=useState(null);
    const [open,setOpen]=useState(false);
    const [ship,setShip]=useState({ direccion:"", ciudad:"", provincia:"", pais:"", codigo_postal:"", telefono:"", metodo:"" });
    const [metodos,setMetodos]=useState([]);

    useEffect(()=>{
      (async()=>{
        setLoading(true); setErr(null);
        try{
          const res = await window.CartController.get();
          const data = res.items||res.data||res.carrito||res;
          setItems(Array.isArray(data)?data:(Array.isArray(data?.items)?data.items:[]));
          try{ const cfg = await window.CartController.shippingMethods(); const list = cfg.data||cfg.metodos||cfg; setMetodos(Array.isArray(list)?list:[]); }catch{}
        }catch(e){ setErr(e.message||"Error al cargar carrito"); setItems([]); }
        setLoading(false);
      })();
    },[]);

    function priceOf(it){ const p = it.precio_base??it.precio??it.price??0; return Number(p); }
    function ivaPct(it){ const v = it.iva_porcentaje??it.iva??0; return Number(v)||0; }
    const totals = items.reduce((acc,it)=>{ const q=Number(it.cantidad||1); const p=priceOf(it); const iva=ivaPct(it); const sub=p*q; const ivaVal=sub*(iva/100); acc.sub+=sub; acc.iva+=ivaVal; acc.total+=sub+ivaVal; return acc; },{sub:0,iva:0,total:0});

    async function setQty(it,q){ const id=it.id||it.id_item||it.id_producto||it.producto_id||it.idItem||it.idProducto; const cantidad=Math.max(1,q); try{ await window.CartController.update(id,cantidad); setItems(prev=>prev.map(x=> (x===it? {...x,cantidad } : x))); }catch(e){ setErr(e.message||"No se pudo actualizar cantidad"); } }
    async function remove(it){ const id=it.id||it.id_item||it.id_producto||it.producto_id||it.idItem||it.idProducto; try{ await window.CartController.remove(id); setItems(prev=>prev.filter(x=>x!==it)); }catch(e){ setErr(e.message||"No se pudo eliminar"); } }
    async function confirm(){ const payload={ envio:{...ship}, items: items.map(x=>({ id:x.id_producto||x.producto_id||x.id, cantidad:x.cantidad })) }; try{ await window.CartController.checkout(payload); setOpen(false); }catch(e){ setErr(e.message||"No se pudo confirmar"); } }

    function itemRow(it){
      const img = it.imagen||it.image||it.img||"https://via.placeholder.com/120x90?text=IMG";
      const name = it.nombre||it.title||it.name||"Producto";
      const varTxt = it.variante||it.variacion||it.variant||"";
      const p = priceOf(it); const iva = ivaPct(it);
      const q = Number(it.cantidad||1);
      const sub = p*q; const ivaVal = sub*(iva/100); const total = sub+ivaVal;
      return React.createElement("div",{className:"cart-item"},
        React.createElement("div",{className:"ci-img"},React.createElement("img",{src:img,alt:name})),
        React.createElement("div",{className:"ci-info"},
          React.createElement("div",{className:"ci-name"},name),
          React.createElement("div",{className:"ci-var"},varTxt)
        ),
        React.createElement("div",{className:"ci-price"},`$${p}`),
        React.createElement("div",{className:"ci-iva"},`${iva}%`),
        React.createElement("div",{className:"ci-qty"},
          React.createElement("button",{className:"btn secondary",onClick:()=>setQty(it,q-1)},"-"),
          React.createElement("span",{className:"qty-num"},q),
          React.createElement("button",{className:"btn secondary",onClick:()=>setQty(it,q+1)},"+")
        ),
        React.createElement("div",{className:"ci-sub"},`$${total.toFixed(2)}`),
        React.createElement("div",{className:"ci-actions"},
          React.createElement("button",{className:"icon-btn",title:"Eliminar",onClick:()=>remove(it)},
            React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},
              React.createElement("path",{d:"M6 7h12v2H6zm2 4h8v8H8z M10 2h4l1 2h4v2H5V4h4l1-2z"})
            )
          )
        )
      );
    }

    const list = React.createElement("div",{className:"cart-list"}, items.map((it,i)=>React.createElement("div",{key:i}, itemRow(it))));
    const summary = React.createElement("div",{className:"cart-summary"},
      React.createElement("div",{className:"row"},React.createElement("div",null,"Subtotal"),React.createElement("div",null,`$${totals.sub.toFixed(2)}`)),
      React.createElement("div",{className:"row"},React.createElement("div",null,"IVA"),React.createElement("div",null,`$${totals.iva.toFixed(2)}`)),
      React.createElement("div",{className:"row"},React.createElement("div",{style:{fontWeight:700}},"Total"),React.createElement("div",{style:{fontWeight:700}},`$${totals.total.toFixed(2)}`)),
      React.createElement("div",{className:"action-bar"},
        React.createElement("button",{className:"btn secondary",onClick:onBack},"Seguir comprando"),
        React.createElement("button",{className:"btn primary",onClick:()=>setOpen(true)},"Finalizar compra")
      )
    );
    const content = items.length ? React.createElement("div",null,list,summary) : React.createElement("div",{className:"msg"},"Tu carrito está vacío");

    return React.createElement("div",{className:"cart-page"},
      React.createElement(window.Feraytek.Header,{onNavProducts:()=>{},onUserClick:()=>{},onCartClick:()=>{},onFavClick:()=>{}}),
      React.createElement("div",{className:"cart-wrap"},
        React.createElement("h1",{className:"page-title"},"Carrito"),
        err?React.createElement("div",{className:"msg error"},err):null,
        loading?React.createElement("div",{className:"loading"},"Cargando..."):content
      ),
      open?React.createElement("div",{className:"slide-over"},
        React.createElement("div",{className:"slide-card"},
          React.createElement("div",{className:"modal-title"},"Datos de envío"),
          React.createElement("div",{className:"grid one"},
            React.createElement("div",{className:"field"},React.createElement("label",null,"Dirección"),React.createElement("input",{className:"input",value:ship.direccion,onChange:e=>setShip(s=>({...s,direccion:e.target.value}))})),
            React.createElement("div",{className:"field"},React.createElement("label",null,"Ciudad"),React.createElement("input",{className:"input",value:ship.ciudad,onChange:e=>setShip(s=>({...s,ciudad:e.target.value}))})),
            React.createElement("div",{className:"field"},React.createElement("label",null,"Provincia"),React.createElement("input",{className:"input",value:ship.provincia,onChange:e=>setShip(s=>({...s,provincia:e.target.value}))})),
            React.createElement("div",{className:"field"},React.createElement("label",null,"País"),React.createElement("input",{className:"input",value:ship.pais,onChange:e=>setShip(s=>({...s,pais:e.target.value}))})),
            React.createElement("div",{className:"field"},React.createElement("label",null,"Código Postal"),React.createElement("input",{className:"input",value:ship.codigo_postal,onChange:e=>setShip(s=>({...s,codigo_postal:e.target.value}))})),
            React.createElement("div",{className:"field"},React.createElement("label",null,"Teléfono"),React.createElement("input",{className:"input",value:ship.telefono,onChange:e=>setShip(s=>({...s,telefono:e.target.value}))})),
            React.createElement("div",{className:"field"},React.createElement("label",null,"Método de envío"),React.createElement("select",{className:"input",value:ship.metodo,onChange:e=>setShip(s=>({...s,metodo:e.target.value}))},
              React.createElement("option",{value:""},"Seleccione"),
              metodos.map((m,i)=>React.createElement("option",{key:i,value:(m.id||m.codigo||m.nombre||m)},(m.nombre||m.title||m.label||m)))
            ))
          ),
          React.createElement("div",{className:"modal-actions"},
            React.createElement("button",{className:"btn secondary",onClick:()=>setOpen(false)},"Cancelar"),
            React.createElement("button",{className:"btn primary",onClick:confirm},"Confirmar pedido")
          )
        )
      ):null
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Cart = Cart;
})();