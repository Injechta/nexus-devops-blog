---
title: "Lab #1 : Terraform & GitHub Actions : Automatiser ton premier déploiement sur GCP"
seoTitle: "Deploy on Google Cloud with Terraform & GitHub"
seoDescription: "Automate GCP deployment using Terraform and GitHub Actions in a secure CI/CD pipeline with detailed project setup and best practices"
datePublished: 2026-02-09T16:56:31.223Z
cuid: cmlfez94n000d02l58z2icrkw
slug: lab-1-deployer-sur-google-cloud-avec-terraform-et-github-actions
cover: https://cdn.hashnode.com/res/hashnode/image/stock/unsplash/UT8LMo-wlyk/upload/d6f51b0f4ca2d0bca4e012fc7e9bc3e2.jpeg
tags: google-cloud, learning, devops, terraform, github-actions-1

---

Hello friend ,

Aujourd’hui je poste mon premier “lab” **Nexus DevOps**.

C’est le tout premier d’une longue série que j’ai imaginée comme un parcours d’apprentissage ouvert.

L'idée est simple : monter en puissance, brique après brique. Ces posts ne sont pas des leçons magistrales, mais des exercices de "skill-up" concrets pour toutes celles et ceux qui sont curieux de découvrir l'univers **DevOps** ou qui souhaitent expérimenter de nouvelles pratiques.

L'objectif de ce jour : déployer une instance sécurisée sur **GCP** de manière totalement automatisée.

![Schéma du pipeline CI/CD Terraform vers Google Cloud](https://cdn.hashnode.com/res/hashnode/image/upload/v1771198619896/881c02ae-2507-42e4-8816-5fe2533fb760.png align="center")

Comme on peut le voir sur le schéma ci-dessus, le workflow ne s'arrête pas à la validation. Une fois le feu vert donné, Terraform entre en action pour **provisionner** une instance Compute Engine.

Parallèlement, il assure la persistance du projet en mettant à jour le **State** dans un bucket sécurisé. C'est la garantie d'une infrastructure reproductible et sans dérive.

## Le Projet : Pipeline CI/CD Terraform

Ce projet implémente une infrastructure automatisée et sécurisée sur **Google Cloud Platform (GCP)** en utilisant **Terraform** pour l'IaC et **GitHub Actions** pour le déploiement continu.

### La Stack Technique

* **Cloud :** Google Cloud Platform (GCP).
    
* **IaC :** Terraform (avec un backend distant sur GCS pour la persistance du State).
    
* **CI/CD :** GitHub Actions.
    
* **Conteneurisation :** Docker (déploiement d'un serveur Nginx).
    

---

## Ce que j'ai mis en place

### 1\. Une architecture modulaire

J'ai choisi de séparer le projet en deux étapes distinctes pour garantir la propreté de l'infrastructure :

* `01-bootstrap` : Cette étape crée uniquement le Bucket GCS qui servira à stocker le fichier d'état (`.tfstate`) de Terraform.
    
* `02-infrastructure` : C'est ici que le "vrai" travail commence avec la définition des ressources Cloud (VM Compute Engine, Firewall, Docker).
    

### 2\. Un Pipeline CI/CD sécurisé

Le déploiement suit un cycle rigoureux pour éviter les erreurs :

1. **Phase d'Inspection (Plan)** : À chaque `git push`, Terraform calcule les changements nécessaires et génère un fichier `.tfplan`.
    
2. **Validation Manuelle (Manual Gate)** : C'est ma partie préférée. Le déploiement réel ne se déclenche que si je valide manuellement l'action sur GitHub. C'est une sécurité indispensable en production !
    

### 3\. Gestion des Secrets

Aucune clé JSON n'est stockée en clair dans le dépôt. Tout passe par les **GitHub Secrets** (`GCP_SA_KEY`), ce qui respecte les bonnes pratiques de sécurité DevOps.

---

## On avance ensemble ?

L'approche DevOps est un voyage, pas une destination. Ce premier lab pose les bases, et nous monterons en compétences petit à petit, en ajoutant de la complexité et de nouveaux outils à chaque étape.

Que tu sois déjà expert ou juste curieux de voir comment ça se passe "sous le capot", tu es le bienvenu pour échanger !

**C'est quoi la prochaine brique selon toi? Conteneurisation ou Monitoring ?**

---

**N’hésite pas à me dire ce que tu en penses en commentaire !** Est-ce que tu as réussi à déployer ton instance ? Tu as bloqué sur une erreur ? Dis-moi tout, on est là pour apprendre les uns des autres.

---

## Code source et Documentation

Tu pourras retrouver l'intégralité du code, les fichiers de configuration et le guide de démarrage complet sur mon dépôt GitHub :

🔗 [**Mon Repo : gcp-terraform-cicd-pipeline**](https://github.com/GregoryElBajoury/gcp-terraform-cicd-pipeline)

---