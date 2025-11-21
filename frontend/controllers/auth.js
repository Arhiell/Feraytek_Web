window.AuthController = (function(){
  const base = "http://localhost:3000";
  const useCookies = !!(window.Feraytek && window.Feraytek.AUTH_MODE === "cookie");
  async function parse(r){
    const ct = (r.headers.get("content-type")||"").toLowerCase();
    if(ct.includes("application/json")){
      try { return await r.json(); } catch { return { message: "JSON inválido" }; }
    }
    const t = await r.text();
    if(/<!doctype html>|<html/i.test(t)){
      const m = t.match(/<pre>([\s\S]*?)<\/pre>/i);
      let msg = m ? m[1] : t;
      msg = msg.replace(/<br\s*\/>/gi,"\n").replace(/<[^>]+>/g,"").trim();
      return { message: msg };
    }
    try { return JSON.parse(t); } catch { return { message: t || "Respuesta no válida" }; }
  }
  async function register(payload){
    const init = {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include";
    const r = await fetch(base+"/api/users/register",init);
    const j = await parse(r);
    if(!r.ok) throw { status: r.status, ...j };
    return j;
  }
  async function login(payload){
    const init = {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const r = await fetch(base+"/api/users/login",init);
    const j = await parse(r);
    if(!r.ok) throw { status: r.status, ...j };
    if(!useCookies && j && j.token) { try { localStorage.setItem("token", j.token); } catch {} }
    return j;
  }
  async function profile(){
    let init = {};
    if(useCookies){
      init.credentials = "include";
    } else {
      const token = localStorage.getItem("token")||"";
      const headers = {};
      if(token) headers["Authorization"] = "Bearer "+token;
      init = { headers, credentials: "omit" };
    }
    const r = await fetch(base+"/api/users/profile",init);
    const j = await parse(r);
    if(!r.ok) throw { status: r.status, ...j };
    return j;
  }
  async function updateProfile(payload){
    const headers = {"Content-Type":"application/json"};
    if(!useCookies){
      const token = localStorage.getItem("token")||"";
      if(token) headers["Authorization"] = "Bearer "+token;
    }
    const init = {method:"PUT",headers,body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const r = await fetch(base+"/api/users/profile",init);
    const j = await parse(r);
    if(!r.ok) throw { status: r.status, ...j };
    return j;
  }
  async function updateClientProfile(id,payload){
    const headers = {"Content-Type":"application/json"};
    if(!useCookies){
      const token = localStorage.getItem("token")||"";
      if(token) headers["Authorization"] = "Bearer "+token;
    }
    const init = {method:"PUT",headers,body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const r = await fetch(base+"/api/users/profile/cliente/"+id,init);
    const j = await parse(r);
    if(!r.ok) throw { status: r.status, ...j };
    return j;
  }
  async function updateAdminProfile(id,payload){
    const headers = {"Content-Type":"application/json"};
    if(!useCookies){
      const token = localStorage.getItem("token")||"";
      if(token) headers["Authorization"] = "Bearer "+token;
    }
    const init = {method:"PUT",headers,body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const r = await fetch(base+"/api/users/profile/admin/"+id,init);
    const j = await parse(r);
    if(!r.ok) throw { status: r.status, ...j };
    return j;
  }
  return {register,login,profile,updateProfile,updateClientProfile,updateAdminProfile};
})();