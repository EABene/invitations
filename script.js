/* =========================================================
   date-frage – Verhalten / Logik
   Gliederung:
     0) Einstellungen (deine WhatsApp-Nummer)
     1) Hintergrund-Herzen
     2) Herz-Konfetti
     3) Der ausweichende "Nein"-Knopf
     4) Bildschirm-Wechsel (welcher Screen ist sichtbar)
     5) Ablauf: Ja -> Tätigkeit -> (Essen?) -> Kalender -> Bestätigung
     6) Kalender-Logik
     7) Abschluss: Zusammenfassung + Kopieren/Teilen
   ========================================================= */


/* ---------------------------------------------------------
   0) Einstellungen
   Trag hier deine WhatsApp-Nummer ein, dann geht der
   "Per WhatsApp schicken"-Button direkt an dich.
   Format: Ländervorwahl ohne + und ohne Leerzeichen,
   z.B. Österreich: '4366012345678'.
   Leer lassen -> WhatsApp fragt, an wen gesendet werden soll.
   --------------------------------------------------------- */
const MEIN_WHATSAPP = '';


/* ---------------------------------------------------------
   1) Hintergrund-Herzen
   --------------------------------------------------------- */
const bgHearts = document.getElementById('bgHearts');
const fxLayer  = document.getElementById('fx') || document.body;   // Ebene fürs Konfetti

const heartPath = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
const heartColors = ['#c0566e', '#cf9a4e', '#d98aa0'];

function heartMarkup(color, filled){
  return filled
    ? `<svg width="26" height="26" viewBox="0 0 24 24" fill="${color}"><path d="${heartPath}"/></svg>`
    : `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6"><path d="${heartPath}"/></svg>`;
}

for(let i = 0; i < 16; i++){
  const h = document.createElement('div');
  h.className = 'floaty';
  const color = heartColors[Math.floor(Math.random() * heartColors.length)];
  h.innerHTML = heartMarkup(color, Math.random() < 0.45);
  h.style.left = Math.random() * 100 + 'vw';
  h.style.transform = `scale(${0.6 + Math.random() * 1.5})`;
  h.style.opacity = (0.14 + Math.random() * 0.16).toFixed(2);
  h.style.animationDuration = (10 + Math.random() * 11) + 's';
  h.style.animationDelay = (-Math.random() * 18) + 's';
  bgHearts.appendChild(h);
}


/* ---------------------------------------------------------
   2) Herz-Konfetti
   --------------------------------------------------------- */
