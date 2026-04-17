# 🏘️ Simulateur Rendement Immobilier — Wallonie

Application React de simulation d'investissement locatif pour la Wallonie (Belgique).

## Fonctionnalités

- **3 types de biens** : Appartements, Kots étudiants, Maison unifamiliale
- **Calcul instantané** via sliders : surface, coût des travaux, loyer marché
- **Paramètres financiers** : taux hypothécaire, durée, TVA (6%/21%), charges
- **Résultats** : rendement brut, payback, cash flow mensuel
- **Comparaison** des 3 types sur le même bien
- **Horizon de retour** : table de cibles de rendement (6% → 18%)
- Frais de notaire 3% · TVA rénovation Wallonie intégrés

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

## Déploiement GitHub Pages

1. Créer le repo sur GitHub
2. Dans `vite.config.js`, adapter `base` au nom de ton repo :
   ```js
   base: '/nom-de-ton-repo/',
   ```
3. Dans GitHub → Settings → Pages → Source : **GitHub Actions**
4. Push sur `main` → déploiement automatique ✅

L'app sera disponible à `https://username.github.io/nom-de-ton-repo/`

## Stack

- React 18
- Vite 5
- Styles inline (zéro dépendance CSS)
- Google Fonts : Syne · DM Mono · DM Sans

## Calculs

| Variable | Formule |
|---|---|
| Nb unités (appt) | `floor(surface / 65)` |
| Nb kots | `floor(surface × 0.75 / 16)` |
| Investissement | `(achat × 1.03) + (travaux × (1 + TVA))` |
| Rendement brut | `loyer_annuel / investissement` |
| Payback | `1 / rendement` |
| Cash flow | `loyer − mensualité − charges` |
| Mensualité | `PMT(taux/12, durée×12, investissement)` |
