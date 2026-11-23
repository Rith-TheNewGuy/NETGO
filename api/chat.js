export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
 const {messages,provider="cloud",model}=req.body||{};
 if(!Array.isArray(messages)||!messages.length)return res.status(400).json({error:"Add a message first."});
 const msgs=messages.slice(-20).map(m=>({role:m.role==="assistant"?"assistant":"user",content:String(m.content||"").slice(0,8000)}));
 if(provider==="ollama"){
  const base=process.env.OLLAMA_BASE_URL,chosen=model||process.env.OLLAMA_MODEL;
  if(!base||!chosen)return res.status(503).json({error:"Set OLLAMA_BASE_URL and OLLAMA_MODEL in Vercel. Your local phone/computer is not automatically reachable."});
  const r=await fetch(base.replace(/\/$/,"")+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:chosen,messages:msgs,stream:false})});
  const d=await r.json();if(!r.ok)return res.status(r.status).json({error:d.error||"Ollama request failed"});return res.status(200).json({reply:d.message?.content||"No response"});
 }
 const key=process.env.OPENAI_API_KEY,chosen=model||process.env.OPENAI_CHAT_MODEL;
 if(!key||!chosen)return res.status(503).json({error:"Configure OPENAI_API_KEY and OPENAI_CHAT_MODEL in Vercel environment variables."});
 const base=(process.env.OPENAI_BASE_URL||"https://api.openai.com/v1").replace(/\/$/,"");
 const r=await fetch(base+"/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:chosen,messages:msgs})});
 const d=await r.json();if(!r.ok)return res.status(r.status).json({error:d.error?.message||"AI provider request failed"});return res.status(200).json({reply:d.choices?.[0]?.message?.content||"No response"});
 }catch(e){return res.status(500).json({error:"Server error contacting AI provider"})}
}
