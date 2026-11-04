// Unités : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"appWrap\">\n      <div class=\"agHead\"><span class=\"label\">Convertisseur d'unités</span></div>\n      <div id=\"ucCats\" class=\"setBg\"></div>\n      <div class=\"sysCard px\"><div class=\"ucLine\"><input class=\"f\" id=\"ucVal\" value=\"1\" inputmode=\"decimal\" spellcheck=\"false\"><select class=\"f\" id=\"ucFrom\"></select><button class=\"btn px\" id=\"ucSwap\" title=\"Inverser\">⇄</button><select class=\"f\" id=\"ucTo\"></select></div>\n        <div id=\"ucResult\" class=\"sysBig\"></div><div class=\"hint\" id=\"ucNote\"></div></div>\n      <div class=\"sysCard px\"><span class=\"label\">Dans toutes les unités · clic : choisir</span><div id=\"ucAll\"></div></div>\n    </div>";
/*CSS-MOVED*/ const CSS = `.ucLine{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
#ucVal{width:180px;font-size:20px}
#ucFrom,#ucTo{flex:1;min-width:220px}
#ucSwap{height:46px;font-size:20px}
#ucResult{font-size:24px;margin-top:6px;white-space:normal;word-break:break-word}
#ucAll{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2px 20px}
.ucRow{display:flex;justify-content:space-between;gap:12px;padding:7px 4px;font-size:14px;color:var(--lilac);cursor:var(--cp,pointer);border-bottom:1px solid rgba(255,255,255,.05)}
.ucRow:hover{background:rgba(255,255,255,.05)}
.ucRow b{color:#fff;font-weight:600;text-align:right}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = ctx.host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => id === "unitsApp" ? view : view.querySelector('#' + id);  // les identifiants de ta vue, sans toucher à ceux du reste de NeoDex
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const money = s => { const v = parseFloat(String(s).replace(/[\s  €]/g, '').replace(',', '.')); return isFinite(v) ? Math.round(v * 100) / 100 : NaN; };
  // ---- ton code d'origine ----
  /* ---------- Convertisseur d'unités app: every unit as a factor of its category's base unit (temperatures and fuel use need formulas) ---------- */
  const UC = {
    'Longueur': {base: 'm', u: {'nanomètre (nm)': 1e-9, 'micromètre (µm)': 1e-6, 'millimètre (mm)': 1e-3, 'centimètre (cm)': .01, 'décimètre (dm)': .1, 'mètre (m)': 1, 'kilomètre (km)': 1000, 'pouce (in)': .0254, 'pied (ft)': .3048, 'yard (yd)': .9144, 'mile (mi)': 1609.344, 'mille marin (nmi)': 1852, 'année-lumière': 9.4607304725808e15, 'unité astronomique (ua)': 149597870700, 'parsec (pc)': 3.0856775814914e16}},
    'Masse': {u: {'milligramme (mg)': 1e-6, 'gramme (g)': 1e-3, 'kilogramme (kg)': 1, 'tonne (t)': 1000, 'once (oz)': .028349523125, 'livre (lb)': .45359237, 'stone (st)': 6.35029318, 'carat (ct)': 2e-4, 'microgramme (µg)': 1e-9, 'quintal (q)': 100}},
    'Volume': {u: {'millilitre (mL)': 1e-3, 'centilitre (cL)': .01, 'décilitre (dL)': .1, 'litre (L)': 1, 'mètre cube (m³)': 1000, 'centimètre cube (cm³)': 1e-3, 'cuillère à café': .005, 'cuillère à soupe': .015, 'tasse (US)': .2365882365, 'gallon (US)': 3.785411784, 'gallon (UK)': 4.54609, 'pinte (US)': .473176473, 'pinte (UK)': .56826125, 'once liquide (US)': .0295735295625, 'baril de pétrole': 158.987294928}},
    'Surface': {u: {'millimètre carré (mm²)': 1e-6, 'centimètre carré (cm²)': 1e-4, 'mètre carré (m²)': 1, 'are (a)': 100, 'hectare (ha)': 1e4, 'kilomètre carré (km²)': 1e6, 'pouce carré (in²)': .00064516, 'pied carré (ft²)': .09290304, 'acre': 4046.8564224, 'mile carré (mi²)': 2589988.110336}},
    'Temps': {u: {'nanoseconde (ns)': 1e-9, 'microseconde (µs)': 1e-6, 'milliseconde (ms)': 1e-3, 'seconde (s)': 1, 'minute (min)': 60, 'heure (h)': 3600, 'jour': 86400, 'semaine': 604800, 'mois (moyen)': 2629746, 'année (365 j)': 31536000, 'décennie': 315360000, 'siècle': 3153600000}},
    'Vitesse': {u: {'mètre par seconde (m/s)': 1, 'kilomètre par heure (km/h)': 1 / 3.6, 'mile par heure (mph)': .44704, 'nœud (kn)': 1852 / 3600, 'pied par seconde (ft/s)': .3048, 'Mach (au niveau de la mer)': 340.29, 'vitesse de la lumière (c)': 299792458}},
    'Température': {f: {'degré Celsius (°C)': [c => c, c => c], 'degré Fahrenheit (°F)': [f => (f - 32) * 5 / 9, c => c * 9 / 5 + 32], 'kelvin (K)': [k => k - 273.15, c => c + 273.15], 'degré Rankine (°R)': [r => (r - 491.67) * 5 / 9, c => (c + 273.15) * 9 / 5]}},
    'Pression': {u: {'pascal (Pa)': 1, 'hectopascal (hPa)': 100, 'kilopascal (kPa)': 1000, 'mégapascal (MPa)': 1e6, 'bar': 1e5, 'millibar (mbar)': 100, 'atmosphère (atm)': 101325, 'millimètre de mercure (mmHg)': 133.322387415, 'psi': 6894.757293168, 'torr': 101325 / 760}},
    'Énergie': {u: {'joule (J)': 1, 'kilojoule (kJ)': 1000, 'mégajoule (MJ)': 1e6, 'calorie (cal)': 4.184, 'kilocalorie (kcal)': 4184, 'wattheure (Wh)': 3600, 'kilowattheure (kWh)': 3.6e6, 'électronvolt (eV)': 1.602176634e-19, 'BTU': 1055.05585262, 'pied-livre (ft·lbf)': 1.3558179483314}},
    'Puissance': {u: {'watt (W)': 1, 'kilowatt (kW)': 1000, 'mégawatt (MW)': 1e6, 'cheval-vapeur (ch)': 735.49875, 'horsepower (hp)': 745.69987158227, 'BTU par heure': .29307107017, 'calorie par seconde': 4.184}},
    'Données': {u: {'bit': .125, 'octet (o)': 1, 'kilooctet (Ko, 1000)': 1e3, 'mégaoctet (Mo, 1000²)': 1e6, 'gigaoctet (Go, 1000³)': 1e9, 'téraoctet (To, 1000⁴)': 1e12, 'pétaoctet (Po)': 1e15, 'kibioctet (Kio, 1024)': 1024, 'mébioctet (Mio, 1024²)': 1048576, 'gibioctet (Gio, 1024³)': 1073741824, 'tébioctet (Tio, 1024⁴)': 1099511627776, 'kilobit (kb)': 125, 'mégabit (Mb)': 125000, 'gigabit (Gb)': 1.25e8}},
    'Débit internet': {u: {'bit par seconde (bit/s)': 1, 'kilobit par seconde (kbit/s)': 1e3, 'mégabit par seconde (Mbit/s)': 1e6, 'gigabit par seconde (Gbit/s)': 1e9, 'kilooctet par seconde (Ko/s)': 8e3, 'mégaoctet par seconde (Mo/s)': 8e6, 'gigaoctet par seconde (Go/s)': 8e9}},
    'Angle': {u: {'degré (°)': 1, 'radian (rad)': 180 / Math.PI, 'grade (gon)': .9, 'minute d\'arc (′)': 1 / 60, 'seconde d\'arc (″)': 1 / 3600, 'tour': 360, 'milliradian (mrad)': .18 / Math.PI}},
    'Fréquence': {u: {'hertz (Hz)': 1, 'kilohertz (kHz)': 1e3, 'mégahertz (MHz)': 1e6, 'gigahertz (GHz)': 1e9, 'tour par minute (tr/min)': 1 / 60}},
    'Force': {u: {'newton (N)': 1, 'kilonewton (kN)': 1000, 'dyne': 1e-5, 'kilogramme-force (kgf)': 9.80665, 'livre-force (lbf)': 4.4482216152605}},
    'Consommation': {f: {'litres aux 100 km (L/100 km)': [v => v, v => v], 'kilomètres par litre (km/L)': [v => 100 / v, v => 100 / v], 'miles par gallon US (mpg)': [v => 235.214583 / v, v => 235.214583 / v], 'miles par gallon UK (mpg UK)': [v => 282.480936 / v, v => 282.480936 / v]}},
    'Cuisine': {u: {'gramme de farine': 1 / 125, 'gramme de sucre': 1 / 200, 'gramme de beurre': 1 / 227, 'gramme de riz': 1 / 185, 'tasse (US)': 1, 'millilitre (mL)': 1 / 236.5882365, 'cuillère à soupe': 1 / 16, 'cuillère à café': 1 / 48}, note: "Les grammes dépendent de l'ingrédient : ce sont des équivalences courantes pour une tasse."},
    'Pointure': {f: {'pointure EU': [v => v, v => v], 'pointure US homme': [v => v + 33, v => v - 33], 'pointure US femme': [v => v + 31, v => v - 31], 'pointure UK': [v => v + 34, v => v - 34], 'longueur du pied (cm)': [v => (v + 1.5) * 1.5, v => v / 1.5 - 1.5]}, note: 'Équivalences approximatives : elles varient selon les marques.'},
    'Monnaies': {money: true},
  };
  let ucCat = 'Longueur', ucRates = null, ucRatesAt = '', ucRatesErr = '';
  const ucUnits = cat => cat === 'Monnaies' ? Object.keys(ucRates || {EUR: 1}) : Object.keys(UC[cat].u || UC[cat].f);
  // value in unit `a` -> unit `b`
  function ucConvert(cat, v, a, b) {
    const c = UC[cat];
    if (c.money) return v / ucRates[a] * ucRates[b];
    if (c.f) return c.f[b][1](c.f[a][0](v));
    return v * c.u[a] / c.u[b];
  }
  const ucFmt = v => !isFinite(v) ? '—' : Math.abs(v) >= 1e12 || (Math.abs(v) < 1e-6 && v) ? v.toExponential(6).replace('.', ',') : (+v.toPrecision(10)).toLocaleString('fr-FR', {maximumFractionDigits: 10});
  console.assert(ucConvert('Longueur', 1, 'kilomètre (km)', 'mètre (m)') === 1000 && Math.round(ucConvert('Température', 100, 'degré Celsius (°C)', 'degré Fahrenheit (°F)')) === 212
    && Math.abs(ucConvert('Consommation', 5, 'litres aux 100 km (L/100 km)', 'kilomètres par litre (km/L)') - 20) < 1e-9, 'ucConvert');
  const UC_NAMES = {EUR: 'Euro', USD: 'Dollar américain', GBP: 'Livre sterling', CHF: 'Franc suisse', JPY: 'Yen', CAD: 'Dollar canadien', AUD: 'Dollar australien', CNY: 'Yuan', KRW: 'Won', INR: 'Roupie indienne', BRL: 'Réal', MXN: 'Peso mexicain', SEK: 'Couronne suédoise', NOK: 'Couronne norvégienne', DKK: 'Couronne danoise', PLN: 'Zloty', CZK: 'Couronne tchèque', HUF: 'Forint', RON: 'Leu', TRY: 'Livre turque', ZAR: 'Rand', HKD: 'Dollar de Hong Kong', SGD: 'Dollar de Singapour', NZD: 'Dollar néo-zélandais', THB: 'Baht', IDR: 'Roupie indonésienne', ILS: 'Shekel', ISK: 'Couronne islandaise', MYR: 'Ringgit', PHP: 'Peso philippin', BGN: 'Lev'};
  async function ucOpen() {
    if (!ucRates) try {  // European Central Bank rates through Frankfurter (free, no account), updated every working day
      const d = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR').then(r => r.json());
      ucRates = {EUR: 1, ...d.rates}; ucRatesAt = d.date;
    } catch (e) { ucRatesErr = e.message; }
    ucRender();
  }
  function ucRender() {
    $('ucCats').replaceChildren(...Object.keys(UC).map(c => { const b = el('button', 'tab px' + (c === ucCat ? ' on' : ''), c); b.onclick = () => { ucCat = c; $('ucFrom').dataset.cat = ''; ucRender(); }; return b; }));
    const units = ucUnits(ucCat), label = u => ucCat === 'Monnaies' ? u + ' · ' + (UC_NAMES[u] || u) : u;
    if ($('ucFrom').dataset.cat !== ucCat) {
      for (const s of [$('ucFrom'), $('ucTo')]) s.replaceChildren(...units.map(u => new Option(label(u), u)));
      $('ucFrom').value = units[ucCat === 'Monnaies' ? 0 : Math.min(units.length - 1, ucCat === 'Longueur' ? 6 : 1)]; $('ucTo').value = units[ucCat === 'Monnaies' ? 1 : Math.min(units.length - 1, ucCat === 'Longueur' ? 5 : 0)] || units[0];
      $('ucFrom').dataset.cat = ucCat;
    }
    const v = money($('ucVal').value || '1'), a = $('ucFrom').value, b = $('ucTo').value;
    if (ucCat === 'Monnaies' && !ucRates) { $('ucResult').textContent = 'Taux indisponibles' + (ucRatesErr ? ' : ' + ucRatesErr : ''); $('ucAll').replaceChildren(); return; }
    $('ucResult').textContent = isNaN(v) ? '—' : ucFmt(ucConvert(ucCat, v, a, b)) + ' ' + b.replace(/^.*\((.*)\)$/, '$1');
    $('ucNote').textContent = UC[ucCat].note || (ucCat === 'Monnaies' ? 'Taux de la Banque centrale européenne du ' + new Date(ucRatesAt + 'T12:00').toLocaleDateString('fr-FR') + '.' : '');
    $('ucAll').replaceChildren(...(isNaN(v) ? [] : units.filter(u => u !== a).map(u => { const r = el('div', 'ucRow'); r.append(el('span', '', label(u)), el('b', '', ucFmt(ucConvert(ucCat, v, a, u)))); r.onclick = () => { $('ucTo').value = u; ucRender(); }; return r; })));
  }
  $('ucVal').oninput = $('ucFrom').onchange = $('ucTo').onchange = ucRender;
  $('ucSwap').onclick = () => { const a = $('ucFrom').value; $('ucFrom').value = $('ucTo').value; $('ucTo').value = a; ucRender(); };
  // ---- fin ----
  ctx.onOpen(() => { ucOpen(); });
}
