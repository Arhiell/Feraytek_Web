window.AuthController = (function(){
  function getBase(){
    const cfg = (typeof window!=="undefined" && window.Feraytek && window.Feraytek.API) || {};
    return cfg.base || "/api";
  }
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
  async function tryFetch(urls, init){
    for(const u of urls){
      const r = await fetch(u, init);
      const j = await parse(r);
      if(r.ok) return j;
      if(r.status!==404) throw { status:r.status, ...j };
    }
    throw { status:404, message:"Endpoint no disponible" };
  }
  async function register(payload){
    const init = {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const base = getBase();
    const urls = [base+"/users/register", base+"/auth/register"];
    return await tryFetch(urls, init);
  }
  async function login(payload){
    const init = {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const base = getBase();
    const urls = [base+"/users/login", base+"/auth/login"];
    const j = await tryFetch(urls, init);
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
    const base = getBase();
    const urls = [base+"/users/profile", base+"/auth/me"];
    return await tryFetch(urls, init);
  }
  async function updateProfile(payload){
    const headers = {"Content-Type":"application/json"};
    if(!useCookies){
      const token = localStorage.getItem("token")||"";
      if(token) headers["Authorization"] = "Bearer "+token;
    }
    const init = {method:"PUT",headers,body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const base = getBase();
    const urls = [base+"/users/profile", base+"/auth/me"];
    return await tryFetch(urls, init);
  }
  async function updateClientProfile(id,payload){
    const headers = {"Content-Type":"application/json"};
    if(!useCookies){
      const token = localStorage.getItem("token")||"";
      if(token) headers["Authorization"] = "Bearer "+token;
    }
    const init = {method:"PUT",headers,body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const base = getBase();
    const urls = [base+"/users/profile/cliente/"+id];
    return await tryFetch(urls, init);
  }
  async function updateAdminProfile(id,payload){
    const headers = {"Content-Type":"application/json"};
    if(!useCookies){
      const token = localStorage.getItem("token")||"";
      if(token) headers["Authorization"] = "Bearer "+token;
    }
    const init = {method:"PUT",headers,body:JSON.stringify(payload)};
    if(useCookies) init.credentials = "include"; else init.credentials = "omit";
    const base = getBase();
    const urls = [base+"/users/profile/admin/"+id];
    return await tryFetch(urls, init);
  }
  return {register,login,profile,updateProfile,updateClientProfile,updateAdminProfile};
})();