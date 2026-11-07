/* Aides progressives de tous les exercices générés (le chapitre Fonctions a les siennes).
   Aucun résultat n'est lu dans fields[].answer ni dans correction : l'indice
   accompagne le raisonnement sans divulguer la solution. */
(() => {
  'use strict';
  const registered = new Map();

  const strip = value => String(value || '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();

  function context(exercise) {
    const statement = String(exercise.statement || '').replace(/<svg\b[\s\S]*?<\/svg>/gi, '');
    const highlighted = [...statement.matchAll(/<(strong|code)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map(match => strip(match[2])).filter(Boolean);
    const tasks = (exercise.tasks || []).map(strip).filter(Boolean);
    const facts = highlighted.length ? highlighted : tasks.length ? tasks : [strip(statement)];
    return facts.slice(0, 5).join(' ; ').slice(0, 230);
  }

  function register(slug, specs) {
    if (registered.has(slug) || !Array.isArray(specs) || specs.length !== 8 ||
        !specs.every(s => Array.isArray(s) && s.length === 5 &&
          s.slice(0, 4).every(t => typeof t === 'string' && t.length > 18) &&
          Array.isArray(s[4]) && s[4].length === 3 &&
          s[4].every(t => String(t).trim().length > 0))) {
      throw new Error('Aides pédagogiques incomplètes pour ' + slug);
    }
    registered.set(slug, specs);
  }

  function build(slug, index, exercise) {
    const specs = registered.get(slug);
    if (!specs || !specs[index] || !exercise || !exercise.statement) return null;
    const [understand, begin, method, diagnose, mini] = specs[index];
    const facts = context(exercise);
    if (!facts) return null;
    return {
      hints: [
        understand,
        begin + ' Repère dans ton énoncé : ' + facts + '.',
        'Avec les valeurs de cette variante (' + facts + '), ' + method
      ],
      diagnose: 'Piste à vérifier : ' + diagnose,
      bridge: {
        q: 'Exemple indépendant : ' + mini[0],
        a: String(mini[1]),
        help: mini[2]
      }
    };
  }

  window.ExerciseCoaching = {register, build, context};
})();
