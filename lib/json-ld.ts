/**
 * Sérialise un objet pour insertion dans un
 * `<script type="application/ld+json">` sans risque d'évasion de balise.
 *
 * Échappe `<`, `>` et `&` : cela empêche qu'un contenu contenant `</script>`
 * (ou `<!--`) ne ferme la balise et n'injecte du HTML/JS. La sortie reste du
 * JSON valide — les parseurs JSON-LD décodent `<` en `<`. (Les séparateurs
 * de ligne U+2028/U+2029 n'ont pas à être échappés dans un îlot JSON-LD : ils
 * sont valides dans une chaîne JSON et ne ferment pas la balise script.)
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
