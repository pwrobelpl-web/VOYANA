const translations={
  pl:{
    subtitle:'Planuj podróż, nie tylko lot.',
    home:'Miasto startowe',
    destination:'Dokąd chcesz lecieć?',
    departure:'Data wylotu',
    return:'Data powrotu',
    adults:'Dorośli',
    cabin:'Klasa',
    compare:'Porównaj lotniska',
    loading:'Voyana porównuje lotniska i analizuje przesiadki…',
    noOffers:'Brak ofert dla wybranych parametrów.',
    compared:'Porównano',
    airports:'lotnisk.',
    checked:'lotnisk sprawdzonych',
    withOffers:'lotnisk z ofertami',
    bestOffers:'najtańszych ofert',
    cheapest:'Najtańsza opcja',
    tap:'Kliknij, aby zobaczyć pełną trasę i przesiadki.',
    save:'Zapisz ofertę',
    buy:'Kup bilet',
    buyDisabled:'Kupno niedostępne w Test Mode',
    direct:'Lot bezpośredni',
    connection:'1 przesiadka',
    connections:'przesiadki',
    outbound:'Wylot',
    inbound:'Powrót',
    transfer:'Przesiadka na',
    testMode:'Tryb testowy: wyniki mogą nie odzwierciedlać rzeczywistych rozkładów.',
    testNote:'Wyniki pochodzą z Duffel Test Mode. Trasy, ceny i linie mogą być testowe.'
  },
  en:{
    subtitle:'Plan the journey, not just the flight.',
    home:'Home city',
    destination:'Where do you want to fly?',
    departure:'Departure date',
    return:'Return date',
    adults:'Adults',
    cabin:'Cabin class',
    compare:'Compare airports',
    loading:'Voyana is comparing airports and connections…',
    noOffers:'No offers found for these parameters.',
    compared:'Compared',
    airports:'airports.',
    checked:'airports checked',
    withOffers:'airports with offers',
    bestOffers:'best offers',
    cheapest:'Cheapest option',
    tap:'Tap to view the full route and connections.',
    save:'Save offer',
    buy:'Buy ticket',
    buyDisabled:'Buying unavailable in Test Mode',
    direct:'Direct flight',
    connection:'1 connection',
    connections:'connections',
    outbound:'Outbound',
    inbound:'Return',
    transfer:'Connection at',
    testMode:'Test mode: results may not reflect real schedules.',
    testNote:'Results come from Duffel Test Mode. Routes, prices and airlines may be test data.'
  },
  es:{
    subtitle:'Planifica el viaje, no solo el vuelo.',
    home:'Ciudad de origen',
    destination:'¿A dónde quieres volar?',
    departure:'Fecha de salida',
    return:'Fecha de regreso',
    adults:'Adultos',
    cabin:'Clase',
    compare:'Comparar aeropuertos',
    loading:'Voyana está comparando aeropuertos y conexiones…',
    noOffers:'No se encontraron ofertas.',
    compared:'Comparados',
    airports:'aeropuertos.',
    checked:'aeropuertos revisados',
    withOffers:'aeropuertos con ofertas',
    bestOffers:'mejores ofertas',
    cheapest:'Opción más barata',
    tap:'Pulsa para ver la ruta completa y las conexiones.',
    save:'Guardar oferta',
    buy:'Comprar billete',
    buyDisabled:'Compra no disponible en modo de prueba',
    direct:'Vuelo directo',
    connection:'1 escala',
    connections:'escalas',
    outbound:'Ida',
    inbound:'Vuelta',
    transfer:'Escala en',
    testMode:'Modo de prueba: los resultados pueden no reflejar horarios reales.',
    testNote:'Los resultados proceden del modo de prueba de Duffel.'
  }
};

let current=localStorage.getItem('voyanaLang')||'pl';

export function getLanguage(){return current}
export function t(key){return translations[current]?.[key]||translations.en[key]||key}

export function setLanguage(lang){
  current=translations[lang]?lang:'en';
  localStorage.setItem('voyanaLang',current);
  document.documentElement.lang=current;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent=t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-lang]').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.lang===current);
  });
}
