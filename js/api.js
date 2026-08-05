import {API_URL} from './data.js';

export async function smartCompare(payload){
  const response=await fetch(API_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const data=await response.json();
  if(!response.ok){
    throw new Error(data.error||data.message||'API error');
  }
  return data;
}
