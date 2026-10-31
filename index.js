// Convertisseur d'unités, plugin NeoBase autonome (permission « network » pour les taux de change).
const UC = {
  'Longueur': {u: {'nanomètre (nm)': 1e-9, 'micromètre (µm)': 1e-6, 'millimètre (mm)': 1e-3, 'centimètre (cm)': .01, 'décimètre (dm)': .1, 'mètre (m)': 1, 'kilomètre (km)': 1000, 'pouce (in)': .0254, 'pied (ft)': .3048, 'yard (yd)': .9144, 'mile (mi)': 1609.344, 'mille marin (nmi)': 1852, 'année-lumière': 9.4607304725808e15, 'unité astronomique (ua)': 149597870700, 'parsec (pc)': 3.0856775814914e16}},
  'Masse': {u: {'milligramme (mg)': 1e-6, 'gramme (g)': 1e-3, 'kilogramme (kg)': 1, 'tonne (t)': 1000, 'once (oz)': .028349523125, 'livre (lb)': .45359237, 'stone (st)': 6.35029318, 'carat (ct)': 2e-4, 'microgramme (µg)': 1e-9, 'quintal (q)': 100}},
  'Volume': {u: {'millilitre (mL)': 1e-3, 'centilitre (cL)': .01, 'décilitre (dL)': .1, 'litre (L)': 1, 'mètre cube (m³)': 1000, 'centimètre cube (cm³)': 1e-3, 'cuillère à café': .005, 'cuillère à soupe': .015, 'tasse (US)': .2365882365, 'gallon (US)': 3.785411784, 'gallon (UK)': 4.54609, 'pinte (US)': .473176473, 'once liquide (US)': .0295735295625, 'baril de pétrole': 158.987294928}},
  'Surface': {u: {'millimètre carré (mm²)': 1e-6, 'centimètre carré (cm²)': 1e-4, 'mètre carré (m²)': 1, 'are (a)': 100, 'hectare (ha)': 1e4, 'kilomètre carré (km²)': 1e6, 'pied carré (ft²)': .09290304, 'acre': 4046.8564224, 'mile carré (mi²)': 2589988.110336}},
  'Temps': {u: {'milliseconde (ms)': 1e-3, 'seconde (s)': 1, 'minute (min)': 60, 'heure (h)': 3600, 'jour': 86400, 'semaine': 604800, 'mois (moyen)': 2629746, 'année (365 j)': 31536000, 'décennie': 315360000, 'siècle': 3153600000}},
  'Vitesse': {u: {'mètre par seconde (m/s)': 1, 'kilomètre par heure (km/h)': 1 / 3.6, 'mile par heure (mph)': .44704, 'nœud (kn)': 1852 / 3600, 'pied par seconde (ft/s)': .3048, 'Mach': 340.29, 'vitesse de la lumière (c)': 299792458}},
  'Température': {f: {'degré Celsius (°C)': [c => c, c => c], 'degré Fahrenheit (°F)': [f => (f - 32) * 5 / 9, c => c * 9 / 5 + 32], 'kelvin (K)': [k => k - 273.15, c => c + 273.15], 'degré Rankine (°R)': [r => (r - 491.67) * 5 / 9, c => (c + 273.15) * 9 / 5]}},
  'Pression': {u: {'pascal (Pa)': 1, 'hectopascal (hPa)': 100, 'kilopascal (kPa)': 1000, 'bar': 1e5, 'millibar (mbar)': 100, 'atmosphère (atm)': 101325, 'mmHg': 133.322387415, 'psi': 6894.757293168}},
  'Énergie': {u: {'joule (J)': 1, 'kilojoule (kJ)': 1000, 'calorie (cal)': 4.184, 'kilocalorie (kcal)': 4184, 'wattheure (Wh)': 3600, 'kilowattheure (kWh)': 3.6e6, 'électronvolt (eV)': 1.602176634e-19, 'BTU': 1055.05585262}},
  'Puissance': {u: {'watt (W)': 1, 'kilowatt (kW)': 1000, 'mégawatt (MW)': 1e6, 'cheval-vapeur (ch)': 735.49875, 'horsepower (hp)': 745.69987158227}},
  'Données': {u: {'bit': .125, 'octet (o)': 1, 'kilooctet (Ko)': 1e3, 'mégaoctet (Mo)': 1e6, 'gigaoctet (Go)': 1e9, 'téraoctet (To)': 1e12, 'kibioctet (Kio)': 1024, 'mébioctet (Mio)': 1048576, 'gibioctet (Gio)': 1073741824}},
  'Angle': {u: {'degré (°)': 1, 'radian (rad)': 180 / Math.PI, 'grade (gon)': .9, 'minute d\'arc (′)': 1 / 60, 'tour': 360}},
  'Consommation': {f: {'litres aux 100 km (L/100 km)': [v => v, v => v], 'kilomètres par litre (km/L)': [v => 100 / v, v => 100 / v], 'miles par gallon US (mpg)': [v => 235.214583 / v, v => 235.214583 / v]}},
  'Monnaies': {money: true},
};
const UC_NAMES = {EUR: 'Euro', USD: 'Dollar américain', GBP: 'Livre sterling', CHF: 'Franc suisse', JPY: 'Yen', CAD: 'Dollar canadien', AUD: 'Dollar australien', CNY: 'Yuan', KRW: 'Won', INR: 'Roupie indienne', BRL: 'Réal', MXN: 'Peso mexicain', SEK: 'Couronne suédoise', NOK: 'Couronne norvégienne', DKK: 'Couronne danoise', PLN: 'Zloty', CZK: 'Couronne tchèque', TRY: 'Livre turque', ZAR: 'Rand', HKD: 'Dollar de Hong Kong', SGD: 'Dollar de Singapour', NZD: 'Dollar néo-zélandais', THB: 'Baht'};

