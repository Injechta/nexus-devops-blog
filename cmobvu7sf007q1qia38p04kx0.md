---
title: "Observabilité : La première stack de monitoring sécurisée de Nexus (Épisode 1)"
seoTitle: "DevOps Monitoring Ep 1 : Prometheus & Node Exporter / Docker"
seoDescription: "Guide DevOps : Déployons Prometheus et Node Exporter sur Docker. Apprenons à collecter nos métriques système avec une approche pas à pas et sécurisée."
datePublished: 2026-04-23T19:36:31.987Z
cuid: cmobvu7sf007q1qia38p04kx0
slug: observabilite-la-premiere-stack-de-monitoring-securisee-de-nexus-episode-1
cover: https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/1fd0bbd5-b285-4f22-85cd-ab69b73b16f4.png
ogImage: https://cdn.hashnode.com/uploads/og-images/6989fc595065ae2aa69fc161/6b54735f-2e56-490a-bd11-e52ef2e34f28.png
tags: linux, docker, cloud-computing, monitoring, devops, infrastructure, prometheus, fedora, grafana, observability

---

## Introduction

Hello Friend,  
En tant que **Junior DevOps/SRE**, j'ai vite compris une chose : une infrastructure qui tourne, c'est bien. Une infrastructure dont on peut prouver la santé, c'est mieux.

Aujourd'hui, je t'emmène avec moi pour poser les fondations d'une stack **LPG** (Loki, Prometheus, Grafana). Dans cet Épisode 1, on va se concentrer sur le "cœur" du système : la collecte de métriques.

* * *

**LE SCHÉMA :**

*Avant de plonger dans les explications et le terminal, jetons un œil au plan du labo :*

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/c4cc8d5d-f828-4ef0-91b5-ab7f82fb819e.png align="center")

* * *

### **1\. Le terrain de jeu : Pourquoi Docker Compose et Fedora ?**

Pour ce projet, je travaille sur **Fedora**. C'est une distribution géniale, mais exigeante en termes de sécurité (merci SELinux !).

J'ai choisi **Docker Compose** pour rester pragmatique. L'idée est de construire un **POC (Proof of Concept)** solide que l'on pourra faire évoluer vers Kubernetes plus tard.

**Préparation de la structure (L'étape cruciale)**

Avant de lancer le moindre conteneur, on prépare un espace propre. **Ouvre ton terminal** et lance ces commandes pour créer l'arborescence exacte :

```shell
# On crée le dossier parent et les sous-dossiers de configuration
mkdir -p ~/Projets/lpg-stack/{prometheus,loki,grafana,promtail}

# On se place à la racine du projet (c'est d'ici que tout va se passer)
cd ~/Projets/lpg-stack
```

* * *

### 2\. Configurer le "Cerveau" : Prometheus

Prometheus ne devine pas ce qu'il doit surveiller. Il faut lui donner une liste de cibles (les "targets").

**Où créer le fichier ?**

Crée un nouveau fichier nommé `prometheus.yml` **à l'intérieur** du dossier `prometheus/` que nous venons de créer, avec le code suivant à l'intérieur :

```yaml
global:
  scrape_interval: 15s # On récupère les données toutes les 15 secondes

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090'] # Prometheus se surveille lui-même

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100'] # Notre machine Fedora
```

* * *

### 3\. Le déploiement (Security-First)

Maintenant, on va définir nos services.

**Où créer le fichier ?**

Crée le fichier `docker-compose.yml` **à la racine** de ton dossier de projet `lpg-stack`

Chemin complet : `~/Projets/lpg-stack/docker-compose.yml`

Note l'utilisation du flag `:Z` sur les volumes : c'est l'astuce indispensable sur Fedora pour que **SELinux** autorise Docker à lire tes fichiers sans tout casser.

```yaml
services:
  # Le capteur : expose les métriques du système (CPU, RAM, Disque)
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    networks:
      - monitoring
    read_only: true # Sécurité : le conteneur ne peut rien modifier sur l'hôte

  # La base de données de métriques
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      # :ro pour Read-Only, :Z pour le contexte SELinux Fedora
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro,Z
      - prometheus_data:/prometheus
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
```

Lancement de la stack

Pour démarrer ton infrastructure, assure-toi d'être bien dans le dossier `~/Projets/lpg-stack` et lance :

```bash
docker compose up -d
```

L'option `-d` (detach) permet de lancer les conteneurs en arrière-plan pour garder ton terminal libre.

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/e28bc9b0-4ae3-49cf-a211-450bb552aecf.png align="left")

* * *

### 4\. Vérification : Est-ce que ça bat ?

Une fois la stack lancée, rendez-vous sur ton navigateur à l'adresse : [`http://localhost:9090`](http://localhost:9090).

