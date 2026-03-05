---
id: 2
slug: "kubernetes-cheat-sheet-essentiel-devops"
title: "Kubernetes Cheat Sheet : L'Essentiel du DevOps"
description: "Optimisons notre workflow Kubernetes : une Cheat Sheet indispensable regroupant les commandes kubectl essentielles pour les ingénieurs DevOps."
pubDate: "2026-03-04"
imageUrl: "/images/kubernetes.jpeg" # Pense à ajouter une image dans public/images/blog/
imageAlt: "Commandes kubectl essentielles pour Kubernetes"
category: "Cheat Sheets"
tags: ["Kubernetes", "kubectl", "DevOps", "Cheat Sheet", "Cloud Native"]
author: "Gregory EL BAJOURY"
featured: false
readTime: 4
---

Hello Friend,

Cette fiche regroupe les commandes indispensables pour naviguer dans un cluster, débugger tes applications et gérer tes déploiements au quotidien.

On va être honnêtes : personne ne connaît l'intégralité des commandes `kubectl` par cœur. Entre le stress d'un déploiement un vendredi à 17h et le cerveau qui sature après trois cafés, on a tous déjà tapé `kubetcl` au lieu de `kubectl` (et pesté contre le terminal).

C'est ma sélection personnelle des commandes qui me sauvent la mise lors de mes Labs ou quand un pod décide de faire des siennes sans prévenir. Que tu sois en train de réviser pour une certif ou que tu aies juste besoin d'un pense-bête sous la main, sers-toi ! C'est fait pour ça. 👇

---

## 1. Inspection du Cluster (Le diagnostic)
Avant d'agir, il faut voir. Ces commandes te permettent de vérifier l'état de santé global.

* **Lister les ressources principales** : `kubectl get all` (Idéal pour avoir une vue d'ensemble : pods, services, deployments).
* **Vérifier l'état des Nodes** : `kubectl get nodes` (Crucial pour savoir si ton infrastructure physique suit).
* **Inspecter un Pod en détail** : `kubectl describe pod <nom-du-pod>` (La commande n°1 pour comprendre pourquoi un pod refuse de démarrer).
* **Voir les ressources par Namespace** : `kubectl get pods -n <namespace>`

## 2. Gestion des Pods & Déploiements (L'action)
Pour déployer tes applications et les mettre à jour sans coupure.

* **Appliquer une configuration** : `kubectl apply -f deployment.yaml`
* **Changer l'échelle (Scaling)** : `kubectl scale deployment <nom> --replicas=5`
* **Redémarrer un déploiement** : `kubectl rollout restart deployment <nom>`
* **Vérifier l'historique des versions** : `kubectl rollout history deployment <nom>`

## 3. Debugging & Maintenance (Le sauvetage)
Quand les choses ne se passent pas comme tu l'avais prévu.

* **Afficher les logs en temps réel** : `kubectl logs -f <nom-du-pod>`
* **Entrer dans un conteneur (Shell)** : `kubectl exec -it <nom-du-pod> -- /bin/bash` (Utile pour vérifier tes fichiers de configuration en interne).
* **Vérifier la consommation des ressources** : `kubectl top nodes` ou `kubectl top pods` (Permet de voir qui consomme trop de CPU/RAM).

## 4. Le Contexte & La Navigation (Le confort du DevOps)
Quand tu travailles sur plusieurs projets, il faut savoir passer de l'un à l'autre sans faire d'erreur.

* **Changer de Namespace par défaut** : `kubectl config set-context --current --namespace=<nom>` (Évite de devoir taper `-n <nom>` à chaque commande).
* **Voir les contextes (clusters) disponibles** : `kubectl config get-contexts`

## 5. Sécurité & Droits (Le côté "DevSecOps")
La gestion des droits est capitale pour la sécurité de tes clusters.

* **Vérifier tes propres droits** : `kubectl auth can-i create pods` (Une commande géniale pour tester si tes permissions sont bien configurées sans rien casser).
* **Lister les Secrets** : `kubectl get secrets` (Où sont stockés tes mots de passe et certificats).

## 6. Le petit "Trick" pour les YAML
Parce qu'on déteste tous écrire du YAML à la main.

* **Générer un template YAML sans déployer** : `kubectl run mon-pod --image=nginx --dry-run=client -o yaml > pod.yaml` (C'est la commande de "magicien").