import {airportGroups,destinations} from './data.js';
import {setLanguage,getLanguage,t} from './i18n.js';
import {$,iso} from './utils.js';
import {smartCompare} from './api.js';
import {renderResults} from './render.js';

function initDestinations(){
  $('destination').innerHTML=destinations
    .map(([code,name])=>`<option value="${code}">${name}</option>`)
    .join('');
}

function initDates(){
  const depart=new Date();
  depart.setDate(depart.getDate()+30);
  const ret=new Date(depart);
  ret.setDate(ret.getDate()+10);
  $('depart').value=iso(depart);
  $('returnDate').value=iso(ret);
}

document.querySelectorAll('[data-lang]').forEach(button=>{
  button.addEventListener('click',()=>setLanguage(button.dataset.lang));
});

$('compare').addEventListener('click',async()=>{
  $('error').classList.add('hidden');
  $('notice').classList.add('hidden');
  $('recommendation').classList.add('hidden');
  $('summary').classList.add('hidden');
  $('results').innerHTML='';
  $('status').textContent=t('loading');
  $('status').classList.remove('hidden');
  $('compare').disabled=true;

  try{
    const data=await smartCompare({
      origins:airportGroups[$('home').value],
      destination:$('destination').value,
      departure_date:$('depart').value,
      return_date:$('returnDate').value||null,
      adults:Number($('adults').value)||1,
      cabin_class:$('cabin').value
    });

    $('status').textContent=`${t('compared')} ${data.compared_airports||0} ${t('airports')}`;
    if(data.test_mode){
      $('notice').textContent=t('testMode');
      $('notice').classList.remove('hidden');
    }
    renderResults(data);
  }catch(error){
    $('status').classList.add('hidden');
    $('error').textContent=error.message;
    $('error').classList.remove('hidden');
  }finally{
    $('compare').disabled=false;
  }
});

initDestinations();
initDates();
setLanguage(getLanguage());

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js');
}
