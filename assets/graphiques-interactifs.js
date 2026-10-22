/* Graphiques interactifs pour les cours de Première STMG.
   SVG et JavaScript natifs ; aucune dépendance ni collecte de données.
   Fonctions de calcul exposées pour les tests de régression mathématique. */
(() => {
  'use strict';

  const svgNS = 'http://www.w3.org/2000/svg';
  const fmt = value => Number.isFinite(value)
    ? String(Math.round((value + Number.EPSILON) * 100) / 100).replace('.', ',')
    : 'non défini';
  const sign = value => value < 0 ? '− ' + fmt(-value) : '+ ' + fmt(value);
  const affine = (p, x) => p.a * x + p.b;
  const quadratic = (p, x) => p.a * (x - p.h) ** 2 + p.k;
  const arithmetic = (p, n) => p.u0 + p.r * n;
  const geometric = (p, n) => p.v0 * p.q ** n;
  const curve = x => (x - 1) ** 2 - 2;
  const slope = t => 2 * (t - 1);
  const tangent = (t, x) => curve(t) + slope(t) * (x - t);
  const roots = p => {
    if (p.a === 0) return [];
    const squared = -p.k / p.a;
    if (squared < 0) return [];
    if (squared === 0) return [p.h];
    const delta = Math.sqrt(squared);
    return [p.h - delta, p.h + delta];
  };

  const configurations = {
    affine: {
      title: 'Manipuler une droite', description: 'Bouge les paramètres : la courbe, les images et les antécédents changent ensemble.',
      parameters: [
        {key: 'a', label: 'Pente a', type: 'range', min: -3, max: 3, step: .5, value: 1},
        {key: 'b', label: 'Ordonnée à l’origine b', type: 'range', min: -4, max: 4, step: .5, value: 1}
      ],
      domain: [-6, 6], extent: [-10, 10], calculate: affine,
      explanation: p => {
        let antecedent = 'Si a = 0 et b ≠ 0, zéro n’a pas d’antécédent.';
        if (p.a !== 0) antecedent = 'Antécédent de 0 : x = ' + fmt(-p.b / p.a) + '.';
        else if (p.b === 0) antecedent = 'Tous les réels sont antécédents de 0.';
        const direction = p.a > 0 ? 'croissante' : p.a < 0 ? 'décroissante' : 'constante';
        return 'f(x) = ' + fmt(p.a) + 'x ' + sign(p.b) + '. f(2) = ' +
          fmt(affine(p, 2)) + '. La fonction est ' + direction + '. ' + antecedent;
      },
      questions: p => [
        {text: 'Calcule l’image f(2) avec ces paramètres.', answer: affine(p, 2)},
        {text: 'Quelle est l’image de 0, c’est-à-dire f(0) ?', answer: p.b},
        p.a === 0
          ? {text: 'La droite est horizontale. Quelle est l’image de −1 ?', answer: affine(p, -1)}
          : {text: 'Quel est l’antécédent de 0 ? (au centième si nécessaire)', answer: -p.b/p.a}
      ],
      markers: p => [{x: 2, y: affine(p, 2), label: 'f(2)'}]
        .concat(p.a !== 0 ? [{x: -p.b / p.a, y: 0, label: 'zéro'}] : [])
    },
    second: {
      title: 'Déplacer une parabole', description: 'Observe le sommet, l’ouverture et les éventuelles racines. On utilise f(x) = a(x − h)² + k.',
      parameters: [
        {key: 'a', label: 'Ouverture a', type: 'select', options: [-2, -1, -.5, .5, 1, 2], value: 1},
        {key: 'h', label: 'Abscisse h du sommet', type: 'range', min: -3, max: 3, step: .5, value: 1},
        {key: 'k', label: 'Hauteur k du sommet', type: 'range', min: -4, max: 4, step: .5, value: -2}
      ],
      domain: [-6, 6], extent: [-10, 10], calculate: quadratic,
      explanation: p => {
        const r = roots(p);
        const rootText = r.length === 0 ? 'Aucune racine réelle.' :
          r.length === 1 ? 'La courbe touche l’axe en x = ' + fmt(r[0]) + '.' :
          'Racines : x ≈ ' + fmt(r[0]) + ' et x ≈ ' + fmt(r[1]) + '.';
        const direction = p.a > 0 ? 'un minimum' : 'un maximum';
        const outside = p.a > 0 ? 'positive' : 'négative';
        const inside = p.a > 0 ? 'négative' : 'positive';
        const signInfo = r.length === 0
          ? 'La fonction garde un signe ' + outside + ' partout.'
          : r.length === 1
            ? 'Elle vaut zéro au sommet et reste ' + outside + ' ailleurs.'
            : 'Elle est ' + inside + ' entre les racines et ' + outside +
              ' à l’extérieur ; elle vaut zéro aux racines.';
        return 'Sommet S(' + fmt(p.h) + ' ; ' + fmt(p.k) + '). La fonction atteint ' +
          direction + ' égal à ' + fmt(p.k) + '. ' + rootText + ' ' + signInfo;
      },
      questions: p => [
        {text: 'Quelle est l’ordonnée du sommet de la parabole ?', answer: p.k},
        {text: 'Quelle est l’abscisse du sommet ?', answer: p.h},
        {text: 'Calcule l’image f(0) pour cette parabole.', answer: quadratic(p, 0)}
      ],
      markers: p => [{x: p.h, y: p.k, label: 'S'}].concat(roots(p).map(x => ({x, y: 0, label: 'racine'})))
    },
    suites: {
      title: 'Comparer deux suites', description: 'Chaque point correspond à un rang entier. La suite bleue est arithmétique ; la suite orange est géométrique.',
      parameters: [
        {key: 'u0', label: 'Premier terme u₀', type: 'range', min: 0, max: 8, step: 1, value: 2},
        {key: 'r', label: 'Raison arithmétique r', type: 'range', min: -2, max: 3, step: .5, value: 1},
        {key: 'v0', label: 'Premier terme v₀', type: 'range', min: 0, max: 8, step: 1, value: 2},
        {key: 'q', label: 'Raison géométrique q', type: 'range', min: .5, max: 1.6, step: .1, value: 1.2}
      ],
      domain: [0, 6], calculate: arithmetic,
      explanation: p => 'uₙ = ' + fmt(p.u0) + ' + n × ' + fmt(p.r) +
        ' : on ajoute toujours ' + fmt(p.r) + '. ' +
        'vₙ = ' + fmt(p.v0) + ' × ' + fmt(p.q) +
        'ⁿ : on multiplie toujours par ' + fmt(p.q) +
        '. Au rang 4 : u₄ = ' + fmt(arithmetic(p, 4)) +
        ' et v₄ ≈ ' + fmt(geometric(p, 4)) + '.',
      questions: p => [
        {text: 'Calcule u₂, le terme de rang 2 de la suite arithmétique.', answer: arithmetic(p, 2)},
        {text: 'Calcule v₂ pour la suite géométrique (au centième si nécessaire).', answer: geometric(p, 2)},
        {text: 'Calcule u₄ pour la suite arithmétique.', answer: arithmetic(p, 4)}
      ]
    },
    derivee: {
      title: 'Faire glisser une tangente', description: 'Sur f(x) = (x − 1)² − 2, déplace le point A. La droite orange touche la courbe en A.',
      parameters: [{key: 't', label: 'Abscisse t du point A', type: 'range', min: -3, max: 5, step: .25, value: 2}],
      domain: [-4, 6], extent: [-5, 14], calculate: (_p, x) => curve(x),
      explanation: p => {
        const m = slope(p.t);
        return 'A(' + fmt(p.t) + ' ; ' + fmt(curve(p.t)) + '). ' +
          'Pente de la tangente : f′(' + fmt(p.t) + ') = ' + fmt(m) + '. ' +
          (m < 0 ? 'La fonction décroît en ce point : la pente est négative.' :
            m > 0 ? 'La fonction croît en ce point : la pente est positive.' :
              'La tangente est horizontale : le point est au minimum.');
      },
      questions: p => [
        {text: 'Quelle est la pente f′(t) de la tangente ?', answer: slope(p.t)},
        {text: 'Quelle est l’ordonnée f(t) du point de tangence ?', answer: curve(p.t)},
        {text: 'Quand x augmente de 0,5 sur la tangente, de combien y varie-t-il ?', answer: .5*slope(p.t)}
      ],
      markers: p => [{x: p.t, y: curve(p.t), label: 'A'}]
    }
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeSvg(root, id) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'math-lab__plot');
    svg.setAttribute('viewBox', '0 0 620 350');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', id + '-svg-title ' + id + '-svg-description');
    const title = document.createElementNS(svgNS, 'title');
    title.setAttribute('id', id + '-svg-title');
    title.textContent = 'Graphique interactif';
    const desc = document.createElementNS(svgNS, 'desc');
    desc.setAttribute('id', id + '-svg-description');
    desc.textContent = 'Le graphique et les valeurs se modifient avec les commandes situées à côté.';
    svg.append(title, desc);
    root.append(svg);
    return {svg, title, desc};
  }

  function draw(svgParts, key, p, config, id) {
    const {svg, title, desc} = svgParts;
    const width = 620, height = 350, left = 55, right = 18, top = 18, bottom = 40;
    const xMin = config.domain[0], xMax = config.domain[1];
    let [yMin, yMax] = config.extent || [-5, 25];
    if (key === 'suites') {
      const samples = Array.from({length: 7}, (_, n) => [arithmetic(p, n), geometric(p, n)]).flat();
      const low = Math.min(0, ...samples), high = Math.max(1, ...samples);
      const padding = Math.max(1, (high - low) * .12);
      yMin = low - padding;
      yMax = high + padding;
    }
    const plotW = width - left - right, plotH = height - top - bottom;
    const xPixel = x => left + (x - xMin) / (xMax - xMin) * plotW;
    const yPixel = y => top + (yMax - y) / (yMax - yMin) * plotH;
    const svgLine = (x1, y1, x2, y2, color, strokeWidth, extra = '') =>
      '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" stroke="' + color + '" stroke-width="' + strokeWidth + '" ' + extra + '/>';
    const text = (x, y, value, anchor = 'middle') =>
      '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor +
      '" fill="#334155" font-size="12" font-family="Arial,sans-serif">' + value + '</text>';
    const parts = [];
    const clip = id + '-clip';
    parts.push('<defs><clipPath id="' + clip + '"><rect x="' + left +
      '" y="' + top + '" width="' + plotW + '" height="' + plotH + '"/></clipPath></defs>');
    if (key === 'second') {
      // Le vert correspond aux ordonnées positives, l'orange aux négatives.
      const zeroY = yPixel(0);
      parts.push('<rect x="' + left + '" y="' + top + '" width="' + plotW +
        '" height="' + (zeroY - top) + '" fill="#edf9f3" aria-hidden="true"/>');
      parts.push('<rect x="' + left + '" y="' + zeroY + '" width="' + plotW +
        '" height="' + (height - bottom - zeroY) + '" fill="#fff3ea" aria-hidden="true"/>');
    }
    for (let i = 0; i <= 4; i++) {
      const y = yMin + (yMax - yMin) * i / 4;
      const sy = yPixel(y);
      parts.push(svgLine(left, sy, width - right, sy, '#e2e8f0', 1));
      parts.push(text(left - 8, sy + 4, fmt(y), 'end'));
    }
    for (let i = 0; i <= 6; i++) {
      const x = xMin + (xMax - xMin) * i / 6;
      const sx = xPixel(x);
      parts.push(svgLine(sx, top, sx, height - bottom, '#e2e8f0', 1));
      parts.push(text(sx, height - bottom + 18, fmt(x)));
    }
    if (yMin <= 0 && yMax >= 0) parts.push(svgLine(left, yPixel(0), width-right, yPixel(0), '#64748b', 1.7));
    if (xMin <= 0 && xMax >= 0) parts.push(svgLine(xPixel(0), top, xPixel(0), height-bottom, '#64748b', 1.7));
    parts.push(text(width - right, height-bottom+34, key === 'suites' ? 'rang n' : 'x', 'end'));
    parts.push(text(left+3, top+12, key === 'suites' ? 'valeur' : 'y', 'start'));

    const polyline = (fn, color, widthStroke) => {
      const pieces = [];
      for (let i = 0; i <= 240; i++) {
        const x = xMin + (xMax - xMin) * i / 240;
        const y = fn(x);
        if (!Number.isFinite(y)) continue;
        pieces.push((pieces.length ? 'L' : 'M') + xPixel(x).toFixed(2) + ' ' + yPixel(y).toFixed(2));
      }
      return '<path d="' + pieces.join(' ') + '" fill="none" stroke="' + color +
        '" stroke-width="' + widthStroke + '" stroke-linecap="round" clip-path="url(#' + clip + ')"/>';
    };

    if (key === 'suites') {
      for (const [fn, color] of [[n => arithmetic(p,n),'#0b5e96'], [n => geometric(p,n),'#bc570c']]) {
        const circles = [];
        for (let n = 0; n <= 6; n++) {
          circles.push('<circle cx="' + xPixel(n) + '" cy="' + yPixel(fn(n)) +
            '" r="5.2" fill="' + color + '" stroke="#fff" stroke-width="1" />');
        }
        parts.push('<g clip-path="url(#'+clip+')">'+circles.join('')+'</g>');
      }
      parts.push(text(left+14, top+26, '● arithmétique (bleu)', 'start'));
      parts.push(text(left+14, top+45, '● géométrique (orange)', 'start'));
    } else {
      parts.push(polyline(x => config.calculate(p,x), '#0b5e96', 3.4));
      if (key === 'derivee') {
        parts.push(polyline(x => tangent(p.t,x), '#bc570c', 2.6));
      }
      const markers = config.markers ? config.markers(p) : [];
      for (const point of markers) {
        if (point.x < xMin || point.x > xMax || point.y < yMin || point.y > yMax) continue;
        parts.push('<circle cx="'+xPixel(point.x)+'" cy="'+yPixel(point.y)+
          '" r="5.5" fill="#0f766e" stroke="#fff" stroke-width="1.5"/>');
        parts.push(text(xPixel(point.x)+11,yPixel(point.y)-11,point.label,'start'));
      }
    }
    title.textContent = config.title;
    desc.textContent = config.explanation(p) +
      (key === 'suites' ? ' Les points des suites sont séparés et ne forment pas une courbe continue.' : '');
    // Conserver les éléments SVG accessibles title et desc, puis remplacer seulement
    // les tracés. Aucun texte de l'utilisateur n'entre dans le SVG.
    while (svg.childNodes.length > 2) svg.removeChild(svg.lastChild);
    const graph = document.createElementNS(svgNS, 'g');
    graph.innerHTML = parts.join('');
    svg.append(graph);
  }

  function initLab(root, index) {
    const requested = root.dataset.lab;
    const key = requested === 'variations' ? 'derivee' : requested;
    const config = configurations[key];
    if (!config || root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';
    const id = 'math-lab-' + index;
    const p = {};
    let questionIndex = 0;
    config.parameters.forEach(parameter => {p[parameter.key] = parameter.value;});
    const title = el('h3', 'math-lab__title', config.title);
    title.id = id + '-title';
    const introduction = el('p', 'math-lab__intro', config.description);
    const layout = el('div', 'math-lab__layout');
    const visual = el('div', 'math-lab__visual');
    const {svg, title: svgTitle, desc: svgDesc} = makeSvg(visual, id);
    const legends = {
      affine: 'Courbe bleue : droite de la fonction. Le point vert indique une image ou une racine.',
      second: 'Courbe bleue : parabole. Fond vert : y positif ; fond orange clair : y négatif. Les racines sont sur l’axe horizontal.',
      suites: 'Points bleus : suite arithmétique. Points orange : suite géométrique. Les points restent séparés.',
      derivee: 'Courbe bleue : fonction. Droite orange : tangente au point vert.'
    };
    const note = el('p', 'math-lab__note', legends[key] + (key==='suites'?'':' La fenêtre du graphique n’est pas une restriction du domaine : les fonctions affichées ici sont définies sur les réels.'));
    visual.append(note);
    const controls = el('div', 'math-lab__controls');
    const values = el('div', 'math-lab__readout');
    values.setAttribute('role', 'status');
    values.setAttribute('aria-live', 'polite');
    values.setAttribute('aria-atomic', 'true');
    const inputs = new Map();

    config.parameters.forEach(parameter => {
      const label = el('label');
      const caption = el('span', '', parameter.label + ' : ');
      const output = el('output', '', fmt(parameter.value));
      output.setAttribute('for', id + '-' + parameter.key);
      caption.append(output);
      label.append(caption);
      let input;
      if (parameter.type === 'select') {
        input = el('select');
        parameter.options.forEach(value => {
          const option = el('option', '', fmt(value));
          option.value = String(value);
          if (value === parameter.value) option.selected = true;
          input.append(option);
        });
      } else {
        input = el('input');
        input.type = 'range';
        input.min = parameter.min;
        input.max = parameter.max;
        input.step = parameter.step;
        input.value = parameter.value;
      }
      input.id = id + '-' + parameter.key;
      input.setAttribute('aria-label', parameter.label);
      input.dataset.parameter = parameter.key;
      input.addEventListener('input', () => {
        questionIndex = 0;
        p[parameter.key] = Number(input.value);
        output.textContent = fmt(p[parameter.key]);
        update();
      });
      label.append(input);
      controls.append(label);
      inputs.set(parameter.key, {input, output});
    });
    const actions = el('div', 'math-lab__actions');
    const reset = el('button', '', 'Réinitialiser le graphique');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      questionIndex = 0;
      config.parameters.forEach(parameter => {
        p[parameter.key] = parameter.value;
        const control = inputs.get(parameter.key);
        control.input.value = String(parameter.value);
        control.output.textContent = fmt(parameter.value);
      });
      update();
    });
    actions.append(reset);
    controls.append(actions, values);
    layout.append(visual, controls);

    const exercise = el('form', 'math-lab__question');
    exercise.noValidate = true;
    const question = el('label', '', '');
    question.setAttribute('for', id + '-answer');
    const answer = el('input');
    answer.id = id + '-answer';
    answer.type = 'text';
    answer.autocomplete = 'off';
    answer.inputMode = 'text';
    answer.setAttribute('aria-label', 'Ta réponse numérique');
    const check = el('button', '', 'Vérifier ma réponse');
    check.type = 'submit';
    const next = el('button', '', 'Question suivante →');
    next.type = 'button';
    next.addEventListener('click', () => {
      questionIndex = (questionIndex + 1) % config.questions(p).length;
      update();
    });
    const feedback = el('p', 'math-lab__feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    exercise.append(question, answer, check, next, feedback);
    exercise.addEventListener('submit', event => {
      event.preventDefault();
      const raw = answer.value.trim().replace(/[−–—]/g,'-').replace(/\s+/g,'').replace(/,/g,'.');
      const parts=raw.split('/'), valid=parts.length<=2 && parts.every(x=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x));
      const value=valid ? Number(parts[0])/(parts.length===2?Number(parts[1]):1) : NaN;
      if (!Number.isFinite(value)) { feedback.textContent='Entre un nombre ou une fraction valide, avec un dénominateur non nul.'; return; }
      const expected = config.questions(p)[questionIndex].answer;
      const rounded=Math.sign(expected)*Math.round(Math.abs(expected)*100+1e-9)/100;
      if (Math.abs(value-expected)<1e-9 || Math.abs(value-rounded)<1e-9) {
        feedback.textContent = 'Bravo ! Tu as trouvé la bonne réponse.';
        feedback.dataset.result = 'correct';
      } else {
        feedback.textContent = 'Pas encore. Reprends la formule affichée et le calcul à la valeur demandée.';
        feedback.dataset.result = 'wrong';
      }
    });

    function update() {
      draw({svg, title:svgTitle, desc:svgDesc}, key, p, config, id);
      values.textContent = config.explanation(p);
      const table = el('table', 'math-lab__values-table');
      table.append(el('caption', '', 'Valeurs avec les paramètres actuels (arrondies au centième si nécessaire)'));
      const tr = el('tr');
      (key === 'suites' ? ['Rang n', 'u(n)', 'v(n)'] : ['x', 'f(x)']).forEach(t => { const th=el('th','',t); th.scope='col'; tr.append(th); });
      const head=el('thead'); head.append(tr); table.append(head); const body=el('tbody');
      const xs=key==='suites'?[0,1,2,3,4,5,6]:[-2,-1,0,1,2];
      xs.forEach(x => { const row=el('tr'); const th=el('th','',String(x)); th.scope='row'; row.append(th);
        (key==='suites'?[arithmetic(p,x),geometric(p,x)]:[config.calculate(p,x)]).forEach(v=>row.append(el('td','',fmt(v)))); body.append(row); });
      table.append(body); dataWrap.replaceChildren(table);
      question.textContent = 'Question ' + (questionIndex + 1) + '/' +
        config.questions(p).length + ' : ' + config.questions(p)[questionIndex].text;
      answer.value = '';
      feedback.textContent = '';
      delete feedback.dataset.result;
    }
    const dataDetails = el('details', 'math-lab__data');
    const dataSummary = el('summary', '', 'Lire les valeurs du graphique en tableau');
    const dataWrap = el('div', 'math-lab__table-wrap');
    dataDetails.append(dataSummary, dataWrap);
    root.replaceChildren(title, introduction, layout, dataDetails, exercise);
    root.setAttribute('aria-labelledby', id + '-title');
    if (requested === 'variations') {
      const help = el('p', 'math-lab__note',
        'Pour les variations : à gauche de x = 1, f′ est négative et la courbe descend ; à droite, f′ est positive et la courbe monte. Essaie t = 1.');
      root.insertBefore(help, exercise);
    }
    update();
  }

  function init() {
    document.querySelectorAll('.math-lab[data-lab]').forEach(initLab);
  }

  window.GraphiquesInteractifs = {affine, quadratic, arithmetic, geometric, curve, slope, tangent, roots, fmt, init};
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();