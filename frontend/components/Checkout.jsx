;(function(){
  const { useState, useEffect } = React;
  function Checkout(){
    const [step,setStep] = useState(0);
    const [items,setItems] = useState([]);
    const [loading,setLoading] = useState(false);
    const [msg,setMsg] = useState(null);
    const [ship,setShip] = useState({ nombre:"", direccion:"", ciudad:"", provincia:"", pais:"", codigo_postal:"", telefono:"", metodo_entrega:"" });
    const [pedidoId,setPedidoId] = useState(null);
    const [pagoDesc,setPagoDesc] = useState("");
    const [pagoMonto,setPagoMonto] = useState(0);
    const [pagos,setPagos] = useState([]);
    const [metodos,setMetodos] = useState([]);

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
          try{
            const sm = await window.OrdersController.shipments();
            const data = sm.data||sm.envios||sm.items||sm.results||sm;
            const list2 = Array.isArray(data)?data:[];
            if(mounted){
              setMetodos(list2);
              if(list2.length){
                const first = list2[0];
                const nombre = first?.metodo_entrega||first?.nombre||first?.name||"";
                setShip(s=>({ ...s, metodo_entrega: s.metodo_entrega || nombre }));
              }
            }
          }catch{}
        }catch(e){ if(mounted) setMsg({type:"error",text:e.message||"No se pudo cargar el carrito"}); }
        if(mounted) setLoading(false);
      })();
    },[]);

    function priceOf(it){ const p = it.precio_base??it.precio??it.price??0; return Number(p); }
    function ivaPct(it){ const v = it.iva_porcentaje??it.iva??0; return Number(v)||0; }
    const totals = items.reduce((acc,it)=>{ const q=Number(it.cantidad||1); const p=priceOf(it); const iva=ivaPct(it); const sub=p*q; const ivaVal=sub*(iva/100); acc.sub+=sub; acc.iva+=ivaVal; acc.total+=sub+ivaVal; return acc; },{sub:0,iva:0,total:0});
    function metodoActual(){ const name=String(ship.metodo_entrega||"").toLowerCase(); const m=metodos.find(mm=>String(mm?.metodo_entrega||mm?.nombre||mm?.name||"").toLowerCase()===name)||metodos[0]||null; return m||{}; }
    function envioCosto(){
      const m=metodoActual();
      let base=Number(m.costo_base??m.precio_base??m.base??m.costo??m.precio??0)||0;
      let porKm=Number(m.costo_por_km??m.precio_por_km??m.km_rate??m.tarifa_km??m.km??0)||0;
      const nombre=String(m?.metodo_entrega||m?.nombre||m?.name||"").toLowerCase();
      if(base===0 && porKm===0){
        if(nombre.includes("express")) { base=1500; porKm=80; }
        else if(nombre.includes("estándar")||nombre.includes("estandar")||nombre.includes("standard")) { base=1000; porKm=50; }
        else if(nombre.includes("moto")) { base=1200; porKm=70; }
        else if(nombre.includes("retiro")||nombre.includes("tienda")||nombre.includes("local")) { base=0; porKm=0; }
        else { base=800; porKm=40; }
      }
      const dist=Number(ship.distancia_km||0)||0;
      const val=base + (porKm>0? porKm*dist : 0);
      return val>0?val:0;
    }
    const ORIGEN={ lat:-34.6037, lon:-58.3816 };
    const PROV_CENTERS={
      "buenos aires":{lat:-36.3,lon:-60},"caba":{lat:-34.6037,lon:-58.3816},"capital federal":{lat:-34.6037,lon:-58.3816},"ciudad autonoma de buenos aires":{lat:-34.6037,lon:-58.3816},
      "catamarca":{lat:-28.5,lon:-65.8},"chaco":{lat:-26.5,lon:-60.75},"chubut":{lat:-43.3,lon:-67.5},"cordoba":{lat:-31.4,lon:-64.18},"corrientes":{lat:-27.48,lon:-58.83},
      "entre rios":{lat:-31.73,lon:-60.5},"formosa":{lat:-26.18,lon:-58.15},"jujuy":{lat:-24.18,lon:-65.33},"la pampa":{lat:-36.62,lon:-64.29},"la rioja":{lat:-29.41,lon:-66.86},
      "mendoza":{lat:-32.89,lon:-68.83},"misiones":{lat:-27.37,lon:-55.89},"neuquen":{lat:-38.95,lon:-68.06},"rio negro":{lat:-40.8,lon:-67.8},"salta":{lat:-24.78,lon:-65.41},
      "san juan":{lat:-31.54,lon:-68.52},"san luis":{lat:-33.3,lon:-66.34},"santa cruz":{lat:-46.59,lon:-68.3},"santa fe":{lat:-31.64,lon:-60.7},"santiago del estero":{lat:-27.79,lon:-64.26},
      "tierra del fuego":{lat:-54.8,lon:-68.3},"tucuman":{lat:-26.82,lon:-65.22}
    };
    function normalize(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim(); }
    async function geocodeAR(city,prov,country){
      const q=[city,prov,country].filter(Boolean).join(", ");
      if(!q) return null;
      const url=`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(q)}`;
      try{ const r=await fetch(url,{ headers:{ "Accept":"application/json" } }); const j=await r.json(); const p=Array.isArray(j)&&j.length?j[0]:null; if(!p) return null; return { lat:Number(p.lat), lon:Number(p.lon) }; }catch{ return null; }
    }
    function haversineKm(a,b){ const R=6371; const dLat=(b.lat-a.lat)*Math.PI/180; const dLon=(b.lon-a.lon)*Math.PI/180; const la1=a.lat*Math.PI/180; const la2=b.lat*Math.PI/180; const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2; return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); }
    useEffect(()=>{ const t=setTimeout(async()=>{ const city=ship.ciudad; const prov=ship.provincia; const country=ship.pais||"Argentina"; let dest=await geocodeAR(city,prov,country); if(!dest){ const key=normalize(prov); dest=PROV_CENTERS[key]||null; } if(dest){ const km=haversineKm(ORIGEN,dest); setShip(s=>({...s,distancia_km:Math.round(km)})); } },400); return ()=>clearTimeout(t); },[ship.ciudad,ship.provincia,ship.pais,ship.direccion]);

    function validateShipping(){
      const req = ["nombre","direccion","ciudad","provincia","pais","codigo_postal","telefono"].concat(metodos.length? ["metodo_entrega"] : []);
      for(const k of req){ const v = String(ship[k]||"").trim(); if(!v) { setMsg({type:"error",text:`${k} es requerido`}); return false; } }
      setMsg(null); return true;
    }

    async function confirmarPedido(){
      setMsg(null);
      try{
        const payload = {
          envio: { ...ship },
          items: items.map(x=>{
            const id_producto = x.id_producto||x.producto_id||x.id;
            let id_variante = x.id_variante||x.variante_id||x.variant_id;
            if(id_variante===0||id_variante==="0"||id_variante===undefined) id_variante = null;
            const cantidad = x.cantidad||1;
            const precio_unitario = priceOf(x);
            const iva_porcentaje = ivaPct(x);
            return { id_producto, id_variante, cantidad, precio_unitario, iva_porcentaje };
          }),
          costo_envio: envioCosto(),
          monto_total: totals.total + envioCosto()
        };
        const r = await window.OrdersController.create(payload);
        const d = r.pedido||r.data||r.item||r;
        const id = d.id||d.id_pedido||d.pedido_id||r.id||r.id_pedido||null;
        if(!id) throw { message:"Pedido creado sin id" };
        setPedidoId(id);
        setPagoDesc(`Pago pedido #${id}`);
        setPagoMonto(Number(d.total||d.monto_total||(totals.total+envioCosto())||0));
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
      return React.createElement("div",{className:"checkout-card"},
        React.createElement("div",{className:"block-header"},
          React.createElement("h2",{className:"block-title"},"Datos de envío"),
          React.createElement("p",{className:"block-sub"},"Completa tu información para la entrega")
        ),
        React.createElement("div",{className:"form-grid two"},
          React.createElement("div",{className:"form-field"},React.createElement("label",null,"Nombre"),React.createElement("div",{className:"input-shell"},React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 12a5 5 0 1 0-0.001-10.001A5 5 0 0 0 12 12zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z"})),React.createElement("input",{className:"input",value:ship.nombre,onChange:e=>setShip(s=>({...s,nombre:e.target.value}))})) ),
          React.createElement("div",{className:"form-field"},React.createElement("label",null,"Dirección"),React.createElement("div",{className:"input-shell"},React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 3l9 8-1 1-2-2v9H6V10L4 12 3 11l9-8z"})),React.createElement("input",{className:"input",value:ship.direccion,onChange:e=>setShip(s=>({...s,direccion:e.target.value}))})) ),
          React.createElement("div",{className:"form-field"},React.createElement("label",null,"Ciudad"),React.createElement("div",{className:"input-shell"},React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M5 3h6v6H5V3zm8 0h6v10h-6V3zM5 11h6v10H5V11zm8 12h6v-2h-6v2z"})),React.createElement("input",{className:"input",value:ship.ciudad,onChange:e=>setShip(s=>({...s,ciudad:e.target.value}))})) ),
          React.createElement("div",{className:"form-field"},React.createElement("label",null,"Provincia"),React.createElement("div",{className:"input-shell"},React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 2l7 6-7 6-7-6 7-6zm0 16l7 4-7-2-7 2 7-4z"})),React.createElement("input",{className:"input",value:ship.provincia,onChange:e=>setShip(s=>({...s,provincia:e.target.value}))})) ),
          React.createElement("div",{className:"form-field"},React.createElement("label",null,"País"),React.createElement("div",{className:"input-shell"},React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 017.8 6H12V4zM4.2 12A8 8 0 0012 20v-8H4.2z"})),React.createElement("input",{className:"input",value:ship.pais,onChange:e=>setShip(s=>({...s,pais:e.target.value}))})) ),
          React.createElement("div",{className:"form-field"},React.createElement("label",null,"Código Postal"),React.createElement("div",{className:"input-shell"},React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M4 6h16v12H4zm4 3h8v2H8V9zm0 4h6v2H8v-2z"})),React.createElement("input",{className:"input",value:ship.codigo_postal,onChange:e=>setShip(s=>({...s,codigo_postal:e.target.value}))})) ),
          React.createElement("div",{className:"form-field"},React.createElement("label",null,"Teléfono"),React.createElement("div",{className:"input-shell"},React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M6 2l4 2-1 3-2 2a12 12 0 006 6l2-2 3 1-2 4c-6 1-14-7-14-14z"})),React.createElement("input",{className:"input",value:ship.telefono,onChange:e=>setShip(s=>({...s,telefono:e.target.value}))})) ),
          React.createElement("div",{className:"form-field span-2"},React.createElement("label",null,"Método de entrega"),
            React.createElement("select",{className:"input",value:(ship.metodo_entrega||""),onChange:e=>setShip(s=>({...s,metodo_entrega:e.target.value}))},
              metodos.length?metodos.map((m,i)=>{
                const nombre=m?.metodo_entrega||m?.nombre||m?.name||"Método";
                return React.createElement("option",{key:(m.id_envio||m.id||i),value:nombre}, nombre);
              }):[React.createElement("option",{key:"none",value:""},"Seleccione...")]
            )
          )
        ),
        React.createElement("div",{className:"action-bar"},
          React.createElement("button",{className:"btn primary",onClick:()=>{ if(validateShipping()) setStep(1); }},"Continuar")
        )
      );
    }

    function paso2(){
      return React.createElement("div",{className:"checkout-card"},
        React.createElement("div",{className:"block-header"},
          React.createElement("h2",{className:"block-title"},"Resumen y confirmación"),
          React.createElement("p",{className:"block-sub"},"Revisa tu pedido antes de confirmar")
        ),
        React.createElement("div",{className:"checkout-section"},
          React.createElement("div",{className:"summary-grid"},
            React.createElement("div",{className:"sum-label"},"Nombre"),React.createElement("div",{className:"sum-value"},ship.nombre||""),
            React.createElement("div",{className:"sum-label"},"Dirección"),React.createElement("div",{className:"sum-value"},ship.direccion||""),
            React.createElement("div",{className:"sum-label"},"Ciudad"),React.createElement("div",{className:"sum-value"},ship.ciudad||""),
            React.createElement("div",{className:"sum-label"},"Provincia"),React.createElement("div",{className:"sum-value"},ship.provincia||""),
            React.createElement("div",{className:"sum-label"},"País"),React.createElement("div",{className:"sum-value"},ship.pais||""),
            React.createElement("div",{className:"sum-label"},"Código Postal"),React.createElement("div",{className:"sum-value"},ship.codigo_postal||""),
            React.createElement("div",{className:"sum-label"},"Teléfono"),React.createElement("div",{className:"sum-value"},ship.telefono||""),
            React.createElement("div",{className:"sum-label"},"Distancia (km)"),React.createElement("div",{className:"sum-value"},String(ship.distancia_km||"")),
            React.createElement("div",{className:"sum-label"},"Método de entrega"),React.createElement("div",{className:"sum-value"},ship.metodo_entrega||"")
          )
        ),
        React.createElement("div",{className:"checkout-section"},
          React.createElement("div",{className:"item-panel"}, items.map((it,i)=>React.createElement("div",{key:i,className:"item-row"},
            React.createElement("div",{className:"item-name"},it.nombre||it.title||it.name||"Producto"),
            React.createElement("div",{className:"item-qty"},`× ${Number(it.cantidad||1)}`),
            React.createElement("div",{className:"item-price"},`$${(function(){ const q=Number(it.cantidad||1); const p=priceOf(it); const iva=ivaPct(it); const sub=p*q; const ivaVal=sub*(iva/100); return (sub+ivaVal).toFixed(2); })()}`)
          )))
        ),
        React.createElement("div",{className:"checkout-section"},
          React.createElement("div",{className:"totals-panel"},
            React.createElement("div",{className:"row"},React.createElement("div",{className:"tot-label"},"Subtotal"),React.createElement("div",{className:"tot-value"},`$${totals.sub.toFixed(2)}`)),
            React.createElement("div",{className:"row"},React.createElement("div",{className:"tot-label"},"IVA"),React.createElement("div",{className:"tot-value"},`$${totals.iva.toFixed(2)}`)),
            React.createElement("div",{className:"row"},React.createElement("div",{className:"tot-label"},"Costo de envío"),React.createElement("div",{className:"tot-value"},`$${envioCosto().toFixed(2)}`)),
            React.createElement("div",{className:"row"},React.createElement("div",{className:"tot-label tot-strong"},"Total"),React.createElement("div",{className:"tot-value tot-strong"},`$${(totals.total+envioCosto()).toFixed(2)}`))
          )
        ),
        React.createElement("div",{className:"action-bar"},
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
    const tx = p.id_transaccion||p.transaction_id||p.tx||"";
    const estado = p.estado_pago||p.estado||p.status||"";
    return React.createElement("div",{className:"row"},
      React.createElement("div",null,`${des}`),
      React.createElement("div",null,`$${m.toFixed(2)}`),
      React.createElement("div",null,String(f||"")),
      React.createElement("div",null,String(estado||"")),
      tx?React.createElement("button",{className:"btn secondary",onClick:async()=>{
        try{ await window.PaymentsController.simulateApprove(tx); const pr = await window.PaymentsController.consult(); const list = pr.items||pr.data||pr.pagos||pr.results||pr; setPagos(Array.isArray(list)?list:[]); }
        catch(e){ setMsg({type:"error",text:e.message||"No se pudo simular aprobación"}); }
      }},"Simular aprobación"):null
    );
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
    return React.createElement("div",{className:"checkout-page"},
      React.createElement(window.Feraytek.Header,{}),
      React.createElement("div",{className:"checkout-wrap"},
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
      )
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Checkout = Checkout;
})();