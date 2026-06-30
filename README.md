# Gestion-Hôtel - Système de Gestion Hôtelière

Système de gestion hôtelière moderne et complet développé avec Next.js 16, incluant réservation en ligne, gestion des chambres, analytics, et interface d'administration.

## 🚀 Fonctionnalités

### Fonctionnalités Principales
- **Réservation en ligne** avec recherche de disponibilité en temps réel
- **Gestion des chambres** avec interface d'administration CRUD
- **Galerie photos** pour chaque chambre avec navigation
- **Dashboard analytique** avec KPIs et graphiques
- **Authentification sécurisée** avec JWT
- **Multi-langue** (Français, Anglais, Malgache)
- **Multi-devise** pour les prix

### Fonctionnalités Techniques
- **Optimisation des performances** (images, SSR, caching)
- **Base de données** avec Prisma ORM
- **Interface responsive** avec Tailwind CSS
- **TypeScript** pour la sécurité des types
- **PWA** avec support offline

## 🛠️ Stack Technique

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de données**: SQLite (développement) / PostgreSQL (production)
- **Authentification**: JWT personnalisé
- **Icônes**: Lucide React
- **Tests**: Playwright, Jest

## 📦 Installation

### Prérequis
- Node.js 18+
- npm, yarn, pnpm ou bun

### Configuration

1. Cloner le repository
```bash
git clone https://github.com/yourusername/gestion-hotel.git
cd gestion-hotel
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```

4. Configurer la base de données
```bash
npx prisma generate
npx prisma db push
```

5. Lancer le serveur de développement
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🔐 Variables d'Environnement

Copiez le fichier `.env.example` en `.env` et configurez les variables nécessaires :

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📁 Structure du Projet

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── admin/         # API d'administration
│   │   ├── auth/          # Authentification
│   │   ├── bookings/      # Réservations
│   │   ├── rooms/         # Chambres
│   │   └── users/         # Utilisateurs
│   ├── admin/             # Pages d'administration
│   ├── auth/              # Pages d'authentification
│   ├── bookings/          # Pages de réservation
│   ├── dashboard/         # Dashboard
│   └── rooms/             # Pages des chambres
├── components/            # Composants React
│   ├── RoomsManager.tsx   # Gestion des chambres
│   └── ...                # Autres composants
├── lib/                   # Utilitaires
│   ├── prisma.ts          # Client Prisma
│   ├── auth.ts            # Authentification JWT
│   └── i18n.ts            # Internationalisation
└── types/                 # Types TypeScript
```

## 🧪 Tests

### Tests E2E (Playwright)
```bash
npx playwright test
```

### Tests Unitaires (Jest)
```bash
npm test
```

## 📊 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build pour production
npm run start        # Serveur de production
npm run lint         # Linting
npm test             # Tests unitaires
npx playwright test  # Tests E2E
npx prisma studio    # Interface Prisma
```

## � Sécurité

- Les variables d'environnement ne sont jamais commitées
- Les tokens JWT sont signés avec une clé secrète
- Les routes API sont protégées par authentification
- Les données sensibles sont exclues du Git via .gitignore

## �🚀 Déploiement

### Vercel
```bash
vercel deploy
```

### Docker
```bash
docker build -t gestion-hotel .
docker run -p 3000:3000 gestion-hotel
```

## 📝 Notes Importantes

- Le fichier `.env` contient des données sensibles et ne doit jamais être partagé
- Utilisez `.env.example` comme template pour la configuration
- La base de données SQLite est utilisée pour le développement
- Pour la production, utilisez PostgreSQL

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de suivre ces étapes:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Compte Admin par Défaut

- **Email**: admin@hotel.mg
- **Mot de passe**: Admin123!

⚠️ **Important**: Changez ces identifiants en production !
