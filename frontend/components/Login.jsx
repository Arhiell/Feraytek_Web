// Feraytek UI - Componente Login
// Responsabilidad: renderizar el formulario de acceso con campos centrados, íconos
// integrados, toggle de visibilidad de contraseña y manejo de autenticación.

(function(){
  const { useState } = React;
  const { useForm } = window.Feraytek;

  function Login({ onLogged, onGoRegister }){
    const f = useForm({ identifier: "", password: "" });
    const [msg,setMsg] = useState(null);
    const [show,setShow] = useState(false);

    async function submit(){
      const ok = f.validate({ identifier:{required:true}, password:{required:true} });
      if(!ok) return;
      try{
      const id = String(f.data.identifier).trim();
      const body = { identificador: id, password: f.data.password };
      const res = await window.AuthController.login(body);
        let u = res.usuario || res.user || null;
        if(!u){
          try{ const me = await window.AuthController.profile(); u = me.user || me.usuario || me || null; }catch{}
        }
        onLogged(u);
        setMsg({type:"ok",text:"Sesión iniciada"});
      }catch(e){
        if(e.status===401){ setMsg({type:"error",text:"Usuario/Email o contraseña incorrectos"}); }
        else { setMsg({type:"error",text:e.message||"Error"}); }
      }
    }

    return React.createElement("form",{className:"auth-card",id:"loginForm",onSubmit:(e)=>{e.preventDefault();submit();}},
      React.createElement("div",{className:"grid one"},
        React.createElement("div",{className:"field"},
          React.createElement("label",null,"Usuario o Email"),
          React.createElement("div",{className:"input-shell"},
            React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 12a5 5 0 1 0-0.001-10.001A5 5 0 0 0 12 12zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z"})),
            React.createElement("input",{className:"input",autoComplete:"username",value:f.data.identifier,onChange:e=>f.set("identifier",e.target.value)})
          ),
          f.errors.identifier?React.createElement("div",{className:"msg error"},f.errors.identifier):null
        ),
        React.createElement("div",{className:"field"},
          React.createElement("label",null,"Contraseña"),
          React.createElement("div",{className:"input-shell"},
            React.createElement("svg",{className:"ico icon-left",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 17a2 2 0 110-4 2 2 0 010 4zm6-7h-1V7a5 5 0 00-10 0v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2zm-9-3a3 3 0 016 0v3H9V7z"})),
            React.createElement("div",{className:"input-wrap"},
              React.createElement("input",{className:"input",type:show?"text":"password",autoComplete:"current-password",value:f.data.password,onChange:e=>f.set("password",e.target.value)}),
              React.createElement("button",{type:"button",className:"toggle-eye",onMouseDown:()=>setShow(true),onMouseUp:()=>setShow(false),onMouseLeave:()=>setShow(false),onTouchStart:()=>setShow(true),onTouchEnd:()=>setShow(false),onTouchCancel:()=>setShow(false)},
                React.createElement("svg",{className:"ico",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 5C7 5 3.6 8.2 2 12c1.6 3.8 5 7 10 7s8.4-3.2 10-7c-1.6-3.8-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z"}))
              )
            )
          ),
          f.errors.password?React.createElement("div",{className:"msg error"},f.errors.password):null
        )
      ),
      f.errors.identifier?React.createElement("div",{className:"msg error"},f.errors.identifier):null,
      f.errors.password?React.createElement("div",{className:"msg error"},f.errors.password):null,
      React.createElement("div",{className:"auth-actions"},
        React.createElement("button",{type:"submit",className:"btn primary"},"Iniciar sesión"),
        React.createElement("button",{type:"button",className:"btn secondary",onClick:()=>onGoRegister&&onGoRegister()},"Registrarse")
      ),
      msg?React.createElement("div",{className:`msg ${msg.type}`},msg.text):null
    );
  }

  window.Feraytek = window.Feraytek || {};
  window.Feraytek.Login = Login;
})();

// Comentarios:
// - `Login` no incluye botones de acción internos; se activan desde la UI superior.
// - Uso de `id="loginForm"` permite solicitar envío desde botones externos.
// - Íconos SVG integrados y botón de ojo alineado a la derecha dentro del input.
// - Se mantiene la validación mínima para experiencia rápida.