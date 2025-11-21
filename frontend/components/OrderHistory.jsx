(function(){
  const { useState, useEffect } = React;
  function OrderHistory(){
    const [items,setItems] = useState([]);
    const [loading,setLoading] = useState(false);
    const [err,setErr] = useState(null);
    const [msg,setMsg] = useState(null);
    const [status,setStatus] = useState("Todos");
    const [sort,setSort] = useState("fecha_desc");
    const [detail,setDetail] = useState(null);
    async function load(){
      setLoading(true); setErr(null);
      try{
        const st = status!=="Todos"?status.toLowerCase():undefined;
        const res = await window.OrdersController.history({ page:1, limit:20, status:st, sort });
        const data = res.items||res.data||res.pedidos||res.results||res;
        setItems(Array.isArray(data)?data:[]);
      }catch(e){ setErr(e.message||"Error al cargar historial"); setItems([]); }
      finally{ setLoading(false); }
    }
    useEffect(()=>{ load(); },[status,sort]);
    async function openDetail(id){
      setMsg(null); setDetail(null);
      try{
        const r = await window.OrdersController.order(id);
        const d = r.item||r.data||r.pedido||r;
        setDetail(d);
      }catch(e){ setMsg({type:"error",text:e.message||"No se pudo cargar detalle"}); }
    }
    function fmtDate(x){ try{ const d=new Date(x); if(isNaN(d.getTime())) return String(x||""); return d.toLocaleString(); }catch{ return String(x||""); } }
    function totalOf(p){ const t = p.total||p.monto_total||p.amount||0; return Number(t); }
    function statusChip(s){ const st = String(s||"Pendiente"); return React.createElement("span",{className:"chip"+(st.toLowerCase()==="entregado"?" active":"")},st); }
    function row(p){
      const id = p.id||p.id_pedido||p.pedido_id;
      const fecha = p.fecha||p.created_at||p.creado_en;
      const estado = p.estado||p.status||"Procesando";
      const total = totalOf(p);
      return React.createElement("div",{className:"product-card"},
        React.createElement("div",{className:"info"},
          React.createElement("div",{className:"name"},`Pedido #${id}`),
          React.createElement("div",{className:"price"},`$${total.toFixed(2)}`),
          React.createElement("div",null, fmtDate(fecha)," · ", statusChip(estado))
        ),
        React.createElement("div",{className:"actions"},
          React.createElement("button",{className:"btn primary",onClick:()=>openDetail(id)},"Ver detalle")
        )
      );
    }
    return React.createElement("div",{className:"catalog"},
      React.createElement(window.Feraytek.Header,{}),
      React.createElement("h1",{className:"page-title"},"Historial de Pedidos"),
      msg?React.createElement("div",{className:`msg ${msg.type}`},msg.text):null,
      React.createElement("div",{className:"top-actions"},
        React.createElement("select",{className:"input",value:status,onChange:e=>setStatus(e.target.value)},
          React.createElement("option",{value:"Todos"},"Todos"),
          React.createElement("option",{value:"Procesando"},"Procesando"),
          React.createElement("option",{value:"Enviado"},"Enviado"),
          React.createElement("option",{value:"Entregado"},"Entregado"),
          React.createElement("option",{value:"Cancelado"},"Cancelado")
        ),
        React.createElement("select",{className:"input",value:sort,onChange:e=>setSort(e.target.value)},
          React.createElement("option",{value:"fecha_desc"},"Fecha (recientes)"),
          React.createElement("option",{value:"fecha_asc"},"Fecha (antiguos)"),
          React.createElement("option",{value:"monto_desc"},"Monto (mayor)"),
          React.createElement("option",{value:"monto_asc"},"Monto (menor)")
        )
      ),
      err?React.createElement("div",{className:"msg error"},err):null,
      loading?React.createElement("div",{className:"loading"},"Cargando..."):
      React.createElement("div",{className:"catalog-grid"}, items.map((p,i)=>React.createElement("div",{key:(p.id||p.id_pedido||i)}, row(p)))),
      detail?React.createElement("div",{className:"modal-backdrop"},
        React.createElement("div",{className:"modal-card"},
          React.createElement("div",{className:"modal-title"},`Pedido #${detail.id||detail.id_pedido||""}`),
          React.createElement("div",{className:"modal-text"},
            React.createElement("div",null,`Estado: ${detail.estado||detail.status||""}`),
            React.createElement("div",null,`Total: $${totalOf(detail).toFixed(2)}`),
            React.createElement("div",null,`Fecha: ${fmtDate(detail.fecha||detail.created_at||detail.creado_en)}`)
          ),
          React.createElement("div",{className:"modal-actions"},
            React.createElement("button",{className:"btn secondary",onClick:()=>setDetail(null)},"Cerrar")
          )
        )
      ):null
    );
  }
  window.Feraytek = window.Feraytek || {};
  window.Feraytek.OrderHistory = OrderHistory;
})();