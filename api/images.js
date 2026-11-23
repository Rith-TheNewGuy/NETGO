export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
 const {prompt,size="1024x1024"}=req.body||{};if(!prompt||typeof prompt!=="string")return res.status(400).json({error:"Enter an image description"});
 const key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_IMAGE_MODEL;
 if(!key||!model)return res.status(503).json({error:"Configure OPENAI_API_KEY and OPENAI_IMAGE_MODEL in Vercel"});
 const base=(process.env.OPENAI_BASE_URL||"https://api.openai.com/v1").replace(/\/$/,"");
 const r=await fetch(base+"/images/generations",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model,prompt:prompt.slice(0,4000),size,n:1})});
 const d=await r.json();if(!r.ok)return res.status(r.status).json({error:d.error?.message||"Image provider request failed"});
 const item=d.data?.[0];if(!item)return res.status(502).json({error:"No image returned"});return res.status(200).json({url:item.url||null,b64:item.b64_json||null});
 }catch(e){return res.status(500).json({error:"Server error generating image"})}
}