export default function (ctx) {
  const el = ctx.el;
  let cat = 'Longueur', rates = null, ratesAt = '', ratesErr = '';
  const money = s => parseFloat(String(s).replace(',', '.'));
  const units = c => c === 'Monnaies' ? Object.keys(rates || {EUR: 1}) : Object.keys(UC[c].u || UC[c].f);
  function convert(c, v, a, b) { const x = UC[c]; if (x.money) return v / rates[a] * rates[b]; if (x.f) return x.f[b][1](x.f[a][0](v)); return v * x.u[a] / x.u[b]; }
  const fmt = v => !isFinite(v) ? '—' : Math.abs(v) >= 1e12 || (Math.abs(v) < 1e-6 && v) ? v.toExponential(6).replace('.', ',') : (+v.toPrecision(10)).toLocaleString('fr-FR', {maximumFractionDigits: 10});

  const S = el('style');
  S.textContent = `
    .uc{padding:18px;display:flex;flex-direction:column;gap:14px}
    .uc .cats{display:flex;flex-wrap:wrap;gap:6px}
    .uc .cats button{font:11px var(--title,monospace);color:var(--lilac,#d9c6ff);border:0;padding:7px 11px;cursor:pointer;background:color-mix(in srgb,var(--line2,#3a2a6e) 70%,transparent)}
    .uc .cats button.on{background:color-mix(in srgb,var(--magenta,#e01ec8) 80%,#000);color:#fff}
    .uc .card{background:color-mix(in srgb,var(--line,#2a1d52) 35%,var(--bg0,#0b031c));padding:14px;box-shadow:inset 0 0 0 2px var(--line2,#3a2a6e)}
    .uc .line{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .uc input,.uc select{font:16px var(--text,sans-serif);padding:8px 10px;background:color-mix(in srgb,var(--bg0,#0b031c) 70%,#000);color:var(--shell,#fff);border:2px solid var(--line2,#3a2a6e);outline:0}
    .uc input{width:120px} .uc select{flex:1;min-width:120px}
    .uc button.swap{cursor:pointer}
    .uc .big{font:30px var(--title,monospace);color:#fff;margin-top:10px;word-break:break-all}
    .uc .hint{color:var(--muted,#8f7bb8);font-size:13px;margin-top:4px}
    .uc .all .row{display:flex;justify-content:space-between;gap:10px;padding:6px 8px;cursor:pointer;border-bottom:1px solid var(--line,#2a1d52)}
    .uc .all .row:hover{background:rgba(var(--pkr,255,90,217),.12)} .uc .all b{color:var(--lilac,#d9c6ff)}
    .uc .label{font:10px var(--title,monospace);color:var(--muted,#8f7bb8)}`;
  const cats = el('div', 'cats'), val = el('input'); val.value = '1'; val.inputMode = 'decimal';
  const from = el('select'), to = el('select'), swap = el('button', 'swap', '⇄');
  const line = el('div', 'line'); line.append(val, from, swap, to);
  const big = el('div', 'big'), note = el('div', 'hint');
  const card1 = el('div', 'card'); card1.append(line, big, note);
  const all = el('div', 'all'); const card2 = el('div', 'card'); card2.append(el('div', 'label', 'DANS TOUTES LES UNITÉS'), all);
  const wrap = el('div', 'uc'); wrap.append(cats, card1, card2);
  ctx.view.append(S, wrap);

  function render() {
    cats.replaceChildren(...Object.keys(UC).map(c => { const b = el('button', c === cat ? 'on' : '', c); b.onclick = () => { cat = c; from.dataset.cat = ''; render(); }; return b; }));
    const us = units(cat), label = u => cat === 'Monnaies' ? u + ' · ' + (UC_NAMES[u] || u) : u;
    if (from.dataset.cat !== cat) {
      for (const s of [from, to]) s.replaceChildren(...us.map(u => { const o = el('option', '', label(u)); o.value = u; return o; }));
      from.value = us[cat === 'Monnaies' ? 0 : Math.min(us.length - 1, cat === 'Longueur' ? 6 : 1)]; to.value = us[cat === 'Monnaies' ? 1 : Math.min(us.length - 1, cat === 'Longueur' ? 5 : 0)] || us[0];
      from.dataset.cat = cat;
    }
    const v = money(val.value || '1'), a = from.value, b = to.value;
    if (cat === 'Monnaies' && !rates) { big.textContent = 'Taux indisponibles' + (ratesErr ? ' : ' + ratesErr : ''); all.replaceChildren(); return; }
    big.textContent = isNaN(v) ? '—' : fmt(convert(cat, v, a, b)) + ' ' + b.replace(/^.*\((.*)\)$/, '$1');
    note.textContent = cat === 'Monnaies' ? 'Taux BCE du ' + ratesAt : '';
    all.replaceChildren(...(isNaN(v) ? [] : us.filter(u => u !== a).map(u => { const r = el('div', 'row'); r.append(el('span', '', label(u)), el('b', '', fmt(convert(cat, v, a, u)))); r.onclick = () => { to.value = u; render(); }; return r; })));
  }
  val.oninput = from.onchange = to.onchange = render;
  swap.onclick = () => { const a = from.value; from.value = to.value; to.value = a; render(); };
  ctx.onOpen(async () => {
    if (!rates) try { const r = await ctx.net('https://api.frankfurter.dev/v1/latest?base=EUR'); const d = JSON.parse(r.body); rates = {EUR: 1, ...d.rates}; ratesAt = d.date; } catch (e) { ratesErr = e.message; }
    render();
  });
}
