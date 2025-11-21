;(function(){
  const { useState, useEffect } = React;
  function Checkout(){
    const [step,setStep] = useState(0);
    const [items,setItems] = useState([]);
    const [loading,setLoading] = useState(false);
    const [msg,setMsg] = useState(null);
    const [ship,setShip] = useState({ nombre:"", direccion:"", ciudad:"", provincia:"", pais:"", codigo_postal:"", telefono:"" });
    const [pedidoId,setPedidoId] = useState(null);
    const [pagoDesc,setPagoDesc] = useState("");
    const [pagoMonto,setPagoMonto] = useState(0);
    const [pagos,setPagos] = useState([]);

    useEffect(()=>{
      let mounted = true;
      (async()=>{
        setLoading(true); setMsg(null);
        try{
          const c = await window.CartController.get();
          const arr = c.items||c.data||c.carrito||c;
          const list = Array.isArray(arr)?arr:(Array.isArray(arr?.items)?arr.items:[]);
          if(mounted) setItems(Array.isArray(list)?list:[]);
          try{
            const me = await window.AuthController.profile();
            const u = me.user||me.usuario||me||{};
            const pre = {
              nombre: (u.nombre||""),
              direccion: (u.direccion||""),
              ciudad: (u.ciudad||""),
              provincia: (u.provincia||""),
              pais: (u.pais||""),
              codigo_postal: (u.codigo_postal||""),
              telefono: (u.telefono||"")
            };
            if(mounted) setShip(s=>({ ...s, ...pre }));
          }catch{}
        }catch(e){ if(mounted) setMsg({type:"error",text:e.message||"No se pudo cargar el carrito"}); }
        if(mounted) setLoading(false);
      })();
    },[]);

    function priceOf(it){ const p = it.precio_base??it.precio??it.price??0; return Number(p); }
    function ivaPct(it){ const v = it.iva_porcentaje??it.iva??0; return Number(v)||0; }
    const totals = items.reduce((acc,it)=>{ const q=Number(it.cantidad||1); const p=priceOf(it); const iva=ivaPct(it); const sub=p*q; const ivaVal=sub*(iva/100); acc.sub+=sub; acc.iva+=ivaVal; acc.total+=sub+ivaVal; return acc; },{sub:0,iva:0,total:0});

    function validateShipping(){
      const req = ["nombre","direccion","ciudad","provincia","pais","codigo_postal","telefono"];
      for(const k of req){ const v = String(ship[k]||"").trim(); if(!v) { setMsg({type:"error",text:`${k} es requerido`}); return false; } }
      setMsg(null); return true;
    }

    async function confirmarPedido(){
      setMsg(null);
      try{
        const payload = {
          envio: { ...ship },
          items: items.map(x=>({ id:x.id_producto||x.producto_id||x.id, cantidad:x.cantidad||1 })),
          monto_total: totals.total
        };
        const r = await window.OrdersController.create(payload);
        const d = r.pedido||r.data||r.item||r;
        const id = d.id||d.id_pedido||d.pedido_id||r.id||r.id_pedido||null;
        if(!id) throw { message:"Pedido creado sin id" };
        setPedidoId(id);
        setPagoDesc(`Pago pedido #${id}`);
        setPagoMonto(Number(d.total||d.monto_total||totals.total||0));
        setStep(2);
      }catch(e){ setMsg({type:"error",text:e.message||"No se pudo crear el pedido"}); }
    }

    async function realizarPago(){
      setMsg(null);
      try{
        const res = await window.PaymentsController.pay({ id_pedido:pedidoId, descripcion:pagoDesc, monto_total:Number(pagoMonto||0) });
        try{
          const pr = await window.PaymentsController.consult();
          const list = pr.items||pr.data||pr.pagos||pr.results||pr;
          setPagos(Array.isArray(list)?list:[]);
        }catch{}
        setMsg({type:"ok",text:"Pago registrado"});
      }catch(e){ setMsg({type:"error",text:e.message||"No se pudo procesar el pago"}); }
    }

    function itemRow(it){
      const name = it.nombre||it.title||it.name||"Producto";
      const q = Number(it.cantidad||1);
      const p = priceOf(it);
      const iva = ivaPct(it);
      const sub = p*q; const ivaVal=sub*(iva/100); const total=sub+ivaVal;
      return React.createElement("div",{className:"row"},
        React.createElement("div",null,`${name} × ${q}`),
        React.createElement("div",null,`$${total.toFixed(2)}`)
      );
    }

    function paso1(){
      return React.createElement("div",{className:"card"},
        React.createElement("h2",null,"Datos de envío"),
        React.createElement("div",{className:"grid one"},
          React.createElement("div",{className:"field"},React.createElement("label",null,"Nombre"),React.createElement("input",{className:"input",value:ship.nombre,onChange:e=>setShip(s=>({...s,nombre:e.target.value}))})),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Dirección"),React.createElement("input",{className:"input",value:ship.direccion,onChange:e=>setShip(s=>({...s,direccion:e.target.value}))})),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Ciudad"),React.createElement("input",{className:"input",value:ship.ciudad,onChange:e=>setShip(s=>({...s,ciudad:e.target.value}))})),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Provincia"),React.createElement("input",{className:"input",value:ship.provincia,onChange:e=>setShip(s=>({...s,provincia:e.target.value}))})),
          React.createElement("div",{className:"field"},React.createElement("label",null,"País"),React.createElement("input",{className:"input",value:ship.pais,onChange:e=>setShip(s=>({...s,pais:e.target.value}))})),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Código Postal"),React.createElement("input",{className:"input",value:ship.codigo_postal,onChange:e=>setShip(s=>({...s,codigo_postal:e.target.value}))})),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Teléfono"),React.createElement("input",{className:"input",value:ship.telefono,onChange:e=>setShip(s=>({...s,telefono:e.target.value}))}))
        ),
        React.createElement("div",{className:"step-actions"},
          React.createElement("button",{className:"btn primary",onClick:()=>{ if(validateShipping()) setStep(1); }},"Continuar")
        )
      );
    }

    function paso2(){
      return React.createElement("div",{className:"card"},
        React.createElement("h2",null,"Resumen y confirmación"),
        React.createElement("div",{className:"grid one"},
          React.createElement("div",{className:"field"},React.createElement("label",null,"Envío"),React.createElement("div",null,`${ship.nombre}, ${ship.direccion}, ${ship.ciudad}, ${ship.provincia}, ${ship.pais} (${ship.codigo_postal}) · ${ship.telefono}`)),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Items"),React.createElement("div",{className:"card narrow"}, items.map((it,i)=>React.createElement("div",{key:i}, itemRow(it))))),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Totales"),React.createElement("div",{className:"row"},React.createElement("div",null,"Subtotal"),React.createElement("div",null,`$${totals.sub.toFixed(2)}`)),React.createElement("div",{className:"row"},React.createElement("div",null,"IVA"),React.createElement("div",null,`$${totals.iva.toFixed(2)}`)),React.createElement("div",{className:"row"},React.createElement("div",{style:{fontWeight:700}},"Total"),React.createElement("div",{style:{fontWeight:700}},`$${totals.total.toFixed(2)}`)))
        ),
        React.createElement("div",{className:"step-actions"},
          React.createElement("button",{className:"btn secondary",onClick:()=>setStep(0)},"Atrás"),
          React.createElement("button",{className:"btn primary",onClick:confirmarPedido},"Confirmar pedido")
        )
      );
    }

    function pagoItem(p){
      const id = p.id||p.id_pago||p.payment_id;
      const des = p.descripcion||p.description||"Pago";
      const m = Number(p.monto_total||p.amount||0);
      const f = p.fecha||p.created_at||p.creado_en||"";
      return React.createElement("div",{className:"row"},React.createElement("div",null,`${des}`),React.createElement("div",null,`$${m.toFixed(2)}`),React.createElement("div",null,String(f||"")));
    }

    function paso3(){
      return React.createElement("div",{className:"card"},
        React.createElement("h2",null,"Pago"),
        React.createElement("div",{className:"grid one"},
          React.createElement("div",{className:"field"},React.createElement("label",null,"Pedido"),React.createElement("div",null,`#${pedidoId||""}`)),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Descripción"),React.createElement("input",{className:"input",value:pagoDesc,onChange:e=>setPagoDesc(e.target.value)})),
          React.createElement("div",{className:"field"},React.createElement("label",null,"Monto"),React.createElement("input",{className:"input",inputMode:"decimal",value:String(pagoMonto),onChange:e=>setPagoMonto(e.target.value)}))
        ),
        React.createElement("div",{className:"step-actions"},
          React.createElement("button",{className:"btn secondary",onClick:()=>setStep(1)},"Atrás"),
          React.createElement("button",{className:"btn primary",onClick:realizarPago},"Pagar")
        ),
        pagos && pagos.length? React.createElement("div",{className:"card narrow"},
          React.createElement("h3",null,"Mis pagos"),
          pagos.map((p,i)=>React.createElement("div",{key:i}, pagoItem(p)))
        ) : null,
        React.createElement("div",{className:"action-bar"},
          React.createElement("button",{className:"btn secondary",onClick:()=>{ if(window.Feraytek) window.Feraytek.go("catalog"); }},"Volver al catálogo"),
          React.createElement("button",{className:"btn primary",onClick:()=>{ if(window.Feraytek) window.Feraytek.go("orders"); }},"Ver mis pedidos")
        )
      );
    }

    const titles = ["Datos de envío","Resumen","Pago"];
    return React.createElement("div",{className:"catalog"},
      React.createElement(window.Feraytek.Header,{}),
      React.createElement("h1",{className:"page-title"},"Checkout"),
      React.createElement("div",{className:"stepper"},
        React.createElement("div",{className:"bullets"},
          React.createElement("div",{className:"bullet "+(step===0?"active":"")},"1"),
          React.createElement("div",{className:"bullet "+(step===1?"active":"")},"2"),
          React.createElement("div",{className:"bullet "+(step===2?"active":"")},"3")
        ),
        React.createElement("div",{className:"step-title"},`Paso ${step+1} de 3: ${titles[step]}`)
      ),
      msg?React.createElement("div",{className:`msg ${msg.type}`},msg.text):null,
      loading?React.createElement("div",{className:"loading"},"Cargando..."):
      step===0?paso1(): step===1?paso2(): paso3()
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Checkout = Checkout;
})();