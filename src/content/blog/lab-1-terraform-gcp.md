---
id: 1
slug: "lab-1-terraform-gcp"
title: "Lab #1 : Déployer avec Terraform & GitHub Actions"
description: "Automatiser ton premier déploiement d'instance sécurisée sur GCP avec une approche IaC."
pubDate: "2026-03-04"
imageUrl: "/images/blog-post/githubActions.png"  # Remplace heroImage par imageUrl
imageAlt: "Logo GitHub Actions sur un serveur"   # Ajout de cette ligne pour le alt
category: "IaC"
tags: ["Terraform", "GCP", "GitHub Actions", "IaC"]
author: "Gregory EL BAJOURY"
featured: false
---

Hello friend,

Aujourd’hui je poste mon premier **“lab” Nexus DevOps**. C’est le tout premier d’une longue série que j’ai imaginée comme un parcours d’apprentissage ouvert.

L'idée est simple : monter en puissance, brique après brique. Ces posts ne sont pas des leçons magistrales, mais des exercices de "skill-up" concrets.

## L'objectif du jour
Déployer une instance sécurisée sur GCP de manière totalement automatisée. Une fois le feu vert donné, **Terraform** entre en action pour provisionner une instance Compute Engine et assure la persistance du projet via un bucket sécurisé.



## La Stack Technique
* **Cloud** : Google Cloud Platform (GCP).
* **IaC** : Terraform (Backend distant sur GCS).
* **CI/CD** : GitHub Actions.
* **Conteneurisation** : Docker (serveur Nginx).

## Ce que j'ai mis en place

### 1. Une architecture modulaire
J'ai séparé le projet en deux étapes :
* `01-bootstrap` : Création du Bucket GCS pour le `.tfstate`.
* `02-infrastructure` : Définition des ressources (VM, Firewall, Docker).

### 2. Un Pipeline CI/CD sécurisé
* **Phase d'Inspection (Plan)** : Calcul des changements à chaque `git push`.
* **Validation Manuelle** : Le déploiement ne se déclenche qu'après validation humaine sur GitHub.

### 3. Gestion des Secrets
Respect des bonnes pratiques : aucune clé JSON en clair, tout passe par les **GitHub Secrets** (`GCP_SA_KEY`).

## On avance ensemble ?
C'est quoi la prochaine brique selon toi ? **Conteneurisation** ou **Monitoring** ?

---

### Code source et Documentation
Tu pourras retrouver l'intégralité du code sur mon dépôt GitHub :
🔗 [Mon Repo : gcp-terraform-cicd-pipeline](https://github.com/GregoryElBajoury/gcp-terraform-cicd-pipeline)
