/* Moteur de figures : calcule des SVG exacts à partir de coordonnées
   mathématiques. Ce fichier contient le socle (toile, étiquettes, expressions)
   et la famille la plus utilisée : les repères. Les arbres pondérés, les
   diagrammes statistiques et le triangle de Pascal sont dans
   assets/figures-statistiques.js ; la géométrie plane, la droite numérique,
   les solides et les tracés dans assets/figures-geometrie.js. Chaque page ne
   charge que les fichiers dont ses figures ont besoin.
   Une figure est décrite par un objet sérialisable en JSON ; la même
   description donne toujours le même SVG. Aucun attribut style, aucun
   aléatoire, coordonnées arrondies à 0,1 px. Utilisable dans le navigateur
   (window.Figures) et dans Node (module.exports, moteur complet). */
(function (racine, fabrique) {
  if (typeof module === 'object' && module && module.exports) { module.exports = fabrique(); require('./figures-statistiques.js')(module.exports); require('./figures-geometrie.js')(module.exports); }
  else racine.Figures = fabrique();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const MOINS = '−';
  const TAILLE = 14;
  const PETIT = 12;
  const TIRETS = '5 4';
  const MARGE = 24;
  const R2 = Math.SQRT1_2;
  const ROSE = {n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0], ne: [R2, -R2], no: [-R2, -R2], se: [R2, R2], so: [-R2, R2]};
  const HUIT = [ROSE.ne, ROSE.no, ROSE.se, ROSE.so, ROSE.n, ROSE.s, ROSE.e, ROSE.o];

  /* ---------- Nombres et texte ---------- */
  const P = v => {
    const r = Math.round(v * 10) / 10;
    return String(Object.is(r, -0) ? 0 : r);
  };
  const ech = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function nb(v, dec) {
    if (typeof v === 'string') return v;
    const d = dec == null ? 2 : dec;
    let s = (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s.replace('.', ',').replace('-', MOINS);
  }
  const decimales = pas => {
    const s = String(Math.round(pas * 1e6) / 1e6);
    return s.indexOf('.') < 0 ? 0 : s.length - s.indexOf('.') - 1;
  };
  const signe = v => (v >= 0 ? '+' : MOINS) + nb(Math.abs(v));

  /* Typographie française, comme tools/typographie.py : le titre, la légende et les
     étiquettes sortent du moteur dans leur forme définitive. */
  const LETTRE = 'A-Za-zÀ-ÖØ-öø-ÿŒœ';
  const UNITES = '(?:€|%|km/h|m/s|kWh|km|cm|mm|kg|min|h|L|°C|ans?|mois)';
  const REGLES = [
    [new RegExp('([' + LETTRE + "])'(?=[" + LETTRE + '])', 'g'), '$1\u2019'],
    [/(\S)[ \u00a0\u202f](?=:(?:\s|$))/g, '$1\u00a0'],
    [/(\S)[ \u00a0\u202f](?=[;!?](?:\s|$|[»)]))/g, '$1\u202f'],
    [/«[ \u00a0\u202f]?/g, '«\u00a0'],
    [/[ \u00a0\u202f]?»/g, '\u00a0»'],
    [new RegExp('(\\d) (?=' + UNITES + '(?![' + LETTRE + '\\d/]))', 'g'), '$1\u00a0']
  ];
  const typo = s => REGLES.reduce((t, r) => t.replace(r[0], r[1]), String(s));

  /* Texte avec indices : « P_A(B) » ou « u_{n+1} ». */
  function riche(s, taille) {
    s = String(s);
    let out = '', i = 0, bas = false;
    while (i < s.length) {
      if (s[i] === '_' && i + 1 < s.length) {
        let sub;
        if (s[i + 1] === '{' && s.indexOf('}', i) > 0) { const j = s.indexOf('}', i); sub = s.slice(i + 2, j); i = j + 1; }
        else { sub = s[i + 1]; i += 2; }
        out += '<tspan dy="' + P(taille * 0.28) + '" font-size="' + P(taille * 0.75) + '">' + ech(sub) + '</tspan>';
        bas = true;
      } else {
        let j = i;
        while (j < s.length && !(s[j] === '_' && j + 1 < s.length)) j++;
        const bout = ech(s.slice(i, j));
        out += bas ? '<tspan dy="' + P(-taille * 0.28) + '">' + bout + '</tspan>' : bout;
        bas = false;
        i = j;
      }
    }
    return out;
  }
  const longueur = s => String(s).replace(/_\{([^}]*)\}/g, '$1').replace(/_(?=.)/g, '').length;

  /* ---------- Expressions : « x^2 - 14 », « 1/x », « sqrt(x) », sans eval ---------- */
  const FONCTIONS = {sqrt: Math.sqrt, racine: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10, exp: Math.exp};
  function fonction(src) {
    if (typeof src === 'function') return src;
    if (typeof src === 'number') return () => src;
    if (Array.isArray(src)) return n => src[n];
    const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/,/g, '.')
      .replace(/²/g, '^2').replace(/³/g, '^3').toLowerCase();
    let i = 0;
    const erreur = () => { throw new Error('Expression illisible : ' + src); };
    function expr() {
      let f = terme();
      while (s[i] === '+' || s[i] === '-') {
        const op = s[i++], g = terme(), a = f;
        f = op === '+' ? x => a(x) + g(x) : x => a(x) - g(x);
      }
      return f;
    }
    function terme() {
      let f = unaire();
      for (;;) {
        if (s[i] === '*' || s[i] === '/') {
          const op = s[i++], g = unaire(), a = f;
          f = op === '*' ? x => a(x) * g(x) : x => a(x) / g(x);
        } else if (i < s.length && /[a-z(]/.test(s[i])) {
          const g = puissance(), a = f;
          f = x => a(x) * g(x);
        } else return f;
      }
    }
    function unaire() {
      if (s[i] === '-') { i++; const g = unaire(); return x => -g(x); }
      if (s[i] === '+') { i++; return unaire(); }
      return puissance();
    }
    function puissance() {
      const b = atome();
      if (s[i] === '^') { i++; const e = unaire(); return x => Math.pow(b(x), e(x)); }
      return b;
    }
    function atome() {
      if (s[i] === '(') { i++; const f = expr(); if (s[i] !== ')') erreur(); i++; return f; }
      const m = /^\d+(\.\d+)?/.exec(s.slice(i));
      if (m) { i += m[0].length; const v = parseFloat(m[0]); return () => v; }
      const nom = /^[a-z]+/.exec(s.slice(i));
      if (!nom) erreur();
      for (const cle of Object.keys(FONCTIONS)) {
        if (nom[0].indexOf(cle) === 0 && s[i + cle.length] === '(') {
          i += cle.length + 1;
          const f = expr();
          if (s[i] !== ')') erreur();
          i++;
          return x => FONCTIONS[cle](f(x));
        }
      }
      if (nom[0].indexOf('pi') === 0) { i += 2; return () => Math.PI; }
      const c = s[i++];
      if (c === 'x' || c === 'n' || c === 't') return x => x;
      if (c === 'e') return () => Math.E;
      return erreur();
    }
    const f = expr();
    if (i !== s.length) erreur();
    return f;
  }

  /* ---------- Outils géométriques (pixels) ---------- */
  const unite = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const chevauche = (a, b) => a[0] < b[2] + 1 && b[0] < a[2] + 1 && a[1] < b[3] + 0.5 && b[1] < a[3] + 0.5;

  const arcPoints = (c, r, a1, a2, n) => { const out = []; for (let i = 0; i <= n; i++) { const a = a1 + (a2 - a1) * i / n; out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } return out; };

  function couper(x1, y1, x2, y2, a, b, c, d) {
    let t0 = 0, t1 = 1;
    const dx = x2 - x1, dy = y2 - y1;
    const pq = [[-dx, x1 - a], [dx, c - x1], [-dy, y1 - b], [dy, d - y1]];
    for (const [p, q] of pq) {
      if (p === 0) { if (q < 0) return null; }
      else {
        const r = q / p;
        if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
        else { if (r < t0) return null; if (r < t1) t1 = r; }
      }
    }
    return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
  }

  function simplifier(pts, tol) {
    if (pts.length < 3) return pts;
    const garde = pts.map(() => false);
    garde[0] = garde[pts.length - 1] = true;
    const pile = [[0, pts.length - 1]];
    while (pile.length) {
      const [a, b] = pile.pop();
      const [x1, y1] = pts[a], [x2, y2] = pts[b];
      const L = Math.hypot(x2 - x1, y2 - y1) || 1;
      let dm = 0, im = -1;
      for (let i = a + 1; i < b; i++) {
        const d = Math.abs((x2 - x1) * (y1 - pts[i][1]) - (x1 - pts[i][0]) * (y2 - y1)) / L;
        if (d > dm) { dm = d; im = i; }
      }
      if (dm > tol) { garde[im] = true; pile.push([a, im], [im, b]); }
    }
    return pts.filter((_, i) => garde[i]);
  }

  function pasJoli(etendue, cible) {
    const brut = etendue / cible;
    const p = Math.pow(10, Math.floor(Math.log10(brut)));
    const r = brut / p;
    return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * p;
  }
  function graduations(min, max, pas) {
    const out = [];
    for (let i = Math.ceil(min / pas - 1e-9); i <= Math.floor(max / pas + 1e-9); i++) out.push(Math.round(i * pas * 1e9) / 1e9);
    return out;
  }
  function direction(pos) {
    if (typeof pos === 'number') { const a = pos * Math.PI / 180; return [Math.cos(a), -Math.sin(a)]; }
    return ROSE[pos] || null;
  }
  const liste = pos => (Array.isArray(pos) ? pos : [pos]).map(direction);
  /* Position imposée (une valeur) ou préférences suivies des autres directions (une liste). */
  const places = (pos, defaut) => (pos == null ? defaut : Array.isArray(pos) ? liste(pos).concat(HUIT) : [direction(pos)]);
  function autour(pref) {
    const tri = HUIT.map((d, i) => [d, d[0] * pref[0] + d[1] * pref[1], i]).sort((a, b) => b[1] - a[1] || a[2] - b[2]).map(t => t[0]);
    return [pref].concat(tri);
  }

  /* ---------- Toile : primitives SVG, obstacles et étiquettes ---------- */
  function attrs(o) {
    let s = '';
    if (!o) return s;
    if (o.e) s += ' stroke-width="' + o.e + '"';
    if (o.t) s += ' stroke-dasharray="' + (o.t === true ? TIRETS : o.t) + '"';
    if (o.op) s += ' opacity="' + o.op + '"';
    if (o.c) s += ' class="fig-c' + o.c + '"';
    if (o.f) s += ' data-f="' + ech(o.f) + '"';
    if (o.pts) s += ' data-pts="' + ech(o.pts) + '"';
    return s;
  }
  const chemin = (pts, ferme) => 'M' + pts.map(p => P(p[0]) + ' ' + P(p[1])).join('L') + (ferme ? 'Z' : '');

  function Toile(w, h) {
    this.w = w; this.h = h;
    this.fonds = []; this.traits = []; this.pleins = []; this.textes = [];
    this.obst = []; this.attente = [];
    this.bb = [Infinity, Infinity, -Infinity, -Infinity];
  }
  Toile.prototype = {
    voir(x, y) {
      const b = this.bb;
      if (x < b[0]) b[0] = x;
      if (y < b[1]) b[1] = y;
      if (x > b[2]) b[2] = x;
      if (y > b[3]) b[3] = y;
    },
    gener(x1, y1, x2, y2) {
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 5));
      for (let i = 0; i <= n; i++) this.obst.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]);
    },
    ligne(x1, y1, x2, y2, o) {
      this.traits.push('<line x1="' + P(x1) + '" y1="' + P(y1) + '" x2="' + P(x2) + '" y2="' + P(y2) + '"' + attrs(o) + '/>');
      this.voir(x1, y1); this.voir(x2, y2);
      if (!(o && o.leger)) this.gener(x1, y1, x2, y2);
    },
    poly(pts, o) {
      o = o || {};
      if (pts.length < 2) return;
      this.traits.push('<path d="' + chemin(pts, o.ferme) + '"' + attrs(o) + '/>');
      for (let i = 0; i < pts.length; i++) {
        this.voir(pts[i][0], pts[i][1]);
        const j = i + 1 < pts.length ? i + 1 : (o.ferme ? 0 : -1);
        if (j >= 0 && !o.leger) this.gener(pts[i][0], pts[i][1], pts[j][0], pts[j][1]);
      }
    },
    fond(pts, op, trou) {
      let d = chemin(pts, true);
      if (trou) d += chemin(trou, true);
      this.fonds.push('<path d="' + d + '"' + (trou ? ' fill-rule="evenodd"' : '') + ' opacity="' + (op || 0.12) + '"/>');
      for (const p of pts) this.voir(p[0], p[1]);
    },
    cercle(x, y, r, o) {
      this.traits.push('<circle cx="' + P(x) + '" cy="' + P(y) + '" r="' + P(r) + '"' + attrs(o) + '/>');
      this.voir(x - r, y - r); this.voir(x + r, y + r);
      if (!(o && o.leger)) {
        const n = Math.max(8, Math.ceil(r));
        for (let i = 0; i < n; i++) this.obst.push([x + r * Math.cos(2 * Math.PI * i / n), y + r * Math.sin(2 * Math.PI * i / n)]);
      }
    },
    /* Arc d'ellipse de l'angle a1 à a2 (radians, sens trigonométrique à l'écran inversé : y vers le bas). */
    arc(x, y, rx, ry, a1, a2, o) {
      const p1 = [x + rx * Math.cos(a1), y - ry * Math.sin(a1)], p2 = [x + rx * Math.cos(a2), y - ry * Math.sin(a2)];
      const grand = Math.abs(a2 - a1) > Math.PI ? 1 : 0, sens = a2 > a1 ? 0 : 1;
      this.traits.push('<path d="M' + P(p1[0]) + ' ' + P(p1[1]) + 'A' + P(rx) + ' ' + P(ry) + ' 0 ' + grand + ' ' + sens + ' ' + P(p2[0]) + ' ' + P(p2[1]) + '"' + attrs(o) + '/>');
      const n = Math.max(4, Math.ceil(Math.abs(a2 - a1) * Math.max(rx, ry) / 6));
      for (let i = 0; i <= n; i++) {
        const a = a1 + (a2 - a1) * i / n, px = x + rx * Math.cos(a), py = y - ry * Math.sin(a);
        this.voir(px, py);
        if (!(o && o.leger)) this.obst.push([px, py]);
      }
    },
    disque(x, y, r, o) {
      this.pleins.push('<circle cx="' + P(x) + '" cy="' + P(y) + '" r="' + P(r) + '"' + attrs(o) + '/>');
      this.voir(x - r, y - r); this.voir(x + r, y + r);
      this.obst.push([x, y], [x - r, y], [x + r, y], [x, y - r], [x, y + r]);
    },
    plein(pts, o) {
      this.pleins.push('<path d="' + chemin(pts, true) + '"' + attrs(o) + '/>');
      for (const p of pts) { this.voir(p[0], p[1]); this.obst.push(p); }
    },
    /* Pointe de flèche pleine dont le sommet est en (x, y) et qui pointe vers (ux, uy). */
    tete(x, y, ux, uy, t, o) {
      t = t || 7;
      const bx = x - ux * t, by = y - uy * t, l = t * 0.42;
      this.plein([[x, y], [bx - uy * l, by + ux * l], [bx + uy * l, by - ux * l]], o);
    },
    croix(x, y, r, o) {
      this.ligne(x - r, y - r, x + r, y + r, o);
      this.ligne(x - r, y + r, x + r, y - r, Object.assign({}, o, {f: null, pts: null}));
    },
    crochet(x, y, sens, o) {
      this.poly([[x + 4 * sens, y - 7], [x, y - 7], [x, y + 7], [x + 4 * sens, y + 7]], Object.assign({e: 2}, o));
    },
    hachurer(pts, pas) {
      pas = pas || 7;
      let min = Infinity, max = -Infinity;
      for (const p of pts) { min = Math.min(min, p[0] + p[1]); max = Math.max(max, p[0] + p[1]); }
      for (let c = Math.ceil(min / pas) * pas + pas / 2; c < max; c += pas) {
        const xs = [];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[(i + 1) % pts.length], fa = a[0] + a[1] - c, fb = b[0] + b[1] - c;
          if ((fa < 0) !== (fb < 0)) { const t = fa / (fa - fb); xs.push(a[0] + t * (b[0] - a[0])); }
        }
        xs.sort((u, v) => u - v);
        for (let i = 0; i + 1 < xs.length; i += 2) this.ligne(xs[i], c - xs[i], xs[i + 1], c - xs[i + 1], {e: 0.8, op: 0.6, leger: true});
      }
    },
    boite(x, y, s, ancre, taille) {
      const l = 0.6 * taille * longueur(s);
      const x0 = ancre === 'start' ? x : ancre === 'end' ? x - l : x - l / 2;
      return [x0, y - 0.8 * taille, x0 + l, y + 0.2 * taille];
    },
    /* Texte à position fixe. Les textes « souples » (graduations) cèdent la place aux autres ;
       une valeur lue (repli) passe sur une seconde ligne plutôt que d'en recouvrir une autre. */
    texte(x, y, s, o) {
      o = o || {};
      s = typo(s);
      const taille = o.taille || TAILLE, ancre = o.ancre || 'middle';
      const b = this.boite(x, y, s, ancre, taille);
      if (o.fleche) b[1] -= 5;
      const e = {x, y, s, ancre, taille, b, prio: o.prio == null ? 5 : o.prio, souple: !!o.souple, gras: o.gras, c: o.c, fleche: o.fleche, vivant: true};
      for (const t of this.textes) {
        if (!t.vivant || !chevauche(t.b, b)) continue;
        if (t.s === e.s && Math.abs(t.b[0] - b[0]) < 4 && Math.abs(t.y - y) < 4) {
          if (e.prio > t.prio) { t.prio = e.prio; t.souple = e.souple; }
          return t;
        }
        if (e.souple && t.prio >= e.prio) return null;
        if (!(t.souple && t.prio < e.prio) && (o.repli || o.cede)) {
          if (!o.repli) return null;
          return this.texte(x + o.repli[0], y + o.repli[1], s, Object.assign({}, o, {repli: null, cede: true}));
        }
      }
      for (const t of this.textes) if (t.vivant && t.souple && t.prio < e.prio && chevauche(t.b, b)) t.vivant = false;
      this.textes.push(e);
      return e;
    },
    /* Texte à placer autour d'un point d'ancrage : la meilleure direction est choisie à la fin. */
    etiquette(ax, ay, s, o) {
      o = o || {};
      this.attente.push({ax, ay, s: typo(s), dirs: o.dirs || HUIT, dist: o.dist == null ? 6 : o.dist, taille: o.taille || TAILLE, gras: o.gras, c: o.c, fleche: o.fleche, zone: o.zone !== false});
    },
    placer(strict) {
      /* Les étiquettes qui ont le moins de places possibles sont posées les premières. */
      const ordre = this.attente.map((q, i) => [q, i]).sort((u, v) => u[0].dirs.length - v[0].dirs.length || u[1] - v[1]).map(u => u[0]);
      for (const q of ordre) {
        const bw = 0.6 * q.taille * longueur(q.s), bh = q.taille;
        let mieux = null, cout = Infinity;
        /* Si toutes les places proches sont prises, on essaie un peu plus loin. */
        for (let tour = 0; tour < 3 && cout >= 1000; tour++) for (let i = 0; i < q.dirs.length; i++) {
          const d = q.dirs[i], dist = (d[2] != null ? d[2] : q.dist) + tour * 10;
          const k = dist + (Math.abs(d[0]) * bw + Math.abs(d[1]) * bh) / 2;
          const cx = (d[3] != null ? d[3] : q.ax) + d[0] * k, cy = (d[4] != null ? d[4] : q.ay) + d[1] * k;
          const b = [cx - bw / 2, cy - bh / 2 - (q.fleche ? 5 : 0), cx + bw / 2, cy + bh / 2];
          let c = i * 1.5 + tour * 100;
          for (const t of this.textes) if (t.vivant && chevauche(t.b, b)) c += t.souple ? 40 : 1000;
          for (const p of this.obst) if (p[0] > b[0] - 3 && p[0] < b[2] + 3 && p[1] > b[1] - 2 && p[1] < b[3] + 2) c += 6;
          const z = this.zone;
          if (z && q.zone && (b[0] < z[0] || b[1] < z[1] || b[2] > z[2] || b[3] > z[3])) c += 25;
          if (strict) {
            const hors = Math.max(1 - b[0], 1 - b[1], b[2] - this.w + 1, b[3] - this.h + 1);
            if (hors > 0) c += 5000 + hors;
          }
          if (c < cout) { cout = c; mieux = {x: cx, y: cy + 0.3 * q.taille, b}; }
        }
        for (const t of this.textes) if (t.vivant && t.souple && chevauche(t.b, mieux.b)) t.vivant = false;
        this.textes.push({x: mieux.x, y: mieux.y, s: q.s, ancre: 'middle', taille: q.taille, b: mieux.b, prio: 5, souple: false, gras: q.gras, c: q.c, fleche: q.fleche, vivant: true});
      }
      this.attente = [];
    },
    debord() {
      const b = this.bb.slice();
      for (const t of this.textes) if (t.vivant) {
        b[0] = Math.min(b[0], t.b[0]); b[1] = Math.min(b[1], t.b[1]);
        b[2] = Math.max(b[2], t.b[2]); b[3] = Math.max(b[3], t.b[3]);
      }
      const d = [Math.max(0, 1.5 - b[0]), Math.max(0, 1.5 - b[1]), Math.max(0, b[2] - this.w + 1.5), Math.max(0, b[3] - this.h + 1.5)];
      return d.some(v => v > 0) ? d : null;
    },
    corps() {
      let textes = '', fleches = '';
      for (const t of this.textes) {
        if (!t.vivant) continue;
        textes += '<text x="' + P(t.x) + '" y="' + P(t.y) + '"' + (t.ancre !== 'middle' ? ' text-anchor="' + t.ancre + '"' : '')
          + (t.taille !== TAILLE ? ' font-size="' + t.taille + '"' : '') + (t.gras ? ' font-weight="700"' : '')
          + (t.c ? ' class="fig-c' + t.c + '"' : '') + '>' + riche(t.s, t.taille) + '</text>';
        if (t.fleche) {
          const y = t.b[1] + 3, x0 = t.b[0] + 1, x1 = t.b[2] - 1;
          fleches += '<path d="M' + P(x0) + ' ' + P(y) + 'H' + P(x1) + 'M' + P(x1 - 3) + ' ' + P(y - 2.5) + 'L' + P(x1) + ' ' + P(y) + 'L' + P(x1 - 3) + ' ' + P(y + 2.5) + '" stroke-width="1"/>';
        }
      }
      return (this.fonds.length ? '<g fill="currentColor" stroke="none">' + this.fonds.join('') + '</g>' : '')
        + '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' + this.traits.join('') + fleches + '</g>'
        + (this.pleins.length ? '<g fill="currentColor" stroke="none">' + this.pleins.join('') + '</g>' : '')
        + (textes ? '<g fill="currentColor" stroke="none" font-size="' + TAILLE + '" text-anchor="middle">' + textes + '</g>' : '');
    }
  };

  const trait = e => ({t: e.pointilles ? TIRETS : 0, c: e.couleur, e: e.epais ? 2.8 : (e.fin ? 1 : 0)});

  /* ---------- Repère ---------- */
  function zeros(g, a, b) {
    const out = [], N = 400;
    let xp = a, yp = g(a);
    for (let i = 1; i <= N; i++) {
      const x = a + (b - a) * i / N, y = g(x);
      if (Number.isFinite(yp) && Number.isFinite(y)) {
        if (yp === 0) out.push(xp);
        else if (yp * y < 0 && Math.abs(y - yp) < 1e6) {
          let u = xp, v = x, fu = yp;
          for (let k = 0; k < 60; k++) { const mi = (u + v) / 2, fm = g(mi); if (fu * fm <= 0) v = mi; else { u = mi; fu = fm; } }
          out.push((u + v) / 2);
        }
      }
      xp = x; yp = y;
    }
    if (yp === 0) out.push(xp);
    return out.map(v => Math.round(v * 1e6) / 1e6);
  }

  function repere(T, desc, m) {
    const o = desc.options || {}, els = desc.elements || [];
    const def = (v, d) => (v == null ? d : v);
    const xmin = def(o.xmin, -5), xmax = def(o.xmax, 5), ymin = def(o.ymin, -5), ymax = def(o.ymax, 5);
    const axeY = o.axe_y !== false, graduerX = o.graduations_x !== false;
    const cx = o.coupure !== false && xmin > 0 && axeY ? 14 : 0, cy = o.coupure !== false && ymin > 0 ? 14 : 0;
    const L = T.w - m[0] - m[2] - cx - 10, H = T.h - m[1] - m[3] - cy - 10;
    let sx = L / (xmax - xmin), sy = H / (ymax - ymin);
    if (o.orthonorme) sx = sy = Math.min(sx, sy);
    const gauche = m[0] + cx + (L - sx * (xmax - xmin)) / 2, haut = m[1] + 10 + (H - sy * (ymax - ymin)) / 2;
    const X = x => gauche + (x - xmin) * sx, Y = y => haut + (ymax - y) * sy;
    const droite = X(xmax), bas = Y(ymin);
    const ax = o.axe_y === 'gauche' ? gauche : xmin <= 0 && xmax >= 0 ? X(0) : xmin > 0 ? gauche - cx : droite;
    const ay = ymin <= 0 && ymax >= 0 ? Y(0) : ymin > 0 ? bas + cy : haut;
    const pasX = o.pas_x || pasJoli(xmax - xmin, 8), pasY = o.pas_y || pasJoli(ymax - ymin, 6);
    const gx = graduations(xmin, xmax, pasX), gy = graduations(ymin, ymax, pasY);
    const origine = xmin <= 0 && xmax >= 0 && ymin <= 0 && ymax >= 0 && o.axe_y !== 'gauche';

    /* Quadrillage, axes, graduations. */
    if (o.grille !== false) {
      if (o.grille !== 'y' && graduerX) for (const x of gx) T.ligne(X(x), haut, X(x), bas, {e: 1, op: 0.18, leger: true});
      if (o.grille !== 'x') for (const y of gy) T.ligne(gauche, Y(y), droite, Y(y), {e: 1, op: 0.18, leger: true});
    }
    T.ligne(gauche - cx, ay, droite + 4, ay, {e: 1.4, f: 'axe-x', leger: true});
    T.tete(droite + 10, ay, 1, 0, 7);
    if (cx) { const c = gauche - cx / 2; T.ligne(c - 3, ay + 4, c, ay - 4, {e: 1.2, leger: true}); T.ligne(c, ay + 4, c + 3, ay - 4, {e: 1.2, leger: true}); }
    if (axeY) {
      T.ligne(ax, bas + cy, ax, haut - 4, {e: 1.4, f: 'axe-y', leger: true});
      T.tete(ax, haut - 10, 0, -1, 7);
      if (cy) { const c = bas + cy / 2; T.ligne(ax - 4, c + 3, ax + 4, c, {e: 1.2, leger: true}); T.ligne(ax - 4, c, ax + 4, c - 3, {e: 1.2, leger: true}); }
    }
    const dx = decimales(pasX), dyy = decimales(pasY);
    if (origine && o.origine !== false) T.texte(ax - 8, ay + 14, 'O', {prio: 2, souple: true, taille: PETIT});
    if (graduerX) {
      const large = Math.max.apply(null, gx.map(v => longueur(nb(v, dx)))) * 0.6 * PETIT + 6;
      const saut = Math.max(1, Math.ceil(large / (pasX * sx)));
      for (const x of gx) {
        T.ligne(X(x), ay - 3, X(x), ay + 3, {e: 1.2, leger: true});
        if (o.valeurs_x || (origine && Math.abs(x) < 1e-9) || Math.round(x / pasX) % saut) continue;
        if (o.graduations !== false) T.texte(X(x), ay + 15, nb(x, dx), {prio: 1, souple: true, taille: PETIT});
      }
      for (const x of o.valeurs_x || []) { T.ligne(X(x), ay - 3, X(x), ay + 3, {e: 1.2, leger: true}); T.texte(X(x), ay + 15, nb(x), {prio: 2, taille: PETIT}); }
    }
    if (axeY) {
      const saut = Math.max(1, Math.ceil(15 / (pasY * sy)));
      for (const y of gy) {
        T.ligne(ax - 3, Y(y), ax + 3, Y(y), {e: 1.2, leger: true});
        if (o.valeurs_y || (origine && Math.abs(y) < 1e-9) || Math.round(y / pasY) % saut) continue;
        if (o.graduations !== false) T.texte(ax - 6, Y(y) + 4, nb(y, dyy), {prio: 1, souple: true, taille: PETIT, ancre: 'end'});
      }
      for (const y of o.valeurs_y || []) { T.ligne(ax - 3, Y(y), ax + 3, Y(y), {e: 1.2, leger: true}); T.texte(ax - 6, Y(y) + 4, nb(y), {prio: 2, taille: PETIT, ancre: 'end'}); }
    }
    const nomX = def(o.nom_x, 'x'), nomY = def(o.nom_y, 'y');
    if (nomX) {
      if (longueur(nomX) > 3 && ay >= bas - 1) T.texte(droite + 10, ay + 31, nomX, {prio: 6, taille: PETIT, ancre: 'end'});
      else T.texte(droite + 10, ay - 8, nomX, {prio: 6, taille: PETIT, ancre: 'end'});
    }
    if (nomY && axeY) T.texte(ax + 8, haut - 8, nomY, {prio: 6, taille: PETIT, ancre: 'start'});

    T.zone = [gauche - 1, haut - 1, droite + 1, bas + 1];
    const dedans = y => y >= ymin - 1e-9 && y <= ymax + 1e-9;
    const coupeMath = (x1, y1, x2, y2) => couper(x1, y1, x2, y2, xmin, ymin, xmax, ymax);
    const segment = (x1, y1, x2, y2, opt) => { const c = coupeMath(x1, y1, x2, y2); if (c) T.ligne(X(c[0]), Y(c[1]), X(c[2]), Y(c[3]), opt); return c; };
    const nommer = (p, texte, e) => T.etiquette(p[0], p[1], texte, {dirs: places(e && e.pos, [ROSE.no, ROSE.se, ROSE.n, ROSE.s, ROSE.ne, ROSE.so, ROSE.o, ROSE.e]), dist: 5, taille: PETIT + 1, c: e && e.couleur});
    const surAxeX = (x, texte) => T.texte(X(x), ay + 15, texte == null ? nb(x) : texte, {prio: 3, taille: PETIT, repli: [0, 13]});
    const surAxeY = (y, texte) => T.texte(ax - 6, Y(y) + 4, texte == null ? nb(y) : texte, {prio: 3, taille: PETIT, ancre: 'end', cede: true});
    const tirets = {e: 1.2, t: '4 3'};

    function tracer(f, de, a, e) {
      const N = 240, lots = [];
      let cur = [], xp = null, yp = null;
      const finir = () => { if (cur.length > 1) lots.push(cur); cur = []; };
      const bord = (xi, yi, xo, yo) => { const lim = yo > ymax ? ymax : ymin, t = (lim - yi) / (yo - yi); return [xi + t * (xo - xi), lim]; };
      const saut = (xa, ya, xb, yb) => {
        const ym = f((xa + xb) / 2);
        return !Number.isFinite(ym) || ((ym - ya) * (yb - ym) < 0 && Math.abs(yb - ya) * sy > 40);
      };
      for (let i = 0; i <= N; i++) {
        const x = de + (a - de) * i / N, y = f(x);
        if (!Number.isFinite(y)) { finir(); xp = null; continue; }
        if (xp !== null) {
          const pi = dedans(yp), ci = dedans(y), coupure = saut(xp, yp, x, y);
          if (pi && ci) { if (coupure) finir(); cur.push([x, y]); }
          else if (pi && !ci) { if (!coupure) cur.push(bord(xp, yp, x, y)); finir(); }
          else if (!pi && ci) { finir(); cur = coupure ? [[x, y]] : [bord(x, y, xp, yp), [x, y]]; }
        } else if (dedans(y)) cur.push([x, y]);
        xp = x; yp = y;
      }
      finir();
      const style = Object.assign(trait(e), {f: 'courbe'});
      if (!style.e) style.e = 2;
      for (const lot of lots) T.poly(simplifier(lot.map(p => [X(p[0]), Y(p[1])]), 0.08), style);
      if (e.nom && lots.length) {
        const lot = lots[lots.length - 1], xn = e.nom_x != null ? e.nom_x : lot[0][0] + 0.82 * (lot[lot.length - 1][0] - lot[0][0]);
        nommer([X(xn), Y(f(xn))], e.nom, e);
      }
    }

    for (const e of els) {
      switch (e.t) {
        case 'courbe': tracer(fonction(e.f), Math.max(xmin, def(e.de, xmin)), Math.min(xmax, def(e.a, xmax)), e); break;
        case 'droite_affine': {
          const de = Math.max(xmin, def(e.de, xmin)), a = Math.min(xmax, def(e.a, xmax)), style = Object.assign(trait(e), {f: 'droite'});
          if (!style.e) style.e = 2;
          const c = segment(de, e.m * de + e.p, a, e.m * a + e.p, style);
          if (c && e.nom) { const xn = e.nom_x != null ? e.nom_x : c[0] + 0.82 * (c[2] - c[0]); nommer([X(xn), Y(e.m * xn + e.p)], e.nom, e); }
          break;
        }
        case 'droite_verticale':
        case 'asymptote_v': {
          const x = def(e.c, e.x);
          T.ligne(X(x), bas, X(x), haut, Object.assign(e.t === 'asymptote_v' ? {t: TIRETS, e: 1.3} : trait(e), {f: e.t}));
          if (e.nom) T.etiquette(X(x), haut + 8, e.nom, {dirs: [ROSE.e, ROSE.o], dist: 4, taille: PETIT + 1});
          break;
        }
        case 'asymptote_h': {
          T.ligne(gauche, Y(e.y), droite, Y(e.y), {t: TIRETS, e: 1.3, f: 'asymptote_h'});
          if (e.nom) T.etiquette(droite - 8, Y(e.y), e.nom, {dirs: [ROSE.n, ROSE.s], dist: 3, taille: PETIT + 1});
          break;
        }
        case 'point': {
          const p = [X(e.x), Y(e.y)];
          if (e.creux) T.cercle(p[0], p[1], 3, {e: 1.4, f: 'point'});
          else T.disque(p[0], p[1], 2.8, {f: 'point', c: e.couleur});
          if (e.nom) T.etiquette(p[0], p[1], e.nom, {dirs: places(e.pos, HUIT), dist: 4});
          break;
        }
        case 'nuage': {
          for (const q of e.points) {
            const p = [X(q[0]), Y(q[1])];
            if (e.forme === 'croix') T.croix(p[0], p[1], 3, {e: 1.5, f: 'nuage'});
            else if (e.forme === 'carre') T.plein([[p[0] - 2.8, p[1] - 2.8], [p[0] + 2.8, p[1] - 2.8], [p[0] + 2.8, p[1] + 2.8], [p[0] - 2.8, p[1] + 2.8]], {f: 'nuage'});
            else T.disque(p[0], p[1], 2.6, {f: 'nuage', c: e.couleur});
          }
          break;
        }
        case 'point_moyen': {
          const p = [X(e.x), Y(e.y)];
          T.cercle(p[0], p[1], 4.5, {e: 2, f: 'point-moyen'});
          T.disque(p[0], p[1], 1.6, {f: 'point'});
          T.etiquette(p[0], p[1], e.nom || 'G', {dirs: places(e.pos, HUIT), dist: 6});
          break;
        }
        case 'lecture': {
          T.ligne(X(e.x), Y(e.y), X(e.x), ay, tirets);
          T.ligne(X(e.x), Y(e.y), ax, Y(e.y), tirets);
          if (e.point !== false) T.disque(X(e.x), Y(e.y), 2.8, {f: 'point'});
          if (e.vx !== false && Math.abs(X(e.x) - ax) > 0.5) surAxeX(e.x, e.vx);
          if (e.vy !== false && Math.abs(Y(e.y) - ay) > 0.5) surAxeY(e.y, e.vy);
          break;
        }
        case 'antecedents': {
          T.ligne(gauche, Y(e.k), droite, Y(e.k), Object.assign({f: 'niveau'}, tirets));
          if (e.vy !== false) surAxeY(e.k, e.vy);
          const xs = e.xs || zeros(x => fonction(e.f)(x) - e.k, xmin, xmax);
          for (const x of xs) { T.ligne(X(x), Y(e.k), X(x), ay, tirets); T.disque(X(x), Y(e.k), 2.8, {f: 'point'}); surAxeX(x); }
          break;
        }
        case 'tangente':
        case 'secante': {
          const f = fonction(e.f), h = 1e-4 * (xmax - xmin);
          const pente = e.t === 'tangente' ? (f(e.a + h) - f(e.a - h)) / (2 * h) : (f(e.b) - f(e.a)) / (e.b - e.a);
          const y0 = f(e.a), de = e.demi ? e.a - e.demi : xmin, a = e.demi ? (e.t === 'tangente' ? e.a : e.b) + e.demi : xmax;
          const style = Object.assign(trait(e), {f: e.t});
          if (!style.e) style.e = 1.4;
          const c = segment(de, y0 + pente * (de - e.a), a, y0 + pente * (a - e.a), style);
          T.disque(X(e.a), Y(y0), 2.8, {f: 'point'});
          if (e.t === 'secante') T.disque(X(e.b), Y(f(e.b)), 2.8, {f: 'point'});
          if (c && e.nom) nommer([X(c[0] + 0.9 * (c[2] - c[0])), Y(c[1] + 0.9 * (c[3] - c[1]))], e.nom, e);
          break;
        }
        case 'escalier': {
          const a = [X(e.x), Y(e.y)], b = [X(e.x + e.dx), Y(e.y)], c = [X(e.x + e.dx), Y(e.y + e.dy)];
          T.poly([a, b, c], {e: 1.3, t: '4 3', f: 'escalier'});
          T.etiquette((a[0] + b[0]) / 2, a[1], def(e.tx, signe(e.dx)), {dirs: [e.dy >= 0 ? ROSE.s : ROSE.n, e.dy >= 0 ? ROSE.n : ROSE.s], dist: 3, taille: PETIT});
          T.etiquette(b[0], (b[1] + c[1]) / 2, def(e.ty, signe(e.dy)), {dirs: [e.dx >= 0 ? ROSE.e : ROSE.o, e.dx >= 0 ? ROSE.o : ROSE.e], dist: 4, taille: PETIT});
          break;
        }
        case 'zone_signe': {
          const xa = X(def(e.a, xmin)), xb = X(def(e.b, xmax)), dessus = e.signe ? e.signe === '+' : /posit/.test(e.texte || '');
          const y1 = dessus ? ay - 21 : ay + 21, y2 = dessus ? ay - 3 : ay + 39;
          T.fond([[xa, y1], [xb, y1], [xb, y2], [xa, y2]], 0.14);
          if (e.texte) T.texte((xa + xb) / 2, (y1 + y2) / 2 + 4, e.texte, {prio: 4, taille: PETIT});
          break;
        }
        case 'intervalle_solutions': {
          const xa = e.a == null ? gauche : X(e.a), xb = e.b == null ? droite : X(e.b);
          T.ligne(xa, ay, xb, ay, {e: 4, f: 'intervalle'});
          if (e.a != null) T.crochet(xa, ay, e.ouvert_a ? -1 : 1);
          if (e.b != null) T.crochet(xb, ay, e.ouvert_b ? 1 : -1);
          break;
        }
        case 'suite_points': {
          const u = fonction(e.u);
          for (let n = e.n0; n <= e.n1; n++) {
            const v = Array.isArray(e.u) ? e.u[n - e.n0] : u(n);
            if (Number.isFinite(v) && dedans(v)) T.disque(X(n), Y(v), 2.8, {f: 'terme', c: e.couleur});
          }
          break;
        }
        case 'vecteur': {
          const a = [X(e.x1), Y(e.y1)], b = [X(e.x2), Y(e.y2)], u = unite([b[0] - a[0], b[1] - a[1]]);
          T.ligne(a[0], a[1], b[0] - u[0] * 5, b[1] - u[1] * 5, Object.assign(trait(e), {f: 'vecteur'}));
          T.tete(b[0], b[1], u[0], u[1], 8, {f: 'pointe'});
          if (e.nom) T.etiquette((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, e.nom, {dirs: [[-u[1], u[0]], [u[1], -u[0]]].sort((p, q) => p[1] - q[1]), dist: 4, fleche: e.fleche !== false});
          break;
        }
        case 'texte': {
          const taille = e.taille || PETIT + 1;
          if (e.pos != null) T.etiquette(X(e.x), Y(e.y), e.texte, {dirs: [direction(e.pos)], dist: 5, taille});
          else T.texte(X(e.x), Y(e.y) + 0.3 * taille, e.texte, {prio: 6, taille, ancre: e.ancre});
          break;
        }
        case 'etiquette_x': T.texte(X(e.x), ay + 15, e.texte, {prio: 3, taille: PETIT}); break;
        case 'segment': T.ligne(X(e.x1), Y(e.y1), X(e.x2), Y(e.y2), Object.assign(trait(e), {f: 'segment'})); break;
        case 'ligne_brisee': {
          T.poly(e.points.map(p => [X(p[0]), Y(p[1])]), Object.assign(trait(e), {f: 'ligne'}));
          if (e.marques !== false) for (const p of e.points) T.disque(X(p[0]), Y(p[1]), 2.6, {f: 'point'});
          break;
        }
        case 'rect':
        case 'polygone': {
          const p = (e.t === 'rect' ? [[e.x1, e.y1], [e.x2, e.y1], [e.x2, e.y2], [e.x1, e.y2]] : e.points).map(q => [X(q[0]), Y(q[1])]);
          if (e.plein) T.fond(p, typeof e.plein === 'number' ? e.plein : 0.14);
          if (e.hachures) T.hachurer(p, 6);
          if (!e.sans_contour) T.poly(p, Object.assign(trait(e), {ferme: true, f: e.t}));
          break;
        }
        case 'baton': {
          const x = X(e.x) + (e.decalage || 0);
          T.ligne(x, ay, x, Y(e.y), e.pointilles ? {e: 2, t: '3 3', f: 'baton-observe'} : {e: 3, f: 'baton'});
          if (e.pointilles) T.cercle(x, Y(e.y), 2.6, {e: 1.4, leger: true}); else T.disque(x, Y(e.y), 2.8);
          break;
        }
        case 'boite': {
          const y = e.y, d = e.demi || 0.28, yc = Y(y), y1 = Y(y + d), y2 = Y(y - d);
          T.poly([[X(e.q1), y1], [X(e.q3), y1], [X(e.q3), y2], [X(e.q1), y2]], {ferme: true, f: 'boite'});
          T.fond([[X(e.q1), y1], [X(e.q3), y1], [X(e.q3), y2], [X(e.q1), y2]], 0.1);
          T.ligne(X(e.med), y1, X(e.med), y2, {e: 2.6, f: 'mediane'});
          T.ligne(X(e.min), yc, X(e.q1), yc, {f: 'moustache'});
          T.ligne(X(e.q3), yc, X(e.max), yc, {f: 'moustache'});
          T.ligne(X(e.min), yc - 5, X(e.min), yc + 5);
          T.ligne(X(e.max), yc - 5, X(e.max), yc + 5);
          if (e.valeurs !== false) for (const v of [e.min, e.q1, e.med, e.q3, e.max]) T.etiquette(X(v), v === e.min || v === e.max ? yc - 5 : y1, nb(v), {dirs: [ROSE.n, [0, -1, 16], ROSE.no, ROSE.ne], dist: 3, taille: PETIT});
          if (e.nom) T.etiquette(X(e.min), yc, e.nom, {dirs: [ROSE.o], dist: 8, taille: PETIT + 1});
          break;
        }
        case 'legende': {
          const adroite = e.position === 'droite';
          e.entrees.forEach((en, i) => {
            const y = haut + 12 + i * 16, x = adroite ? droite - 6 - longueur(en.texte) * 0.6 * PETIT - 16 : gauche + 10;
            const carre = [[x, y - 5], [x + 10, y - 5], [x + 10, y + 5], [x, y + 5]];
            switch (en.forme) {
              case 'plein': T.fond(carre, 0.14); T.poly(carre, {ferme: true, e: 1.2, leger: true}); break;
              case 'hachures': T.hachurer(carre, 4); T.poly(carre, {ferme: true, e: 1.2, leger: true}); break;
              case 'tirets': T.ligne(x - 2, y, x + 12, y, {e: 2, t: '3 3', leger: true}); break;
              case 'croix': T.croix(x + 5, y, 3, {e: 1.5, leger: true}); break;
              case 'carre': T.plein([[x + 2, y - 3], [x + 8, y - 3], [x + 8, y + 3], [x + 2, y + 3]]); break;
              case 'rond': T.disque(x + 5, y, 2.8); break;
              default: T.ligne(x - 2, y, x + 12, y, {e: 2.4, leger: true});
            }
            T.texte(x + 16, y + 4, en.texte, {prio: 6, taille: PETIT, ancre: 'start'});
          });
          break;
        }
        default: throw new Error('Élément inconnu dans un repère : ' + e.t);
      }
    }
  }

  /* ---------- Rendu ---------- */
  const RENDUS = {repere};
  /* Familles ajoutées par les autres fichiers du moteur. */
  const DIMENSIONS = {};
  const AILLEURS = {figure: 'geometrie', droite_numerique: 'geometrie', espace: 'geometrie', programme_trace: 'geometrie', statistiques: 'statistiques', pascal: 'statistiques', arbre: 'statistiques'};
  function rendu(type) {
    if (RENDUS[type]) return RENDUS[type];
    throw new Error(AILLEURS[type] ? 'Figure de type « ' + type + ' » : charger aussi assets/figures-' + AILLEURS[type] + '.js' : 'Type de figure inconnu : ' + type);
  }

  function dimensions(desc) {
    const o = desc.options || {};
    let w = 320, h = 200;
    if (DIMENSIONS[desc.type]) { const d = DIMENSIONS[desc.type](desc); w = d[0]; h = d[1]; }
    switch (desc.type) {
      default:
    }
    return [o.largeur || w, o.hauteur || h];
  }

  function construire(desc) {
    const dessiner = rendu(desc && desc.type);
    const o = desc.options || {}, dim = dimensions(desc), base = o.marge == null ? (desc.type === 'statistiques' && desc.elements[0] && /venn|circulaire/.test(desc.elements[0].t) ? (desc.elements[0].t === 'diagramme_venn' ? 8 : 30) : MARGE) : o.marge;
    const m = [base, base, base, base];
    let toile;
    for (let passe = 0; passe < 6; passe++) {
      toile = new Toile(dim[0], dim[1]);
      dessiner(toile, desc, m);
      toile.placer(passe === 5);
      const d = toile.debord();
      if (!d) break;
      for (let i = 0; i < 4; i++) if (d[i] > 0) m[i] = Math.min(m[i] + d[i] + 1, (i % 2 ? dim[1] : dim[0]) * 0.4);
    }
    return toile;
  }

  function empreinte(desc) {
    const s = JSON.stringify(desc, (k, v) => (typeof v === 'function' ? String(v) : v));
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(36);
  }

  function assembler(desc, id) {
    let w, h, corps;
    if (desc.type === 'groupe') {
      const toiles = desc.figures.map(construire), ecart = 12, sous = desc.figures.some(f => f.titre), vertical = !!(desc.options && desc.options.vertical);
      const haut = Math.max.apply(null, toiles.map(t => t.h)), large = Math.max.apply(null, toiles.map(t => t.w));
      let x = 0, y = 0;
      corps = '';
      toiles.forEach((t, i) => {
        corps += '<g data-panneau="' + (i + 1) + '" transform="translate(' + P(x) + ' ' + P(y) + ')">' + t.corps() + '</g>';
        if (desc.figures[i].titre) corps += '<text x="' + P(x + t.w / 2) + '" y="' + P((vertical ? y + t.h : haut) + 13) + '" fill="currentColor" font-size="' + (PETIT + 1) + '" text-anchor="middle" data-sous-titre="' + (i + 1) + '">' + ech(typo(desc.figures[i].titre)) + '</text>';
        if (vertical) y += t.h + (sous ? 20 : 0) + 4; else x += t.w + ecart;
      });
      w = vertical ? large : x - ecart; h = vertical ? y - 4 : haut + (sous ? 20 : 0);
    } else { const t = construire(desc); w = t.w; h = t.h; corps = t.corps(); }
    const titre = ech(typo(desc.titre || ''));
    return '<svg viewBox="0 0 ' + P(w) + ' ' + P(h) + '" width="' + P(w) + '" height="' + P(h) + '" role="img" aria-labelledby="' + id + (desc.description ? ' ' + id + '-d' : '') + '">'
      + '<title id="' + id + '">' + titre + '</title>' + (desc.description ? '<desc id="' + id + '-d">' + ech(typo(desc.description)) + '</desc>' : '') + corps + '</svg>';
  }

  const identifiant = (desc, o) => (o && o.id) || 'fig-' + empreinte(desc);
  function svg(desc, o) { return assembler(desc, identifiant(desc, o)); }
  function html(desc, o) {
    const dessin = svg(desc, o), large = parseFloat(/viewBox="0 0 ([\d.]+)/.exec(dessin)[1]) > 340;
    return '<figure class="' + ((o && o.classe) || 'lesson-figure') + (large ? ' figure-large' : '') + '"' + (o && o.nom ? ' data-figure="' + ech(o.nom) + '"' : '') + '>' + dessin + '<figcaption>' + ech(typo(desc.titre || '')) + '</figcaption></figure>';
  }

  /* ---------- Constructeurs : Figures.repere('Titre', {…}).courbe('x^2').point(2, 4, 'A').html() ---------- */
  const SIGNATURES = {
    repere: {
      courbe: ['f'], droite_affine: ['m', 'p'], droite_verticale: ['c'], asymptote_h: ['y'], asymptote_v: ['x'],
      point: ['x', 'y', 'nom'], nuage: ['points'], point_moyen: ['x', 'y', 'nom'], lecture: ['x', 'y'], antecedents: ['k'],
      tangente: ['f', 'a'], secante: ['f', 'a', 'b'], escalier: ['x', 'y', 'dx', 'dy'], zone_signe: ['a', 'b', 'texte'],
      intervalle_solutions: ['a', 'b'], suite_points: ['u', 'n0', 'n1'], vecteur: ['x1', 'y1', 'x2', 'y2', 'nom'], texte: ['x', 'y', 'texte'],
      segment: ['x1', 'y1', 'x2', 'y2'], polygone: ['points'], rect: ['x1', 'y1', 'x2', 'y2'], ligne_brisee: ['points'],
      baton: ['x', 'y'], etiquette_x: ['x', 'texte'], legende: ['entrees'], boite: ['min', 'q1', 'med', 'q3', 'max']
    },
  };

  function sorties(d) { return {description: () => d, svg: o => svg(d, o), html: o => html(d, o)}; }
  function constructeur(type) {
    return function (titre, options) {
      const d = {type, titre, options: options || {}, elements: []};
      const b = sorties(d);
      Object.keys(SIGNATURES[type]).forEach(nom => {
        b[nom] = function () {
          const e = {t: nom}, args = SIGNATURES[type][nom];
          for (let i = 0; i < args.length; i++) if (arguments[i] !== undefined) e[args[i]] = arguments[i];
          const opt = arguments[args.length];
          if (opt && typeof opt === 'object') Object.assign(e, opt);
          d.elements.push(e);
          return b;
        };
      });
      return b;
    };
  }

  const api = {
    svg, html, fonction, nombre: nb, typographie: typo, SIGNATURES,
    repere: constructeur('repere'),
    groupe: (titre, figures, options) => sorties({type: 'groupe', titre, options: options || {}, figures: figures.map(f => (f && typeof f.description === 'function' ? f.description() : f))})
  };
  /* Extension par un autre fichier : rendus, dimensions, signatures et constructeurs de nouvelles familles. */
  api.etendre = extension => {
    Object.assign(RENDUS, extension.rendus || {});
    Object.assign(DIMENSIONS, extension.dimensions || {});
    Object.keys(extension.signatures || {}).forEach(type => { SIGNATURES[type] = extension.signatures[type]; api[type] = constructeur(type); });
    Object.assign(api, (extension.constructeurs || (() => ({})))(sorties));
    return api;
  };
  api.interne = {HUIT, PETIT, TAILLE, TIRETS, R2, ROSE, MOINS, arcPoints, autour, couper, direction, liste, places, trait, unite, decimales, graduations, longueur, nb, pasJoli, rendu};
  return api;
});
