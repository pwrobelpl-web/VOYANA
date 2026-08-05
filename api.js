
const API_BASE = "https://voyana-api.fcczaplin.workers.dev";

export async function smartCompare(payload){
  const response = await fetch(`${API_BASE}/smart-compare`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  });

  const data = await response.json();
  if(!response.ok){
    throw new Error(data.error || data.message || "Voyana API error");
  }
  return data;
}
