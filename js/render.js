import {airportNames} from './data.js';
import {t} from './i18n.js';
import {formatDate,formatMoney,$} from './utils.js';

function connectionLabel(count){
  if(count===0) return t('direct');
  if(count===1) return t('connection');
  return `${count} ${t('connections')}`;
}

function renderSegments(slice){
  return (slice.segments||[]).map(segment=>`
    <div class="segment">
      <div class="route">${segment.origin} → ${segment.destination}</div>
      <div>${formatDate(segment.departing_at)}<br>${formatDate(segment.arriving_at)}</div>
      <div class="small">
        ${segment.marketing_carrier||''}
        ${segment.flight_number?' • '+segment.flight_number:''}
        ${segment.aircraft?' • '+segment.aircraft:''}
      </div>
      ${segment.operating_carrier && segment.operating_carrier!==segment.marketing_carrier
        ? `<div class="small">Operated by: ${segment.operating_carrier}</div>`
        : ''}
      ${segment.layover_airport
        ? `<div class="layover">⏳ ${t('transfer')} ${segment.layover_airport}: ${segment.layover_after||'—'}</div>`
        : ''}
    </div>`).join('');
}

function renderSlice(slice,index){
  const airports=(slice.connection_airports||[])
    .map(item=>`${item.airport} (${item.duration||'—'})`)
    .join(', ');

  return `
    <div class="slice">
      <b>${index===0?t('outbound'):t('inbound')}: ${slice.origin} → ${slice.destination}</b>
      <div class="small">${connectionLabel(slice.connections)}${slice.elapsed_duration?' • '+slice.elapsed_duration:''}</div>
      ${airports?`<div class="layover">${airports}</div>`:''}
      ${renderSegments(slice)}
    </div>`;
}

export function renderResults(data){
  const results=$('results');
  results.innerHTML='';

  const rows=(data.cheapest_by_airport||[])
    .filter(row=>row.cheapest_offer)
    .sort((a,b)=>a.cheapest_offer.total_amount-b.cheapest_offer.total_amount);

  if(!rows.length){
    results.innerHTML=`<div class="card">${t('noOffers')}</div>`;
    return;
  }

  const best=rows[0];
  $('recommendation').textContent=
    `${t('cheapest')}: ${airportNames[best.origin]||best.origin} — `+
    formatMoney(best.cheapest_offer.total_currency,best.cheapest_offer.total_amount);
  $('recommendation').classList.remove('hidden');

  $('summary').innerHTML=`
    <div class="summary">
      <div class="stat"><b>${data.compared_airports||0}</b><span>${t('checked')}</span></div>
      <div class="stat"><b>${data.successful_airports||0}</b><span>${t('withOffers')}</span></div>
      <div class="stat"><b>${rows.length}</b><span>${t('bestOffers')}</span></div>
    </div>`;
  $('summary').classList.remove('hidden');

  rows.forEach((row,index)=>{
    const offer=row.cheapest_offer;
    const totalConnections=(offer.slices||[]).reduce((sum,s)=>sum+(s.connections||0),0);
    const card=document.createElement('div');
    card.className='airport-card'+(index===0?' best':'');
    card.tabIndex=0;

    card.innerHTML=`
      <div class="offer-head">
        <div>
          <div class="airport-name">${index===0?'⭐ '+t('cheapest')+' — ':''}${airportNames[row.origin]||row.origin}</div>
          <span class="badge">${row.origin}</span>
          <span class="badge">${offer.airline||''}</span>
          <span class="badge ${totalConnections===0?'green':'amber'}">${connectionLabel(totalConnections)}</span>
          <div class="price">${formatMoney(offer.total_currency,offer.total_amount)}</div>
          <div class="small">${t('tap')}</div>
        </div>
        <div class="chevron">⌄</div>
      </div>
      <div class="details">
        ${(offer.slices||[]).map(renderSlice).join('')}
        <div class="actions">
          <button class="buy ${offer.booking_available?'':'disabled'}" ${offer.booking_available?'':'disabled'}>
            ${offer.booking_available?t('buy'):t('buyDisabled')}
          </button>
          <button class="save-btn">${t('save')}</button>
        </div>
      </div>`;

    card.addEventListener('click',event=>{
      if(event.target.closest('button')) return;
      card.classList.toggle('open');
    });

    card.querySelector('.save-btn').addEventListener('click',event=>{
      event.stopPropagation();
      const saved=JSON.parse(localStorage.getItem('voyanaSavedOffers')||'[]');
      saved.unshift({
        origin:row.origin,
        destination:$('destination').value,
        airline:offer.airline,
        amount:offer.total_amount,
        currency:offer.total_currency,
        saved_at:new Date().toISOString()
      });
      localStorage.setItem('voyanaSavedOffers',JSON.stringify(saved.slice(0,20)));
      alert(t('save'));
    });

    results.appendChild(card);
  });
}
