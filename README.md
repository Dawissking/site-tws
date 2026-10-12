# TOPO SABUGNOUMA WASSA (TSW) — Site Web Officiel

Site web vitrine professionnel et portail de contact pour **TOPO SABUGNOUMA WASSA (TSW)**, entreprise malienne de premier plan spécialisée dans les travaux topographiques, la géodésie, la cartographie numérique et les Systèmes d'Information Géographique (SIG).

---

## 📁 Architecture du projet

```text
Site_TWS/
├── .htaccess                 # Optimisations Hostinger (Gzip, cache, sécurité, headers)
├── .gitignore                # Fichiers ignorés par Git
├── README.md                 # Documentation technique et guide de déploiement
├── robots.txt                # Directives d'indexation pour les moteurs de recherche
├── sitemap.xml               # Plan du site XML pour le référencement naturel (SEO)
├── send-mail.php             # Backend PHP pour l'envoi d'e-mails sécurisé (Hostinger)
│
├── index.html                # Page d'accueil (Hero, Agrément, Services, Chiffres, CTA)
├── a-propos.html             # Présentation institutionnelle, agrément officiel & équipe
├── services.html             # Détail des 6 grands services d'ingénierie géomatique
├── domaines.html             # Les 16 domaines d'intervention avec photos et fiches
├── realisations.html         # Portfolio & galerie des travaux récents avec filtres
├── contact.html              # Formulaire de devis hybride (E-mail + relais WhatsApp)
├── confidentialite.html      # Politique de confidentialité et protection des données
│
├── css/
│   └── style.css             # Feuille de styles principale (Design System TSW)
├── js/
│   └── main.js               # Interactions, filtres, animations, soumission hybride
├── images/                   # Photos professionnelles (01 à 16), logo, agrément & favicons
└── fonts/                    # Polices de caractères locales
```

---

## ⚙️ Configuration du formulaire de contact (`send-mail.php`)

Le site utilise une **solution hybride** pour maximiser le taux de conversion et la fiabilité :
1. **Envoi e-mail serveur** : Lorsque le visiteur valide le formulaire, une requête AJAX transmet les données au fichier `send-mail.php`.
2. **Relais WhatsApp pré-rempli** : Un bouton vert apparaît automatiquement avec le résumé complet du projet déjà rédigé, prêt à être envoyé d'un simple clic au numéro officiel **+223 76 29 29 49**.

### Personnaliser l'adresse de réception :
Ouvrez le fichier `send-mail.php` et modifiez la ligne suivante selon votre e-mail Hostinger ou Gmail :
```php
$to = "contact@tsw-topo.com"; // Remplacer par votre adresse e-mail de réception
```

---

## 🚀 Étape 1 : Pousser le projet sur GitHub

Pour initialiser le dépôt Git et envoyer le code sur GitHub :

```bash
# 1. Ouvrir le terminal dans le dossier du projet
cd d:\Site_TWS

# 2. Initialiser le dépôt Git local
git init

# 3. Ajouter tous les fichiers au suivi Git
git add .

# 4. Créer le premier commit officiel
git commit -m "Initial commit: Site web complet TOPO SABUGNOUMA WASSA avec solution hybride"

# 5. Définir la branche principale
git branch -M main

# 6. Relier votre dépôt distant GitHub (remplacez l'URL par la vôtre)
git remote add origin https://github.com/VOTRE_UTILISATEUR/Site_TWS.git

# 7. Pousser le code sur GitHub
git push -u origin main
```

---

## 🌐 Étape 2 : Déployer sur Hostinger

Vous avez deux méthodes simples pour mettre le site en ligne sur **Hostinger** :

### Méthode A : Déploiement automatique via Git (Recommandée)
1. Connectez-vous à votre panneau de contrôle **Hostinger hPanel**.
2. Allez dans la section **Sites web** > sélectionnez votre nom de domaine > cliquez sur **Gérer**.
3. Dans la barre de recherche ou la section *Avancé*, cliquez sur **Git**.
4. Renseignez l'URL de votre dépôt GitHub (ex: `https://github.com/VOTRE_UTILISATEUR/Site_TWS.git`).
5. Sélectionnez la branche `main` et le répertoire de destination `/public_html`.
6. Cliquez sur **Créer**. Hostinger synchronisera automatiquement les fichiers !
7. À chaque mise à jour sur GitHub, cliquez simplement sur **Déployer** (ou activez le webhook automatique).

### Méthode B : Via le Gestionnaire de Fichiers (File Manager)
1. Dans le **hPanel Hostinger**, ouvrez le **Gestionnaire de fichiers** (File Manager).
2. Naviguez dans le dossier `public_html`.
3. Compressez le contenu du dossier `Site_TWS` dans une archive `.zip`.
4. Téléversez le fichier `.zip` dans `public_html`.
5. Faites un clic droit > **Extraire**.
6. Assurez-vous que les fichiers (`index.html`, `send-mail.php`, `.htaccess`, etc.) sont bien situés directement à la racine de `public_html`.

---

## 🔒 Sécurité et bonnes pratiques
- Le fichier `.htaccess` fourni active automatiquement la compression Gzip, les en-têtes de sécurité HTTP et la mise en cache navigateur pour un affichage ultra-rapide.
- Le formulaire intègre un piège anti-spam invisible (**Honeypot**) bloquant les robots collecteurs sans gêner les utilisateurs légitimes.
- L'Agrément officiel d'État n'est affiché qu'au sein de la page institutionnelle `a-propos.html`, conformément aux règles d'affichage réglementaires.

---

## 📞 Informations de contact TSW
- **Entreprise** : TOPO SABUGNOUMA WASSA (TSW)
- **Siège social** : Doumanzana, rue 281, porte 162, Bamako, Mali (Repère : Doumanzana Nafadji)
- **Téléphones** : +223 76 29 29 49 / +223 60 30 20 14 / +223 20 74 92 61
- **WhatsApp** : [+223 76 29 29 49](https://wa.me/22376292949)