Pour vérifier que les données circulent :

1.  Va dans l'onglet **"Query"**.
    
2.  Tape `up` dans la barre de recherche.
    
3.  Clique sur le bouton bleu **"Execute"**.
    

Si tu vois la valeur `1` pour tes deux services, félicitations ! Prometheus communique bien avec ses cibles. On a une base solide et sécurisée.

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/969362a2-976a-463c-86f2-5f12572c1335.png align="left")

## Le Coin du Dépanneur

Même avec la meilleure volonté du monde, le YAML est capricieux et Fedora est stricte. Voici les commandes de survie si tout ne se passe pas comme prévu :

### 1\. Vérifier que les services sont vivants

Si `localhost:9090` ne répond pas, vérifie d'abord l'état de tes conteneurs :

```shell
docker compose ps
```

*Cherche la colonne* ***STATUS***\*. Si tu vois\* `Exit 1` *ou* `Restarting`*, il y a un souci .*

### 2\. Lire dans les pensées de Prometheus

C'est la commande la plus importante. Si Prometheus ne démarre pas, il te dira pourquoi dans ses logs :

```shell
docker compose logs prometheus
```

*Cherche les lignes contenant* `Error` *ou* `Permission denied`*. C'est souvent là qu'on découvre une erreur de frappe dans le fichier de config.*

### 3\. Appliquer un changement sans tout casser

Tu as modifié ton fichier `prometheus.yml` ? Pas besoin de tout éteindre, demande juste à Docker de recréer le service concerné :

```shell
docker compose up -d --no-deps prometheus
```

### 4\. Le bouton "Reset" (À utiliser avec parcimonie)

Si tu veux tout reprendre à zéro et nettoyer les volumes de données :

```shell
docker compose down -v
```

### 5\. Nettoyer ses traces comme un pro (The Clean Exit)

Un vrai DevOps ne se contente pas d'éteindre la lumière en partant ; il s'assure que toute l'infrastructure est bien décommissionnée. Voici comment faire table rase proprement.

**Étape A : Arrêter les services**

On commence par stopper les conteneurs sans supprimer les données.

*   Action :
    

```shell
docker compose stop
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/777c90fe-3037-495f-b5d5-fa735d7efd66.png align="left")

*   La vérification :
    

```shell
docker compose ps
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/0e450034-ba58-497a-92c2-d169ab55595a.png align="left")

**Étape B : Supprimer les ressources (Le démontage)**

Maintenant, on supprime les conteneurs et le réseau virtuel.

*   **Action :**
    

```shell
docker compose down
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/3932365f-2547-482b-b820-3d7f0e4bc68c.png align="left")

*   **La vérification :**
    

```shell
docker ps -a | grep lpg-stack
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/82fd36ed-cd76-43d0-ad6c-3bccae06fe5f.png align="left")

Si la commande ne renvoie rien, c'est que les conteneurs ont disparu de la mémoire de Docker.

**Étape C : Le grand ménage des volumes (Optionnel)**

Par défaut, `docker compose down` ne supprime pas les volumes (tes données Prometheus) pour éviter les pertes accidentelles.

Pour tout effacer :

*   Action :
    

```shell
docker compose down -v
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/615bda2c-5ffb-4b5f-8607-f710ab1d2da9.png align="center")

*   La vérification :
    

```shell
docker volume ls | grep lpg-stack
```

Si le volume `lpg-stack_prometheus_data` n'apparaît plus, ton disque est totalement propre.

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/1816b245-baee-4419-9b79-b3efbc7ce488.png align="left")

### Pourquoi cette rigueur ?

En entreprise, laisser des ressources "orphelines" (un volume oublié, un réseau qui traîne) finit par polluer le serveur et peut même bloquer d'autres déploiements futurs. En vérifiant chaque étape, tu t'assures que ton environnement de travail reste sain.

Et puis cela nous donnera l'occasion de le reproduire quand on attaquera la suite dans l'épisode 2

* * *

### Prochaine étape : L'Épisode 2

Justement, on a les données grâce à l'épisode 1, mais elles sont encore un peu brutes dans l'interface de Prometheus. Dans le prochain épisode, on passe aux choses sérieuses :

*   On déploie **Grafana**.
    
*   On transforme nos métriques en **dashboards visuels** et dynamiques.
    
*   On commence à explorer **Loki** pour ne plus jamais chercher une aiguille dans une botte de foin au milieu de nos logs.
    

On se retrouve très vite pour donner vie à notre stack !

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/df6b7efb-8d18-476e-b167-ef6666e26195.png align="center")

> "Prometheus nous a apporté le feu, mais Grafana nous apportera les lunettes de soleil pour admirer l'incendie ! "

Nexus, 2026