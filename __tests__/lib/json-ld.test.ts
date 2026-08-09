import { serializeJsonLd } from '@/lib/json-ld';

describe('serializeJsonLd', () => {
  it('échappe < > & (empêche l\'évasion de balise script)', () => {
    const out = serializeJsonLd({ name: 'a < b > c & d' });
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out.includes('&') && !out.includes('\\u0026')).toBe(false);
    expect(out).toContain('\\u003c');
  });

  it('neutralise une tentative de fermeture </script>', () => {
    const out = serializeJsonLd({ title: 'x</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<script>');
  });

  it('reste du JSON valide qui round-trip', () => {
    const data = { '@type': 'HowTo', name: 'Arrêt <cardiaque> & co', step: [1, 2] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