function burst(x, y){
  const cx = x ?? window.innerWidth / 2;
  const cy = y ?? window.innerHeight * 0.42;

  for(let i = 0; i < 28; i++){
    const el = document.createElement('div');
    el.className = 'confetti';
    const color = heartColors[i % heartColors.length];
    const size = 12 + Math.random() * 14;
    el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="${heartPath}"/></svg>`;
    el.style.left = cx + 'px';
    el.style.top  = cy + 'px';
    fxLayer.appendChild(el);

    const ang  = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 190;
    const dx   = Math.cos(ang) * dist;
    const dy   = Math.sin(ang) * dist - 50;
    const rot  = Math.random() * 720 - 360;
    const dur  = 900 + Math.random() * 900;

    el.animate([
      { transform:'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity:1 },
      { transform:`translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 170}px)) scale(1) rotate(${rot}deg)`, opacity:0 }
    ], { duration:dur, easing:'cubic-bezier(.2,.6,.3,1)' });

    setTimeout(() => el.remove(), dur + 60);
  }
}


/* ---------------------------------------------------------
   3) Der ausweichende "Nein"-Knopf
   --------------------------------------------------------- */
const noBtn  = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const btnRow = yesBtn.parentElement;

let dodgeCount = 0;
let isFixed = false;
let noPlaceholder = null;

function resetNoBtn(){
  noBtn.style.position = '';
  noBtn.style.left = '';
  noBtn.style.top = '';
  noBtn.style.margin = '';
  noBtn.style.zIndex = '';
  noBtn.style.transition = '';
  if(noPlaceholder){ noPlaceholder.remove(); noPlaceholder = null; }
  if(noBtn.parentElement !== btnRow) btnRow.appendChild(noBtn);
  isFixed = false;
}

function flee(){
  const w = noBtn.offsetWidth;
  const h = noBtn.offsetHeight;

  if(!isFixed){
    const r = noBtn.getBoundingClientRect();

    noPlaceholder = document.createElement('span');
    noPlaceholder.style.display = 'inline-block';
    noPlaceholder.style.width  = w + 'px';
    noPlaceholder.style.height = h + 'px';
    btnRow.insertBefore(noPlaceholder, noBtn);

    noBtn.style.transition = 'none';
    noBtn.style.position = 'fixed';
    noBtn.style.margin = '0';
    noBtn.style.zIndex = '9999';
    noBtn.style.left = r.left + 'px';
    noBtn.style.top  = r.top + 'px';
    document.body.appendChild(noBtn);
    noBtn.getBoundingClientRect();
    noBtn.style.transition = '';
    isFixed = true;
  }

  const pad = 16;
  const x = pad + Math.random() * Math.max(0, window.innerWidth  - w - pad - pad);
  const y = pad + Math.random() * Math.max(0, window.innerHeight - h - pad - pad);
  noBtn.style.left = x + 'px';
  noBtn.style.top  = y + 'px';

  dodgeCount++;
  yesBtn.style.transform = `scale(${Math.min(1 + dodgeCount * 0.05, 1.25)})`;
}

noBtn.addEventListener('mouseenter', flee);
noBtn.addEventListener('mousedown',  e => { e.preventDefault(); flee(); });
noBtn.addEventListener('touchstart', e => { e.preventDefault(); flee(); }, { passive:false });


/* ---------------------------------------------------------
   4) Bildschirm-Wechsel
   --------------------------------------------------------- */
function show(id){
  ['ask', 'choose', 'food', 'cal', 'done'].forEach(s => document.getElementById(s).classList.add('hidden'));
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  el.classList.remove('fade-in');
  void el.offsetWidth;
  el.classList.add('fade-in');
}


/* ---------------------------------------------------------
   5) Ablauf
   Was die Userin wählt, merken wir uns in diesen Variablen:
     chosenLabel  = z.B. "Kaffee" oder "Essen gehen"
     chosenDetail = nur bei Essen: die Richtung, z.B. "Italienisch"
   --------------------------------------------------------- */
let chosenLabel  = '';
let chosenDetail = '';

// "Ja" gedrückt -> Konfetti + weiter zur Tätigkeits-Auswahl
yesBtn.addEventListener('click', () => {
  const r = yesBtn.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2);
  resetNoBtn();
  show('choose');
});

// Tätigkeit gewählt
document.querySelectorAll('#choose .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chosenLabel  = chip.textContent.trim();
    chosenDetail = '';
    // Bei "Essen gehen" (data-sub="food") kommt erst die Richtungs-Auswahl
    if(chip.dataset.sub === 'food'){
      show('food');
    } else {
      buildCalendar();
      show('cal');
    }
  });
});

// Essens-Richtung gewählt -> weiter zum Kalender
document.querySelectorAll('#food .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chosenDetail = chip.dataset.food;
    buildCalendar();
    show('cal');
  });
});

// "Das passt" -> mit gewähltem Datum abschließen
document.getElementById('confirmDate').addEventListener('click', () => finish(selected));

// "Egal wann" -> ohne festes Datum abschließen
document.getElementById('anytimeBtn').addEventListener('click', () => finish(null));

// Neustart
document.getElementById('restart').addEventListener('click', () => {
  dodgeCount = 0;
  yesBtn.style.transform = '';
  resetNoBtn();
  chosenLabel = '';
  chosenDetail = '';
  viewY = today.getFullYear();
  viewM = today.getMonth();
  selected = new Date(today);
  show('ask');
});


/* ---------------------------------------------------------
   6) Kalender-Logik
   --------------------------------------------------------- */
const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const dows = ['Mo','Di','Mi','Do','Fr','Sa','So'];

const calTitle = document.getElementById('calTitle');
const calDays  = document.getElementById('calDays');
const calDow   = document.getElementById('calDow');
const prevM = document.getElementById('prevM');
const nextM = document.getElementById('nextM');

const today = new Date();
today.setHours(0, 0, 0, 0);

let viewY = today.getFullYear();
let viewM = today.getMonth();
let selected = new Date(today);

dows.forEach(d => {
  const c = document.createElement('div');
  c.className = 'dow';
  c.textContent = d;
  calDow.appendChild(c);
});

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth() &&
  a.getDate()     === b.getDate();

function buildCalendar(){
  calTitle.textContent = monthNames[viewM] + ' ' + viewY;
  calDays.innerHTML = '';

  const first = new Date(viewY, viewM, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();

  for(let i = 0; i < offset; i++){
    const b = document.createElement('div');
    b.className = 'day blank';
    calDays.appendChild(b);
  }

  for(let d = 1; d <= daysInMonth; d++){
    const cur = new Date(viewY, viewM, d);
    const cell = document.createElement('button');
    cell.className = 'day';
    cell.textContent = d;

    if(cur < today){ cell.classList.add('disabled'); cell.disabled = true; }
    if(sameDay(cur, today))    cell.classList.add('today');
    if(sameDay(cur, selected)) cell.classList.add('selected');

    cell.addEventListener('click', () => { selected = cur; buildCalendar(); });
    calDays.appendChild(cell);
  }

  prevM.disabled = (viewY === today.getFullYear() && viewM === today.getMonth());
}

prevM.addEventListener('click', () => { if(viewM === 0){ viewM = 11; viewY--; } else viewM--; buildCalendar(); });
nextM.addEventListener('click', () => { if(viewM === 11){ viewM = 0;  viewY++; } else viewM++; buildCalendar(); });


/* ---------------------------------------------------------
   7) Abschluss: Zusammenfassung + Kopieren/Teilen
   --------------------------------------------------------- */
const summary  = document.getElementById('summary');
const doneText = document.getElementById('doneText');
const copyBtn  = document.getElementById('copyBtn');
const waBtn    = document.getElementById('waBtn');

let shareText = '';   // der Text, der kopiert / geteilt wird

// date = Date-Objekt für ein festes Datum, oder null für "jederzeit"
function finish(date){
  const anytime = !date;

  // Aktivität (ggf. mit Essens-Richtung)
  let activityDisplay = chosenLabel;
  if(chosenDetail) activityDisplay += ` (${chosenDetail})`;

  // Wann
  let whenDisplay;
  if(anytime){
    whenDisplay = 'Jederzeit – passt schon';
  } else {
    const ds = date.toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    whenDisplay = sameDay(date, today) ? `Heute (${ds})` : ds;
  }

  // Zusammenfassung als zwei Zeilen aufbauen
  summary.innerHTML =
    `<div class="sum-row"><span class="sum-label">Aktivität</span><span class="sum-val">${activityDisplay}</span></div>` +
    `<div class="sum-row"><span class="sum-label">Wann</span><span class="sum-val">${whenDisplay}</span></div>`;

  doneText.textContent = 'Ich freu mich auf dich.';

  // Text zum Kopieren / Teilen
  shareText =
    `Ja, ich gehe mit dir aus!\n` +
    `Aktivität: ${activityDisplay}\n` +
    `Wann: ${whenDisplay}`;

  show('done');
  burst();
  setTimeout(() => burst(window.innerWidth * 0.5, window.innerHeight * 0.38), 250);
}

// Text in die Zwischenablage kopieren (mit Fallback für lokale Dateien)
async function copyText(text){
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      return true;
    }
  }catch(e){ /* unten weiterversuchen */ }

  try{
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }catch(e){
    return false;
  }
}

copyBtn.addEventListener('click', async () => {
  const ok = await copyText(shareText);
  copyBtn.textContent = ok ? 'Kopiert!' : 'Bitte manuell markieren';
  setTimeout(() => { copyBtn.textContent = 'Infos kopieren'; }, 1800);
});

waBtn.addEventListener('click', () => {
  const base = MEIN_WHATSAPP ? `https://wa.me/${MEIN_WHATSAPP}` : 'https://wa.me/';
  window.open(`${base}?text=${encodeURIComponent(shareText)}`, '_blank');
});
