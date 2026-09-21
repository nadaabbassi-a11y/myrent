# Documents produit MyRent

| Document | Markdown | PDF |
|----------|----------|-----|
| PRD complet | [`../PRD.md`](../PRD.md) | [`PRD.pdf`](PRD.pdf) |
| Pitch investisseur | [`../PITCH.md`](../PITCH.md) | [`PITCH.pdf`](PITCH.pdf) |
| Slides (10 slides) | [`../PITCH_SLIDES.md`](../PITCH_SLIDES.md) | [`PITCH_SLIDES.pdf`](PITCH_SLIDES.pdf) |
| One pager | [`../ONE_PAGER.md`](../ONE_PAGER.md) | [`ONE_PAGER.pdf`](ONE_PAGER.pdf) |

## Régénérer les PDF

```bash
npx md-to-pdf ONE_PAGER.md PITCH.md PITCH_SLIDES.md PRD.md
mv *.pdf docs/
```

## Importer dans Google Slides

1. Ouvrir [`PITCH_SLIDES.md`](../PITCH_SLIDES.md)
2. Copier chaque slide (séparée par `---`) dans une slide Google Slides
3. Thème recommandé : minimal, fond blanc, accent #1e293b (slate)

## Contact

**Nada Abbassi** · nadaabbassi.0012@gmail.com · [myrent.ca](https://myrent.ca)
