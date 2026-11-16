/* Moteur de figures : calcule des SVG exacts à partir de coordonnées
   mathématiques (géométrie plane, repères, droites numériques, solides,
   arbres pondérés, diagrammes statistiques, triangle de Pascal, tracés).
   Une figure est décrite par un objet sérialisable en JSON ; la même
   description donne toujours le même SVG. Aucun attribut style, aucun
   aléatoire, coordonnées arrondies à 0,1 px. Utilisable dans le navigateur
   (window.Figures) et dans Node (module.exports). */
(function (racine, fabrique) {
  if (typeof module === 'object' && module && module.exports) module.exports = fabrique();
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

  /* ---------- Géométrie plane (échelle uniforme) ---------- */
  function geo(T, desc, m) {
    const els = desc.elements || [], o = desc.options || {};
    const pts = {};
    const R = r => {
      if (Array.isArray(r)) return r;
      if (!(r in pts)) throw new Error('Point inconnu : ' + r);
      return pts[r];
    };
    for (const e of els) {
      if (e.t !== 'point') continue;
      if (e.sur) { const a = R(e.sur[0]), b = R(e.sur[1]); pts[e.nom] = [a[0] + e.k * (b[0] - a[0]), a[1] + e.k * (b[1] - a[1])]; }
      else pts[e.nom] = [e.x, e.y];
    }
    /* Étendue mathématique. */
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const voir = p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); };
    for (const e of els) {
      for (const k of ['a', 'b', 'sommet', 'p', 'q']) if (e[k] != null && (typeof e[k] === 'string' || Array.isArray(e[k]))) voir(R(e[k]));
      if (e.points) e.points.forEach(p => voir(R(p)));
      if (e.trou) e.trou.forEach(p => voir(R(p)));
      switch (e.t) {
        case 'point': voir(pts[e.nom]); break;
        case 'cercle': case 'arc_cercle': { const c = R(e.centre); voir([c[0] - e.rayon, c[1] - e.rayon]); voir([c[0] + e.rayon, c[1] + e.rayon]); break; }
        case 'ellipse': { const c = R(e.centre); voir([c[0] - e.rx, c[1] - e.ry]); voir([c[0] + e.rx, c[1] + e.ry]); break; }
        case 'rotation_fleche': { const c = R(e.centre), p = R(e.p), r = Math.hypot(p[0] - c[0], p[1] - c[1]), a = Math.atan2(p[1] - c[1], p[0] - c[0]) + e.angle * Math.PI / 180; voir(p); voir([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); break; }
        case 'texte': voir([e.x, e.y]); break;
        case 'sol': voir([e.x1, e.y]); voir([e.x2, e.y]); break;
        case 'mur': voir([e.x, e.y1]); voir([e.x, e.y2]); break;
        case 'immeuble': voir([e.x, e.y]); voir([e.x + e.l, e.y + e.h]); break;
        case 'sapin': { const l = e.l || 0.45 * e.h; voir([e.x - l / 2, e.y]); voir([e.x + l / 2, e.y + e.h]); break; }
        case 'observateur': voir([e.x, e.y]); voir([e.x, e.y + e.h]); break;
        default:
      }
    }
    if (o.cadre) { x0 = o.cadre[0]; y0 = o.cadre[1]; x1 = o.cadre[2]; y1 = o.cadre[3]; }
    if (!Number.isFinite(x0)) { x0 = y0 = 0; x1 = y1 = 1; }
    const L = T.w - m[0] - m[2], H = T.h - m[1] - m[3];
    const dx = x1 - x0, dy = y1 - y0;
    const k = dx < 1e-9 && dy < 1e-9 ? 1 : Math.min(dx < 1e-9 ? Infinity : L / dx, dy < 1e-9 ? Infinity : H / dy);
    const ox = m[0] + (L - k * dx) / 2, oy = m[1] + (H - k * dy) / 2;
    const px = p => [ox + (p[0] - x0) * k, oy + (y1 - p[1]) * k];
    const Q = r => px(R(r));
    const nom = r => (typeof r === 'string' ? r : '');

    /* Centre de la figure et voisins de chaque point, pour placer les noms à l'extérieur. */
    const noms = Object.keys(pts);
    let gx = 0, gy = 0;
    if (noms.length) { for (const n of noms) { const p = px(pts[n]); gx += p[0]; gy += p[1]; } gx /= noms.length; gy /= noms.length; }
    else { gx = ox + k * dx / 2; gy = oy + k * dy / 2; }
    const voisins = {};
    const lier = (a, b) => {
      if (typeof a === 'string') (voisins[a] = voisins[a] || []).push(Q(b));
      if (typeof b === 'string') (voisins[b] = voisins[b] || []).push(Q(a));
    };
    for (const e of els) {
      if (['segment', 'droite', 'demi_droite', 'vecteur', 'echelle', 'baton'].indexOf(e.t) >= 0) lier(e.a, e.b);
      if ((e.t === 'polygone' || e.t === 'rampe') && e.points) e.points.forEach((p, i) => { if (i + 1 < e.points.length || e.ouvert !== true) lier(p, e.points[(i + 1) % e.points.length]); });
    }
    const dehors = (p, n) => ((p[0] - gx) * n[0] + (p[1] - gy) * n[1] < 0 ? [-n[0], -n[1]] : n);

    for (const e of els) {
      switch (e.t) {
        case 'point': {
          const p = px(pts[e.nom]);
          if (e.marque) T.croix(p[0], p[1], 3, {e: 1.4, f: 'point', pts: e.nom});
          if (e.muet || e.nom[0] === '_') break;
          let dirs;
          if (e.pos != null) dirs = Array.isArray(e.pos) ? liste(e.pos).concat(HUIT) : [direction(e.pos)];
          else {
            let sx = 0, sy = 0;
            for (const v of voisins[e.nom] || []) { const u = unite([v[0] - p[0], v[1] - p[1]]); sx -= u[0]; sy -= u[1]; }
            if (Math.hypot(sx, sy) < 0.3) { sx = p[0] - gx; sy = p[1] - gy; }
            if (Math.hypot(sx, sy) < 0.3) { sx = 0; sy = -1; }
            dirs = autour(unite([sx, sy]));
          }
          T.etiquette(p[0], p[1], e.etiquette || e.nom, {dirs, dist: e.marque ? 7 : 5});
          break;
        }
        case 'segment': { const a = Q(e.a), b = Q(e.b); T.ligne(a[0], a[1], b[0], b[1], Object.assign(trait(e), {f: 'segment', pts: nom(e.a) + ' ' + nom(e.b)})); break; }
        case 'rampe':
        case 'polygone': {
          const p = e.points.map(Q);
          if (e.plein || e.t === 'rampe') T.fond(p, typeof e.plein === 'number' ? e.plein : 0.12, e.trou ? e.trou.map(Q) : null);
          if (e.hachures) T.hachurer(p);
          if (!e.sans_contour) T.poly(p, Object.assign(trait(e), {ferme: e.ouvert !== true, f: 'polygone', pts: e.points.map(nom).join(' ')}));
          break;
        }
        case 'hachures': T.hachurer(e.points.map(Q)); break;
        case 'droite':
        case 'demi_droite': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), G = 4000;
          const c = couper(e.t === 'droite' ? a[0] - u[0] * G : a[0], e.t === 'droite' ? a[1] - u[1] * G : a[1], a[0] + u[0] * G, a[1] + u[1] * G, 3, 3, T.w - 3, T.h - 3);
          if (!c) break;
          T.ligne(c[0], c[1], c[2], c[3], Object.assign(trait(e), {f: e.t, pts: nom(e.a) + ' ' + nom(e.b)}));
          if (e.nom) { const n = [-u[1], u[0]]; T.etiquette(c[2] - u[0] * 16, c[3] - u[1] * 16, e.nom, {dirs: [n, [-n[0], -n[1]]], dist: 4}); }
          break;
        }
        case 'cercle': { const c = Q(e.centre); T.cercle(c[0], c[1], e.rayon * k, Object.assign(trait(e), {f: 'cercle'})); break; }
        case 'arc_cercle': { const c = Q(e.centre); T.arc(c[0], c[1], e.rayon * k, e.rayon * k, e.debut * Math.PI / 180, e.fin * Math.PI / 180, trait(e)); break; }
        case 'ellipse': {
          const c = Q(e.centre), rx = e.rx * k, ry = e.ry * k;
          if (e.arriere) { T.arc(c[0], c[1], rx, ry, Math.PI, 2 * Math.PI, trait(e)); T.arc(c[0], c[1], rx, ry, 0, Math.PI, {t: TIRETS, e: 1.2}); }
          else { T.arc(c[0], c[1], rx, ry, 0, Math.PI, trait(e)); T.arc(c[0], c[1], rx, ry, Math.PI, 2 * Math.PI, trait(e)); }
          break;
        }
        case 'angle_droit': {
          const s = Q(e.sommet), u = unite([Q(e.p)[0] - s[0], Q(e.p)[1] - s[1]]), v = unite([Q(e.q)[0] - s[0], Q(e.q)[1] - s[1]]), t = e.taille || 9;
          T.poly([[s[0] + u[0] * t, s[1] + u[1] * t], [s[0] + (u[0] + v[0]) * t, s[1] + (u[1] + v[1]) * t], [s[0] + v[0] * t, s[1] + v[1] * t]],
            {e: 1.2, f: 'angle-droit', pts: nom(e.sommet) + ' ' + nom(e.p) + ' ' + nom(e.q)});
          break;
        }
        case 'angle': {
          const s = Q(e.sommet), u = unite([Q(e.p)[0] - s[0], Q(e.p)[1] - s[1]]), v = unite([Q(e.q)[0] - s[0], Q(e.q)[1] - s[1]]), r = e.rayon || 22;
          const a1 = Math.atan2(-u[1], u[0]);
          let da = Math.atan2(-v[1], v[0]) - a1;
          while (da > Math.PI) da -= 2 * Math.PI;
          while (da < -Math.PI) da += 2 * Math.PI;
          T.arc(s[0], s[1], r, r, a1, a1 + da, {e: 1.2, f: 'angle'});
          if (e.double) T.arc(s[0], s[1], r + 3, r + 3, a1, a1 + da, {e: 1.2});
          if (e.texte != null) {
            const am = a1 + da / 2, b = [Math.cos(am), -Math.sin(am)];
            T.etiquette(s[0] + b[0] * (r + (e.double ? 3 : 0)), s[1] + b[1] * (r + (e.double ? 3 : 0)), e.texte, {dirs: [b, [b[0], b[1], 10], [b[0], b[1], 16]], dist: 3, taille: e.taille || PETIT + 1});
          }
          break;
        }
        case 'cote': {
          const a = Q(e.a), b = Q(e.b), mi = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], u = unite([b[0] - a[0], b[1] - a[1]]);
          let n = dehors(mi, [-u[1], u[0]]);
          if (e.interieur) n = [-n[0], -n[1]];
          const en = (v, t) => [v[0], v[1], 4, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], op = [-n[0], -n[1]];
          let dirs = [en(n, 0.5), en(op, 0.5), en(n, 0.35), en(n, 0.65), en(op, 0.35), en(op, 0.65)];
          if (e.pos != null) { const l = liste(e.pos); dirs = Array.isArray(e.pos) ? l.map(v => en(v, 0.5)).concat(l.map(v => en(v, 0.35)), l.map(v => en(v, 0.65))) : [en(l[0], 0.5)]; }
          T.etiquette(mi[0], mi[1], e.texte, {dirs, dist: 4, taille: e.taille});
          break;
        }
        case 'cote_fleche': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), d = e.decalage || 14;
          let n = dehors([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [-u[1], u[0]]);
          if (e.pos != null) n = direction(e.pos);
          const a2 = [a[0] + n[0] * d, a[1] + n[1] * d], b2 = [b[0] + n[0] * d, b[1] + n[1] * d];
          T.ligne(a[0] + n[0] * 3, a[1] + n[1] * 3, a[0] + n[0] * (d + 3), a[1] + n[1] * (d + 3), {e: 1});
          T.ligne(b[0] + n[0] * 3, b[1] + n[1] * 3, b[0] + n[0] * (d + 3), b[1] + n[1] * (d + 3), {e: 1});
          T.ligne(a2[0] + u[0] * 5, a2[1] + u[1] * 5, b2[0] - u[0] * 5, b2[1] - u[1] * 5, {e: 1.2, f: 'cote-fleche'});
          T.tete(a2[0], a2[1], -u[0], -u[1], 6);
          T.tete(b2[0], b2[1], u[0], u[1], 6);
          T.etiquette((a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2, e.texte, {dirs: [n], dist: 3});
          break;
        }
        case 'codage': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), s = unite([-u[1] + 0.35 * u[0], u[0] + 0.35 * u[1]]), n = e.n || 1;
          for (let i = 0; i < n; i++) {
            const off = (i - (n - 1) / 2) * 3.5, cx = (a[0] + b[0]) / 2 + u[0] * off, cy = (a[1] + b[1]) / 2 + u[1] * off;
            T.ligne(cx - s[0] * 4.5, cy - s[1] * 4.5, cx + s[0] * 4.5, cy + s[1] * 4.5, {e: 1.2, f: 'codage'});
          }
          break;
        }
        case 'parallele':
        case 'sens': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), n = [-u[1], u[0]], t = e.position == null ? 0.5 : e.position;
          const c = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
          if (e.t === 'sens') { T.tete(c[0] + u[0] * 4, c[1] + u[1] * 4, u[0], u[1], 8); break; }
          for (let i = 0; i < (e.n || 1); i++) {
            const q = [c[0] + u[0] * (3 - i * 5), c[1] + u[1] * (3 - i * 5)];
            T.poly([[q[0] - u[0] * 5 + n[0] * 4, q[1] - u[1] * 5 + n[1] * 4], q, [q[0] - u[0] * 5 - n[0] * 4, q[1] - u[1] * 5 - n[1] * 4]], {e: 1.2, f: 'parallele'});
          }
          break;
        }
        case 'vecteur': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]);
          T.ligne(a[0], a[1], b[0] - u[0] * 5, b[1] - u[1] * 5, Object.assign(trait(e), {f: 'vecteur', pts: nom(e.a) + ' ' + nom(e.b)}));
          T.tete(b[0], b[1], u[0], u[1], 8, {c: e.couleur, f: 'pointe'});
          if (e.nom) {
            const mi = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = dehors(mi, [-u[1], u[0]]);
            T.etiquette(mi[0], mi[1], e.nom, {dirs: [n, [-n[0], -n[1]]], dist: 4, fleche: e.fleche !== false});
          }
          break;
        }
        case 'rotation_fleche': {
          const c = Q(e.centre), p = Q(e.p), r = Math.hypot(p[0] - c[0], p[1] - c[1]), a0 = Math.atan2(-(p[1] - c[1]), p[0] - c[0]), a1 = a0 + e.angle * Math.PI / 180;
          const marge = Math.min(0.5, 7 / r) * (e.angle > 0 ? 1 : -1);
          T.arc(c[0], c[1], r, r, a0, a1 - marge * 0.6, {e: 1.2, t: '3 3', f: 'rotation'});
          const s = e.angle > 0 ? 1 : -1;
          T.tete(c[0] + r * Math.cos(a1), c[1] - r * Math.sin(a1), -Math.sin(a1) * s, -Math.cos(a1) * s, 7);
          break;
        }
        case 'texte': {
          const p = px([e.x, e.y]), taille = e.taille || TAILLE;
          if (e.pos != null) T.etiquette(p[0], p[1], e.texte, {dirs: [direction(e.pos)], dist: e.dist == null ? 5 : e.dist, taille});
          else T.texte(p[0], p[1] + 0.3 * taille, e.texte, {prio: 6, taille, ancre: e.ancre});
          break;
        }
        case 'sol': {
          const a = px([e.x1, e.y]), b = px([e.x2, e.y]);
          T.ligne(a[0], a[1], b[0], b[1], {e: 2, f: 'sol'});
          for (let x = a[0] + 6; x < b[0]; x += 10) T.ligne(x, a[1] + 1, x - 5, a[1] + 6, {e: 1});
          break;
        }
        case 'mur': {
          const a = px([e.x, e.y1]), b = px([e.x, e.y2]), s = e.cote === 'g' ? -1 : 1;
          T.ligne(a[0], a[1], b[0], b[1], {e: 2, f: 'mur'});
          for (let y = a[1] - 6; y > b[1]; y -= 10) T.ligne(a[0] + s, y, a[0] + 6 * s, y + 5, {e: 1});
          break;
        }
        case 'echelle': {
          const a = Q(e.a), b = Q(e.b), u = unite([b[0] - a[0], b[1] - a[1]]), n = [-u[1] * 2.5, u[0] * 2.5], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
          T.ligne(a[0] + n[0], a[1] + n[1], b[0] + n[0], b[1] + n[1], {e: 1.4, f: 'echelle', pts: nom(e.a) + ' ' + nom(e.b)});
          T.ligne(a[0] - n[0], a[1] - n[1], b[0] - n[0], b[1] - n[1], {e: 1.4});
          for (let d = 8; d < l - 4; d += 11) T.ligne(a[0] + u[0] * d + n[0], a[1] + u[1] * d + n[1], a[0] + u[0] * d - n[0], a[1] + u[1] * d - n[1], {e: 1, leger: true});
          break;
        }
        case 'baton': { const a = Q(e.a), b = Q(e.b); T.ligne(a[0], a[1], b[0], b[1], {e: 3.4, f: 'baton', pts: nom(e.a) + ' ' + nom(e.b)}); break; }
        case 'ombre': { const a = Q(e.a), b = Q(e.b); T.ligne(a[0], a[1] + 3, b[0], b[1] + 3, {e: 4, op: 0.35, f: 'ombre', leger: true}); break; }
        case 'immeuble': {
          const a = px([e.x, e.y]), b = px([e.x + e.l, e.y + e.h]), et = e.etages || 4, tr = e.travees || 2;
          T.poly([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], {ferme: true, f: 'immeuble'});
          const lw = (b[0] - a[0]) / tr, lh = (a[1] - b[1]) / et;
          for (let i = 0; i < tr; i++) for (let j = 0; j < et; j++) {
            const x = a[0] + (i + 0.3) * lw, y = b[1] + (j + 0.3) * lh;
            T.poly([[x, y], [x + lw * 0.4, y], [x + lw * 0.4, y + lh * 0.4], [x, y + lh * 0.4]], {ferme: true, e: 0.8, leger: true});
          }
          break;
        }
        case 'sapin': {
          const l = e.l || 0.45 * e.h, a = px([e.x, e.y]), t = px([e.x, e.y + 0.22 * e.h]), g = px([e.x - l / 2, e.y + 0.2 * e.h]), d = px([e.x + l / 2, e.y + 0.2 * e.h]), s = px([e.x, e.y + e.h]);
          T.ligne(a[0], a[1], t[0], t[1], {e: 3, f: 'tronc'});
          T.fond([g, d, s], 0.12);
          T.poly([g, d, s], {ferme: true, f: 'sapin'});
          break;
        }
        case 'observateur': {
          const a = px([e.x, e.y]), y = px([e.x, e.y + e.h]);
          T.ligne(a[0], a[1], y[0], y[1] + 4, {e: 2.4, f: 'observateur'});
          T.cercle(y[0], y[1], 4, {e: 1.4});
          break;
        }
        default: throw new Error('Élément inconnu dans une figure : ' + e.t);
      }
    }
  }

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
    const nommer = (p, texte, e) => T.etiquette(p[0], p[1], texte, {dirs: e && e.pos != null ? [direction(e.pos)] : [ROSE.no, ROSE.se, ROSE.n, ROSE.s, ROSE.ne, ROSE.so, ROSE.o, ROSE.e], dist: 5, taille: PETIT + 1, c: e && e.couleur});
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
          if (e.nom) T.etiquette(p[0], p[1], e.nom, {dirs: e.pos != null ? [direction(e.pos)] : HUIT, dist: 4});
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
          T.etiquette(p[0], p[1], e.nom || 'G', {dirs: e.pos != null ? [direction(e.pos)] : HUIT, dist: 6});
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

  /* ---------- Droite numérique ---------- */
  function droiteNumerique(T, desc, m) {
    const o = desc.options || {}, els = desc.elements || [];
    const min = o.min == null ? -5 : o.min, max = o.max == null ? 5 : o.max, pas = o.pas || pasJoli(max - min, 10);
    const lignes = 1 + Math.max.apply(null, [0].concat(els.map(e => e.ligne || 0)));
    const g = m[0] + 10, d = T.w - m[2] - 14;
    const X = x => g + (x - min) * (d - g) / (max - min);
    const yL = i => T.h / 2 + (i - (lignes - 1) / 2) * 50 + 2;
    const dec = decimales(pas);
    for (let i = 0; i < lignes; i++) {
      const y = yL(i);
      T.ligne(g - 10, y, d + 8, y, {e: 1.4, f: 'axe', leger: true});
      T.tete(d + 14, y, 1, 0, 7);
      const gr = graduations(min, max, pas), large = Math.max.apply(null, gr.map(v => longueur(nb(v, dec)))) * 0.6 * PETIT + 5;
      const saut = Math.max(1, Math.ceil(large / (pas * (d - g) / (max - min))));
      for (const v of gr) {
        T.ligne(X(v), y - 3, X(v), y + 3, {e: 1.2, leger: true});
        if (Math.round(v / pas) % saut === 0) T.texte(X(v), y + 17, nb(v, dec), {prio: 1, souple: true, taille: PETIT});
      }
      if (o.noms_lignes && o.noms_lignes[i]) T.texte(g - 10, y - 16, o.noms_lignes[i], {prio: 6, taille: PETIT + 1, ancre: 'start'});
    }
    const valeur = (x, y, texte) => T.texte(X(x), y + 17, texte == null ? nb(x) : texte, {prio: 3, taille: PETIT, repli: [0, 13]});
    const distance = (a, b, texte, y) => {
      const xa = X(a), xb = X(b), h = y - 15;
      T.ligne(xa + 5, h, xb - 5, h, {e: 1.2, f: 'distance'});
      T.tete(xa, h, -1, 0, 6);
      T.tete(xb, h, 1, 0, 6);
      if (texte != null) T.etiquette((xa + xb) / 2, h, texte, {dirs: [ROSE.n], dist: 3, taille: PETIT + 1});
    };
    const intervalle = (e, y) => {
      const xa = e.a == null ? g - 10 : X(e.a), xb = e.b == null ? d + 4 : X(e.b);
      T.ligne(xa, y, xb, y, {e: 4, f: 'intervalle'});
      if (e.a != null) { T.crochet(xa, y, e.ouvert_a ? -1 : 1); if (e.valeurs !== false) valeur(e.a, y); }
      if (e.b != null) { T.crochet(xb, y, e.ouvert_b ? 1 : -1); if (e.valeurs !== false) valeur(e.b, y); }
    };
    const point = (e, y) => {
      T.disque(X(e.x), y, 3, {f: 'point'});
      if (e.nom) T.etiquette(X(e.x), y, e.nom, {dirs: [ROSE.n, ROSE.ne, ROSE.no], dist: 6});
      if (e.valeur !== false) valeur(e.x, y, typeof e.valeur === 'string' ? e.valeur : null);
    };
    for (const e of els) {
      const y = yL(e.ligne || 0);
      switch (e.t) {
        case 'point': point(e, y); break;
        case 'intervalle': intervalle(e, y); break;
        case 'distance': distance(e.a, e.b, e.texte, y); break;
        case 'centre_rayon': {
          intervalle({a: e.a - e.r, b: e.a + e.r}, y);
          point({x: e.a, nom: e.nom}, y);
          const texte = e.texte == null ? nb(e.r) : e.texte;
          distance(e.a - e.r, e.a, texte, y);
          distance(e.a, e.a + e.r, texte, y);
          break;
        }
        case 'texte': T.texte(X(e.x), y - 22, e.texte, {prio: 6, taille: PETIT + 1}); break;
        default: throw new Error('Élément inconnu sur une droite numérique : ' + e.t);
      }
    }
  }

  /* ---------- Solides en perspective cavalière (45°, coefficient 0,5) ---------- */
  const FUITE = 0.5 * R2;
  const projeter = p => [p[0] + FUITE * p[1], p[2] + FUITE * p[1]];

  function espaceVersPlan(desc) {
    const out = [], noms3 = {};
    let auto = 0;
    const cree = (p3, nom, extra) => {
      const n = nom || '_' + (++auto);
      noms3[n] = p3;
      const p = projeter(p3);
      out.push(Object.assign({t: 'point', nom: n, x: p[0], y: p[1]}, extra || {}));
      return n;
    };
    const ref = r => (Array.isArray(r) ? projeter(r) : r);
    const seg = (a, b, cache) => out.push({t: 'segment', a, b, pointilles: !!cache, fin: !!cache});
    const cote = (a, b, texte, pos) => { if (texte != null && texte !== '') out.push({t: 'cote', a, b, texte: String(texte), pos}); };
    const dec = (e, p) => { const og = e.origine || [0, 0, 0]; return [p[0] + og[0], p[1] + og[1], p[2] + og[2]]; };
    const pyramide = (e, hauteur) => {
      const c = e.c, h = e.h, n = e.noms || [], cs = e.cotes || [];
      const A = cree(dec(e, [0, 0, 0]), n[0], {pos: ['so', 'o']}), B = cree(dec(e, [c, 0, 0]), n[1], {pos: ['se', 's']}), C = cree(dec(e, [c, c, 0]), n[2], {pos: ['e', 'ne']}), D = cree(dec(e, [0, c, 0]), n[3], {pos: ['o', 'no']});
      const S = cree(dec(e, [c / 2, c / 2, h]), n[4], {pos: ['n']}), H = cree(dec(e, [c / 2, c / 2, 0]), n[5], {pos: ['s', 'se', 'so']});
      seg(A, B); seg(B, C); seg(S, A); seg(S, B); seg(S, C);
      seg(A, D, true); seg(D, C, true); seg(S, D, true);
      if (hauteur) {
        seg(S, H, true); seg(A, C, true); seg(B, D, true);
        out.push({t: 'angle_droit', sommet: H, p: S, q: B, taille: 6});
        if (cs[1] != null) { const s2 = projeter(dec(e, [c / 2, c / 2, h])), c2 = projeter(dec(e, [c, c, 0])); out.push({t: 'cote_fleche', a: [c2[0], s2[1] - h], b: [c2[0], s2[1]], texte: String(cs[1]), pos: 'e', decalage: 20}); }
      }
      cote(A, B, cs[0], 's');
      return {A, B, C, D, S, H};
    };
    for (const e of desc.elements || []) {
      switch (e.t) {
        case 'cube':
        case 'pave': {
          const L = e.t === 'cube' ? e.a : e.L, l = e.t === 'cube' ? e.a : e.l, h = e.t === 'cube' ? e.a : e.h, n = e.noms || [], cs = e.cotes || [];
          const v = [[0, 0, 0], [L, 0, 0], [L, l, 0], [0, l, 0], [0, 0, h], [L, 0, h], [L, l, h], [0, l, h]].map((p, i) => cree(dec(e, p), n[i], {pos: [['so'], ['se'], ['e'], ['no', 'o'], ['o'], ['se', 'e'], ['ne'], ['no']][i]}));
          [[0, 1], [1, 5], [5, 4], [4, 0], [1, 2], [2, 6], [6, 5], [4, 7], [7, 6]].forEach(a => seg(v[a[0]], v[a[1]]));
          [[0, 3], [3, 2], [3, 7]].forEach(a => seg(v[a[0]], v[a[1]], true));
          cote(v[0], v[1], cs[0], 's'); cote(v[1], v[2], cs[1], 'se'); cote(v[0], v[4], cs[2], 'o');
          break;
        }
        case 'pyramide_carree': pyramide(e, true); break;
        case 'section_pyramide': {
          const q = pyramide(e, e.hauteur !== false), c = e.c, h = e.h, k = e.k, n = e.noms_section || [];
          const s = [c / 2, c / 2, h], coin = p => cree(dec(e, [s[0] + k * (p[0] - s[0]), s[1] + k * (p[1] - s[1]), h * (1 - k)]), n.shift());
          const a = coin([0, 0]), b = coin([c, 0]), cc = coin([c, c]), d = coin([0, c]);
          out.push({t: 'polygone', points: [a, b, cc, d], plein: 0.14, sans_contour: true});
          seg(a, b); seg(b, cc); seg(cc, d, true); seg(d, a, true);
          if (e.cotes && e.cotes[2] != null) cote(a, b, e.cotes[2], 'n');
          void q;
          break;
        }
        case 'cylindre': {
          const r = e.r, h = e.h, cs = e.cotes || [], og = projeter(e.origine || [0, 0, 0]), O = [og[0], og[1]], S = [og[0], og[1] + h];
          out.push({t: 'ellipse', centre: O, rx: r, ry: 0.3 * r, arriere: true}, {t: 'ellipse', centre: S, rx: r, ry: 0.3 * r});
          out.push({t: 'segment', a: [O[0] - r, O[1]], b: [S[0] - r, S[1]]}, {t: 'segment', a: [O[0] + r, O[1]], b: [S[0] + r, S[1]]});
          out.push({t: 'point', nom: '_c' + (++auto), x: S[0], y: S[1], marque: true}, {t: 'segment', a: S, b: [S[0] + r, S[1]], fin: true});
          cote([S[0], S[1] + 0.3 * r], [S[0] + r, S[1] + 0.3 * r], cs[0], 'n'); cote([O[0] + r, O[1]], [S[0] + r, S[1]], cs[1], 'e');
          break;
        }
        case 'cone': {
          const r = e.r, h = e.h, cs = e.cotes || [], og = projeter(e.origine || [0, 0, 0]), O = [og[0], og[1]], S = [og[0], og[1] + h];
          out.push({t: 'ellipse', centre: O, rx: r, ry: 0.3 * r, arriere: true});
          out.push({t: 'segment', a: [O[0] - r, O[1]], b: S}, {t: 'segment', a: [O[0] + r, O[1]], b: S});
          out.push({t: 'segment', a: O, b: S, pointilles: true, fin: true}, {t: 'segment', a: O, b: [O[0] + r, O[1]], pointilles: true, fin: true});
          out.push({t: 'angle_droit', sommet: O, p: S, q: [O[0] + r, O[1]], taille: 7});
          cote([O[0], O[1] - 0.3 * r], [O[0] + r, O[1] - 0.3 * r], cs[0], 's'); cote(O, S, cs[1], ['o', 'e']);
          break;
        }
        case 'boule': {
          const r = e.r, cs = e.cotes || [], O = projeter(e.centre || [0, 0, 0]);
          out.push({t: 'cercle', centre: O, rayon: r}, {t: 'ellipse', centre: O, rx: r, ry: 0.3 * r, arriere: true});
          out.push({t: 'point', nom: '_c' + (++auto), x: O[0], y: O[1], marque: true}, {t: 'segment', a: O, b: [O[0] + r, O[1]], pointilles: true, fin: true});
          cote([O[0], O[1] + 0.3 * r], [O[0] + r, O[1] + 0.3 * r], cs[0], ['n', 's']);
          break;
        }
        case 'point': cree([e.x, e.y, e.z], e.nom, {pos: e.pos, marque: e.marque, muet: e.muet}); break;
        case 'texte': { const p = projeter([e.x, e.y, e.z]); out.push({t: 'texte', x: p[0], y: p[1], texte: e.texte, pos: e.pos}); break; }
        case 'polygone': out.push(Object.assign({}, e, {points: e.points.map(ref)})); break;
        default: {
          const c = Object.assign({}, e);
          for (const k of ['a', 'b', 'sommet', 'p', 'q']) if (c[k] != null) c[k] = ref(c[k]);
          out.push(c);
        }
      }
    }
    return {options: desc.options, elements: out};
  }

  /* ---------- Arbre pondéré ---------- */
  function feuillesDe(n) { return n.enfants && n.enfants.length ? n.enfants.reduce((s, c) => s + feuillesDe(c), 0) : 1; }
  function profondeur(n) { return n.enfants && n.enfants.length ? 1 + Math.max.apply(null, n.enfants.map(profondeur)) : 0; }

  function arbre(T, desc, m) {
    const copie = n => ({nom: n.nom, p: n.p, feuille: n.feuille, epais: n.epais, enfants: (n.enfants || []).map(copie)});
    const o = desc.options || {}, racine = {enfants: (desc.niveaux || []).map(copie)};
    const total = feuillesDe(racine), prof = profondeur(racine);
    const chemins = (o.chemins || (o.chemin ? [o.chemin] : [])).map(c => c.join('\u0001'));
    const colonne = (T.w - m[0] - m[2] - 8) / prof, ligne = (T.h - m[1] - m[3]) / total;
    let rang = 0;
    const feuilles = [];
    (function poser(n, d) {
      n._x = m[0] + 4 + d * colonne;
      if (n.enfants && n.enfants.length) { n.enfants.forEach(c => poser(c, d + 1)); n._y = n.enfants.reduce((s, c) => s + c._y, 0) / n.enfants.length; }
      else { n._y = m[1] + (rang++ + 0.5) * ligne; feuilles.push(n); }
    })(racine, 0);
    const demi = n => (n.nom == null ? 0 : 0.3 * TAILLE * longueur(n.nom) + 5);
    T.disque(racine._x, racine._y, 2.4);
    (function dessiner(n, piste) {
      (n.enfants || []).forEach(c => {
        const suite = piste.concat([c.nom]), cle = suite.join('\u0001');
        const epais = c.epais || chemins.some(ch => ch === cle || ch.indexOf(cle + '\u0001') === 0);
        const a = [n._x + (n === racine ? 4 : demi(n)), n._y], b = [c._x - demi(c), c._y];
        T.ligne(a[0], a[1], b[0], b[1], {e: epais ? 3.4 : 1.4, f: epais ? 'branche chemin' : 'branche'});
        if (c.nom != null) T.texte(c._x, c._y + 5, c.nom, {prio: 6, gras: epais});
        if (c.p != null) {
          const u = unite([b[0] - a[0], b[1] - a[1]]), haut = [u[1], -u[0]], n1 = b[1] > a[1] + 1 ? [-haut[0], -haut[1]] : haut;
          T.etiquette(a[0] + (b[0] - a[0]) * 0.5, a[1] + (b[1] - a[1]) * 0.5, c.p, {dirs: [n1, [-n1[0], -n1[1]]], dist: 3, taille: PETIT});
        }
        dessiner(c, suite);
      });
    })(racine, []);
    feuilles.forEach((f, i) => {
      const texte = f.feuille != null ? f.feuille : (o.feuilles || [])[i];
      if (texte != null) T.texte(f._x + demi(f) + 6, f._y + 4.5, texte, {prio: 6, taille: PETIT, ancre: 'start'});
    });
  }

  /* ---------- Diagrammes statistiques ---------- */
  const arcPoints = (c, r, a1, a2, n) => { const out = []; for (let i = 0; i <= n; i++) { const a = a1 + (a2 - a1) * i / n; out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } return out; };
  const plafond = (v, pas) => Math.ceil(v / pas - 1e-9) * pas;

  function statistiquesVers(desc) {
    const e = (desc.elements || [])[0], o = Object.assign({}, desc.options || {});
    if (!e) throw new Error('Diagramme statistique vide');
    const els = [];
    const base = (extra) => ({type: 'repere', options: Object.assign({origine: false, nom_x: e.nom_x || '', nom_y: e.nom_y || ''}, extra, o), elements: els});
    switch (e.t) {
      case 'diagramme_barres': {
        const n = e.categories.length, tous = e.valeurs.concat(e.valeurs2 || []), pas = e.pas_y || pasJoli(Math.max.apply(null, tous), 5), deux = !!e.valeurs2;
        e.categories.forEach((c, i) => {
          els.push({t: 'rect', x1: i + (deux ? 0.14 : 0.2), y1: 0, x2: i + (deux ? 0.5 : 0.8), y2: e.valeurs[i], plein: true});
          if (deux) els.push({t: 'rect', x1: i + 0.5, y1: 0, x2: i + 0.86, y2: e.valeurs2[i], hachures: true});
          els.push({t: 'etiquette_x', x: i + 0.5, texte: String(c)});
          if (e.valeurs_affichees && !deux) els.push({t: 'texte', x: i + 0.5, y: e.valeurs[i], texte: nb(e.valeurs[i]), pos: 'n', taille: PETIT});
        });
        if (deux && e.noms_series) els.push({t: 'legende', position: e.legende, entrees: [{forme: 'plein', texte: e.noms_series[0]}, {forme: 'hachures', texte: e.noms_series[1]}]});
        return base({xmin: 0, xmax: n, ymin: 0, ymax: e.ymax || plafond(Math.max.apply(null, tous) * (deux && e.noms_series ? 1.25 : 1.02), pas), pas_y: pas, grille: 'y', graduations_x: false});
      }
      case 'diagramme_batons': {
        const tous = e.probabilites.concat(e.observe || []), pas = e.pas_y || pasJoli(Math.max.apply(null, tous), 5), deux = !!e.observe;
        e.valeurs.forEach((x, i) => {
          els.push({t: 'baton', x, y: e.probabilites[i], decalage: deux ? -3 : 0});
          if (deux) els.push({t: 'baton', x, y: e.observe[i], decalage: 4, pointilles: true});
        });
        if (deux) { const ns = e.noms_series || ['modèle', 'observé']; els.push({t: 'legende', position: e.legende, entrees: [{forme: 'trait', texte: ns[0]}, {forme: 'tirets', texte: ns[1]}]}); }
        const xs = e.valeurs.slice().sort((a, b) => a - b), ecart = xs.length > 1 ? xs[1] - xs[0] : 1;
        return base({xmin: xs[0] - 0.7 * ecart, xmax: xs[xs.length - 1] + 0.7 * ecart, ymin: 0, ymax: e.ymax || plafond(Math.max.apply(null, tous) * (deux ? 1.3 : 1.02), pas), pas_y: pas, pas_x: ecart, valeurs_x: xs, grille: 'y', axe_y: 'gauche', coupure: false});
      }
      case 'histogramme': {
        const pas = e.pas_y || pasJoli(Math.max.apply(null, e.effectifs), 5), b = e.bornes;
        e.effectifs.forEach((v, i) => els.push({t: 'rect', x1: b[i], y1: 0, x2: b[i + 1], y2: v, plein: true}));
        return base({xmin: b[0], xmax: b[b.length - 1], ymin: 0, ymax: e.ymax || plafond(Math.max.apply(null, e.effectifs) * 1.02, pas), pas_y: pas, pas_x: b[1] - b[0], valeurs_x: b, grille: 'y'});
      }
      case 'courbe_indices': {
        const n = e.dates.length, ref = e.base == null ? 100 : e.base, tous = e.indices.concat([ref]);
        const pas = e.pas_y || pasJoli(Math.max.apply(null, tous) - Math.min.apply(null, tous), 4);
        const ymin = Math.floor(Math.min.apply(null, tous) / pas + 1e-9) * pas - pas, ymax = plafond(Math.max.apply(null, tous), pas) + pas;
        e.dates.forEach((d, i) => els.push({t: 'etiquette_x', x: i + 0.5, texte: String(d)}));
        els.push({t: 'segment', x1: 0, y1: ref, x2: n, y2: ref, pointilles: true, fin: true});
        els.push({t: 'texte', x: n, y: ref, texte: 'base ' + nb(ref), pos: 'no', taille: PETIT});
        els.push({t: 'ligne_brisee', points: e.indices.map((v, i) => [i + 0.5, v])});
        return base({xmin: 0, xmax: n, ymin: Math.max(0, ymin), ymax, pas_y: pas, grille: 'y', graduations_x: false, nom_y: e.nom_y || 'indice'});
      }
      case 'boite': {
        const bs = e.boites || [e], tous = [];
        bs.forEach(b => tous.push(b.min, b.max));
        const lo = Math.min.apply(null, tous), hi = Math.max.apply(null, tous), pas = e.pas || pasJoli(hi - lo, 6);
        bs.forEach((b, i) => els.push({t: 'boite', min: b.min, q1: b.q1, med: b.med, q3: b.q3, max: b.max, y: bs.length - i - 0.5 - (bs.length === 1 ? 0.12 : 0), demi: bs.length === 1 ? 0.22 : 0.26, nom: b.nom, valeurs: e.valeurs}));
        return base({xmin: e.xmin != null ? e.xmin : Math.floor(lo / pas + 1e-9) * pas, xmax: e.xmax != null ? e.xmax : plafond(hi, pas), ymin: 0, ymax: bs.length, pas_x: pas, axe_y: false, grille: 'x', hauteur: o.hauteur || (bs.length === 1 ? 120 : 170)});
      }
      case 'diagramme_circulaire': {
        const total = e.secteurs.reduce((s, c) => s + (c.angle != null ? c.angle : c.valeur), 0), parValeur = e.secteurs[0].angle == null;
        let a = e.depart == null ? 90 : e.depart;
        els.push({t: 'cercle', centre: [0, 0], rayon: 1});
        for (const c of e.secteurs) {
          const ang = parValeur ? 360 * c.valeur / total : c.angle, r0 = a * Math.PI / 180, mi = a - ang / 2;
          els.push({t: 'segment', a: [0, 0], b: [Math.cos(r0), Math.sin(r0)]});
          if (e.angles !== false) els.push({t: 'texte', x: 0.6 * Math.cos(mi * Math.PI / 180), y: 0.6 * Math.sin(mi * Math.PI / 180), texte: nb(ang, 1) + '°', taille: PETIT});
          if (c.nom) els.push({t: 'texte', x: Math.cos(mi * Math.PI / 180), y: Math.sin(mi * Math.PI / 180), texte: c.nom, pos: ((mi % 360) + 360) % 360, taille: PETIT + 1});
          a -= ang;
        }
        return {type: 'figure', options: Object.assign({marge: 30}, o), elements: els};
      }
      case 'diagramme_venn': {
        const r = 1, d = 1.1, cA = [-d / 2, 0], cB = [d / 2, 0], th = Math.acos(d / 2 / r), N = 28, PI = Math.PI;
        const lentille = arcPoints(cA, r, -th, th, N).concat(arcPoints(cB, r, PI - th, PI + th, N));
        const union = arcPoints(cA, r, th, 2 * PI - th, 2 * N).concat(arcPoints(cB, r, -(PI - th), PI - th, 2 * N));
        const cadre = [[-2.1, -1.45], [2.1, -1.45], [2.1, 1.45], [-2.1, 1.45]];
        const zones = {inter: lentille, union, A: arcPoints(cA, r, 0, 2 * PI, 3 * N), B: arcPoints(cB, r, 0, 2 * PI, 3 * N),
          A_seul: arcPoints(cA, r, th, 2 * PI - th, 2 * N).concat(arcPoints(cB, r, PI + th, PI - th, N)),
          B_seul: arcPoints(cB, r, -(PI - th), PI - th, 2 * N).concat(arcPoints(cA, r, th, -th, N))};
        if (e.zone === 'hors') els.push({t: 'polygone', points: cadre, trou: union, plein: 0.16, sans_contour: true});
        else if (zones[e.zone]) els.push({t: 'polygone', points: zones[e.zone], plein: 0.16, sans_contour: true});
        els.push({t: 'polygone', points: cadre}, {t: 'cercle', centre: cA, rayon: r}, {t: 'cercle', centre: cB, rayon: r});
        els.push({t: 'texte', x: cA[0] - 0.75, y: 0.75, texte: e.nom_a || 'A', pos: 'no', dist: 1}, {t: 'texte', x: cB[0] + 0.75, y: 0.75, texte: e.nom_b || 'B', pos: 'ne', dist: 1});
        const ef = e.effectifs || {};
        const ecrire = (x, y, v) => { if (v != null) els.push({t: 'texte', x, y, texte: typeof v === 'number' ? nb(v) : v, taille: PETIT + 1}); };
        ecrire(-1.0, 0, ef.a_seul); ecrire(0, 0, ef.inter); ecrire(1.0, 0, ef.b_seul); ecrire(1.6, -1.12, ef.hors);
        if (e.univers) els.push({t: 'texte', x: -1.85, y: 1.15, texte: e.univers, taille: PETIT + 1});
        return {type: 'figure', options: Object.assign({marge: 8}, o), elements: els};
      }
      default: throw new Error('Diagramme inconnu : ' + e.t);
    }
  }

  /* ---------- Triangle de Pascal ---------- */
  function pascal(T, desc) {
    const o = desc.options || {}, n = o.n, pasX = 30, pasY = 24;
    const cx = T.w / 2 + 22, y0 = T.h / 2 - n * pasY / 2 + 5;
    let ligne = [1];
    for (let i = 0; i <= n; i++) {
      const y = y0 + i * pasY, surligne = o.ligne === i;
      T.texte(cx - (n / 2) * pasX - 28, y, 'n\u00a0=\u00a0' + i, {prio: 6, taille: PETIT, ancre: 'end'});
      ligne.forEach((v, k) => {
        const x = cx + (k - i / 2) * pasX, vise = o.coefficient && o.coefficient[0] === i && o.coefficient[1] === k;
        T.texte(x, y, String(v), {prio: 6, gras: surligne || vise, taille: PETIT + 1});
        if (vise) T.cercle(x, y - 4.5, 12, {e: 1.6, f: 'coefficient', leger: true});
      });
      if (surligne) {
        const xa = cx - (i / 2) * pasX - 14, xb = cx + (i / 2) * pasX + 14;
        T.poly([[xa, y - 15], [xb, y - 15], [xb, y + 6], [xa, y + 6]], {ferme: true, e: 1.4, f: 'ligne', leger: true});
      }
      const suivante = [1];
      for (let k = 1; k <= i; k++) suivante.push(ligne[k - 1] + ligne[k]);
      suivante.push(1);
      ligne = suivante;
    }
  }

  /* ---------- Tracé d'un programme (lutin) ---------- */
  function traceVersPlan(desc) {
    const o = desc.options || {}, n = o.cotes, pas = o.longueur || 1, s = o.sens === 'droite' ? -1 : 1, els = [];
    let x = 0, y = 0, cap = 0;
    const pts = [[0, 0]];
    for (let i = 0; i < n; i++) {
      x += pas * Math.cos(cap * Math.PI / 180); y += pas * Math.sin(cap * Math.PI / 180);
      pts.push([Math.round(x * 1e9) / 1e9, Math.round(y * 1e9) / 1e9]);
      cap += s * o.angle;
    }
    for (let i = 0; i < n; i++) els.push({t: 'segment', a: pts[i], b: pts[i + 1]});
    els.push({t: 'sens', a: pts[0], b: pts[1]});
    els.push({t: 'point', nom: '_d', x: 0, y: 0, marque: true}, {t: 'texte', x: 0, y: 0, texte: o.depart || 'départ', pos: s > 0 ? 'so' : 'no', taille: PETIT});
    if (o.cote != null) els.push({t: 'cote', a: pts[0], b: pts[1], texte: String(o.cote), pos: s > 0 ? 's' : 'n'});
    return {options: {largeur: o.largeur, hauteur: o.hauteur, marge: o.marge}, elements: els};
  }

  /* ---------- Rendu ---------- */
  const RENDUS = {
    figure: geo,
    repere,
    droite_numerique: droiteNumerique,
    espace: (T, d, m) => geo(T, espaceVersPlan(d), m),
    arbre,
    statistiques: (T, d, m) => { const r = statistiquesVers(d); return RENDUS[r.type](T, r, m); },
    pascal,
    programme_trace: (T, d, m) => geo(T, traceVersPlan(d), m)
  };

  function dimensions(desc) {
    const o = desc.options || {};
    let w = 320, h = 200;
    switch (desc.type) {
      case 'droite_numerique': h = 96 + 50 * Math.max.apply(null, [0].concat((desc.elements || []).map(e => e.ligne || 0))); break;
      case 'arbre': { const r = {enfants: desc.niveaux || []}; h = Math.max(110, feuillesDe(r) * 30 + 44); w = profondeur(r) > 2 ? 400 : 320; break; }
      case 'pascal': w = Math.max(320, (o.n + 1) * 30 + 120); h = (o.n + 1) * 24 + 24; break;
      case 'statistiques': { const e = (desc.elements || [])[0]; if (e && e.t === 'boite') h = (e.boites || [e]).length === 1 ? 120 : 170; if (e && e.t === 'diagramme_venn') h = 210; break; }
      default:
    }
    return [o.largeur || w, o.hauteur || h];
  }

  function construire(desc) {
    if (!desc || !RENDUS[desc.type]) throw new Error('Type de figure inconnu : ' + (desc && desc.type));
    const o = desc.options || {}, dim = dimensions(desc), base = o.marge == null ? (desc.type === 'statistiques' && desc.elements[0] && /venn|circulaire/.test(desc.elements[0].t) ? (desc.elements[0].t === 'diagramme_venn' ? 8 : 30) : MARGE) : o.marge;
    const m = [base, base, base, base];
    let toile;
    for (let passe = 0; passe < 6; passe++) {
      toile = new Toile(dim[0], dim[1]);
      RENDUS[desc.type](toile, desc, m);
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
      const toiles = desc.figures.map(construire), ecart = 12, sous = desc.figures.some(f => f.titre);
      const haut = Math.max.apply(null, toiles.map(t => t.h));
      let x = 0;
      corps = '';
      toiles.forEach((t, i) => {
        corps += '<g data-panneau="' + (i + 1) + '" transform="translate(' + P(x) + ' 0)">' + t.corps() + '</g>';
        if (desc.figures[i].titre) corps += '<text x="' + P(x + t.w / 2) + '" y="' + P(haut + 13) + '" fill="currentColor" font-size="' + (PETIT + 1) + '" text-anchor="middle" data-sous-titre="' + (i + 1) + '">' + ech(typo(desc.figures[i].titre)) + '</text>';
        x += t.w + ecart;
      });
      w = x - ecart; h = haut + (sous ? 20 : 0);
    } else { const t = construire(desc); w = t.w; h = t.h; corps = t.corps(); }
    const titre = ech(typo(desc.titre || ''));
    return '<svg viewBox="0 0 ' + P(w) + ' ' + P(h) + '" width="' + P(w) + '" height="' + P(h) + '" role="img" aria-labelledby="' + id + (desc.description ? ' ' + id + '-d' : '') + '">'
      + '<title id="' + id + '">' + titre + '</title>' + (desc.description ? '<desc id="' + id + '-d">' + ech(typo(desc.description)) + '</desc>' : '') + corps + '</svg>';
  }

  const identifiant = (desc, o) => (o && o.id) || 'fig-' + empreinte(desc);
  function svg(desc, o) { return assembler(desc, identifiant(desc, o)); }
  function html(desc, o) {
    return '<figure class="' + ((o && o.classe) || 'lesson-figure') + '">' + svg(desc, o) + '<figcaption>' + ech(typo(desc.titre || '')) + '</figcaption></figure>';
  }

  /* ---------- Constructeurs : Figures.repere('Titre', {…}).courbe('x^2').point(2, 4, 'A').html() ---------- */
  const SIGNATURES = {
    figure: {
      point: ['nom', 'x', 'y'], segment: ['a', 'b'], polygone: ['points'], droite: ['a', 'b'], demi_droite: ['a', 'b'],
      cercle: ['centre', 'rayon'], arc_cercle: ['centre', 'rayon', 'debut', 'fin'], ellipse: ['centre', 'rx', 'ry'],
      angle_droit: ['sommet', 'p', 'q'], angle: ['sommet', 'p', 'q'], cote: ['a', 'b', 'texte'], cote_fleche: ['a', 'b', 'texte'],
      codage: ['a', 'b', 'n'], parallele: ['a', 'b'], sens: ['a', 'b'], vecteur: ['a', 'b', 'nom'], rotation_fleche: ['centre', 'p', 'angle'],
      texte: ['x', 'y', 'texte'], hachures: ['points'], sol: ['x1', 'x2', 'y'], mur: ['x', 'y1', 'y2'], echelle: ['a', 'b'],
      baton: ['a', 'b'], ombre: ['a', 'b'], immeuble: ['x', 'y', 'l', 'h'], sapin: ['x', 'y', 'h'], observateur: ['x', 'y', 'h'], rampe: ['points']
    },
    repere: {
      courbe: ['f'], droite_affine: ['m', 'p'], droite_verticale: ['c'], asymptote_h: ['y'], asymptote_v: ['x'],
      point: ['x', 'y', 'nom'], nuage: ['points'], point_moyen: ['x', 'y', 'nom'], lecture: ['x', 'y'], antecedents: ['k'],
      tangente: ['f', 'a'], secante: ['f', 'a', 'b'], escalier: ['x', 'y', 'dx', 'dy'], zone_signe: ['a', 'b', 'texte'],
      intervalle_solutions: ['a', 'b'], suite_points: ['u', 'n0', 'n1'], vecteur: ['x1', 'y1', 'x2', 'y2', 'nom'], texte: ['x', 'y', 'texte'],
      segment: ['x1', 'y1', 'x2', 'y2'], polygone: ['points'], rect: ['x1', 'y1', 'x2', 'y2'], ligne_brisee: ['points'],
      baton: ['x', 'y'], etiquette_x: ['x', 'texte'], legende: ['entrees'], boite: ['min', 'q1', 'med', 'q3', 'max']
    },
    droite_numerique: {point: ['x', 'nom'], intervalle: ['a', 'b'], distance: ['a', 'b', 'texte'], centre_rayon: ['a', 'r'], texte: ['x', 'texte']},
    espace: {
      pave: ['L', 'l', 'h'], cube: ['a'], pyramide_carree: ['c', 'h'], cylindre: ['r', 'h'], cone: ['r', 'h'], boule: ['r'], section_pyramide: ['c', 'h', 'k'],
      point: ['nom', 'x', 'y', 'z'], segment: ['a', 'b'], polygone: ['points'], cote: ['a', 'b', 'texte'], angle_droit: ['sommet', 'p', 'q'], texte: ['x', 'y', 'z', 'texte']
    },
    statistiques: {
      diagramme_barres: ['categories', 'valeurs'], diagramme_batons: ['valeurs', 'probabilites'], histogramme: ['bornes', 'effectifs'],
      boite: ['min', 'q1', 'med', 'q3', 'max'], diagramme_circulaire: ['secteurs'], courbe_indices: ['dates', 'indices'], diagramme_venn: ['nom_a', 'nom_b', 'effectifs']
    }
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

  return {
    svg, html, fonction, nombre: nb, typographie: typo, SIGNATURES,
    figure: constructeur('figure'),
    repere: constructeur('repere'),
    droite_numerique: constructeur('droite_numerique'),
    espace: constructeur('espace'),
    statistiques: constructeur('statistiques'),
    arbre: (titre, niveaux, options) => sorties({type: 'arbre', titre, niveaux, options: options || {}}),
    pascal: (titre, n, options) => sorties({type: 'pascal', titre, options: Object.assign({n}, options || {})}),
    programme_trace: (titre, cotes, angle, options) => sorties({type: 'programme_trace', titre, options: Object.assign({cotes, angle}, options || {})}),
    groupe: (titre, figures) => sorties({type: 'groupe', titre, figures: figures.map(f => (f && typeof f.description === 'function' ? f.description() : f))})
  };
});
