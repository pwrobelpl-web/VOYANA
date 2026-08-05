
import {AIRPORT_GROUPS,AIRPORT_NAMES,DESTINATIONS,MONTHS} from "./data.js";
import {LANG} from "./languages.js";
import {smartCompare} from "./api.js";

const $=id=>document.getElementById(id);
let lang=localStorage.getItem("voyanaLang") || "pl";
let parsedQuery=null;

function normalise(text){
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function iso(date){return date.toISOString().slice(0,10)}

function applyLanguage(){
  const t=LANG[lang];
  $("tagline").textContent=t.tagline;
  $("promptLabel").textContent=t.prompt;
  $("query").placeholder=t.placeholder;
  $("analyse").textContent=t.analyse;
  $("compare").textContent=t.compare;
  $("startLabel").textContent=t.start;
  $("destinationLabel").textContent=t.destination;
  $("departLabel").textContent=t.depart;
  $("returnLabel").textContent=t.ret;
  $("adultsLabel").textContent=t.adults;
  $("cabinLabel").textContent=t.cabin;
  $("parsedTitle").textContent=t.parsed;
  document.querySelectorAll("[data-lang]").forEach(
    b=>b.classList.toggle("active",b.dataset.lang===lang)
  );
}

function parseNaturalLanguage(text){
  const raw=text.trim();
  const lower=normalise(raw);

  let destination=null;
  for(const item of DESTINATIONS){
    if(item.keys.some(key=>lower.includes(normalise(key)))){
      destination=item;
      break;
    }
  }

  let monthIndex=null;
  let monthName=null;
  for(const [name,index] of Object.entries(MONTHS)){
    if(lower.includes(normalise(name))){
      monthIndex=index;
      monthName=name;
      break;
    }
  }

  let days=null;
  const dayMatch=lower.match(/(\d{1,3})\s*(dni|dzien|dnia|days?|dias?)/);
  if(dayMatch) days=Number(dayMatch[1]);
  else if(lower.includes("dwa tygodnie") || lower.includes("two weeks")) days=14;
  else if(lower.includes("tydzien") || lower.includes("one week")) days=7;

  let budget=null;
  const budgetMatch=raw.match(/(?:£|gbp\s*)(\d+(?:[.,]\d+)?)/i) ||
                    raw.match(/(?:do|under|hasta)\s*£?\s*(\d+(?:[.,]\d+)?)/i);
  if(budgetMatch) budget=Number(String(budgetMatch[1]).replace(",","."));

  const peopleMatch=lower.match(/(\d+)\s*(osoby|osob|people|personas)/);
  const adults=peopleMatch ? Math.max(1,Number(peopleMatch[1])) : 1;

  let departDate=new Date();
  departDate.setDate(departDate.getDate()+30);

  if(monthIndex!==null){
    const now=new Date();
    let year=now.getFullYear();
    if(monthIndex<now.getMonth() || (monthIndex===now.getMonth() && now.getDate()>15)) year++;
    departDate=new Date(year,monthIndex,8);
  }

  const returnDate=new Date(departDate);
  returnDate.setDate(returnDate.getDate()+(days || 10));

  return{
    destination,
    monthIndex,
    monthName,
    days,
    budget,
    adults,
    departure_date:iso(departDate),
    return_date:iso(returnDate)
  };
}

function showParsed(data){
  const t=LANG[lang];
  $("parsedDestination").textContent=data.destination?.name || t.notProvided;
  $("parsedDays").textContent=data.days ? `${data.days}` : t.notProvided;
  $("parsedMonth").textContent=data.monthName || t.notProvided;
  $("parsedBudget").textContent=data.budget ? `£${data.budget}` : t.notProvided;
  $("parsedAdults").textContent=data.adults;
  $("parsedCard").classList.remove("hidden");

  if(data.destination){
    $("destination").value=data.destination.defaultAirport;
  }
  $("depart").value=data.departure_date;
  $("returnDate").value=data.return_date;
  $("adults").value=data.adults;
}

function formatDate(value){
  if(!value) return "—";
  return new Date(value).toLocaleString(
    lang==="pl"?"pl-PL":lang==="es"?"es-ES":"en-GB",
    {dateStyle:"medium",timeStyle:"short"}
  );
}

function renderResults(data){
  const t=LANG[lang];
  const box=$("results");
  box.innerHTML="";

  const rows=(data.cheapest_by_airport||[])
    .filter(x=>x.cheapest_offer)
    .sort((a,b)=>a.cheapest_offer.total_amount-b.cheapest_offer.total_amount);

  if(!rows.length){
    box.innerHTML=`<div class="card">${t.noOffers}</div>`;
    return;
  }

  rows.forEach((row,index)=>{
    const offer=row.cheapest_offer;
    const card=document.createElement("div");
    card.className="result-card"+(index===0?" best":"");

    let details="";
    for(const slice of offer.slices||[]){
      let segments="";
      for(const seg of slice.segments||[]){
        segments+=`<div class="segment">
          <b>${seg.origin} → ${seg.destination}</b><br>
          ${formatDate(seg.departing_at)} – ${formatDate(seg.arriving_at)}<br>
          <span class="small">${seg.marketing_carrier||""} ${seg.flight_number||""}</span>
          ${seg.layover_airport?`<div class="layover">⏳ ${seg.layover_airport}: ${seg.layover_after||"—"}</div>`:""}
        </div>`;
      }
      details+=`<div class="segment">
        <b>${slice.origin} → ${slice.destination}</b><br>
        <span class="small">${slice.connections||0} connections • ${slice.elapsed_duration||""}</span>
      </div>${segments}`;
    }

    const score=Math.max(50,100-index*8);
    card.innerHTML=`
      <div class="result-head">
        <div>
          <h3>${index===0?"⭐ Best choice":"✈️ "+(AIRPORT_NAMES[row.origin]||row.origin)}</h3>
          <span class="badge">${row.origin}</span>
          <span class="badge">${offer.airline||""}</span>
          <div class="price">${offer.total_currency} ${Number(offer.total_amount).toFixed(2)}</div>
          <div class="score">${score}/100</div>
          <div class="small">${t.tap}</div>
        </div>
      </div>
      <div class="details">${details}</div>`;
    card.onclick=()=>card.classList.toggle("open");
    box.appendChild(card);
  });
}

document.querySelectorAll("[data-lang]").forEach(button=>{
  button.onclick=()=>{
    lang=button.dataset.lang;
    localStorage.setItem("voyanaLang",lang);
    applyLanguage();
  };
});

document.querySelectorAll(".chip").forEach(chip=>{
  chip.onclick=()=>{$("query").value=chip.dataset.example};
});

$("analyse").onclick=()=>{
  const query=$("query").value.trim();
  if(!query) return;
  parsedQuery=parseNaturalLanguage(query);
  showParsed(parsedQuery);
};

$("compare").onclick=async()=>{
  const t=LANG[lang];

  if(!parsedQuery){
    parsedQuery=parseNaturalLanguage($("query").value);
    showParsed(parsedQuery);
  }

  $("error").classList.add("hidden");
  $("notice").classList.add("hidden");
  $("results").innerHTML="";
  $("status").textContent=t.loading;
  $("status").classList.remove("hidden");
  $("compare").disabled=true;

  try{
    const data=await smartCompare({
      origins:AIRPORT_GROUPS[$("home").value],
      destination:$("destination").value,
      departure_date:$("depart").value,
      return_date:$("returnDate").value || null,
      adults:Number($("adults").value)||1,
      cabin_class:$("cabin").value
    });

    $("status").textContent=`${t.found} ${data.cheapest_by_airport?.length||0} ${t.offers}.`;
    if(data.test_mode){
      $("notice").textContent=t.test;
      $("notice").classList.remove("hidden");
    }
    renderResults(data);
  }catch(error){
    $("status").classList.add("hidden");
    $("error").textContent=`${t.error}: ${error.message}`;
    $("error").classList.remove("hidden");
  }finally{
    $("compare").disabled=false;
  }
};

const initialDeparture=new Date();
initialDeparture.setDate(initialDeparture.getDate()+30);
const initialReturn=new Date(initialDeparture);
initialReturn.setDate(initialReturn.getDate()+10);
$("depart").value=iso(initialDeparture);
$("returnDate").value=iso(initialReturn);

applyLanguage();

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}
