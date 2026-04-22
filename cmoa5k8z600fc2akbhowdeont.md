---
title: "OpenTofu : Le grand saut vers l'Open Source"
seoTitle: "Migration Terraform vers OpenTofu : Le Guide de Nexus"
seoDescription: "Prêt pour le grand saut ? Suis notre mascotte Nexus dans sa migration vers OpenTofu. Le guide complet pour passer à l'IaC libre sans crash"
datePublished: 2026-04-22T14:33:10.773Z
cuid: cmoa5k8z600fc2akbhowdeont
slug: opentofu-le-grand-saut-vers-l-open-source
cover: https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/52d1cf09-ca49-49eb-b984-f628edada21f.png
ogImage: https://cdn.hashnode.com/uploads/og-images/6989fc595065ae2aa69fc161/de057212-83d2-423e-9d02-095eaa11f074.png
tags: opensource, devops, terraform, infrastructure-as-code, opentofu

---

Hello friend,

Si tu es sorti de ta grotte il y a bien des lunes, tu as vu que Terraform a changé de licence (passage à la BUSL), ce qui a poussé la communauté à créer un "fork" totalement open-source soutenu par la Linux Foundation : **OpenTofu**.

Aujourd'hui, je te montre comment l'installer, le faire cohabiter avec Terraform, et surtout, comment ne pas te prendre les pieds dans ton parachute lors de tes premiers `tofu apply`.

### 1\. OpenTofu vs Terraform : On peut avoir les deux ?

La réponse est **OUI**. OpenTofu est conçu pour être un remplacement "drop-in" (interchangeable). Le binaire s'appelle `tofu` au lieu de `terraform`, ce qui permet de les garder tous les deux sur ton système sans aucun conflit.

C'est idéal pour tester la migration sur tes projets personnels avant de le proposer au taf.

### 2\. Installation (Debian/Ubuntu & Fedora)

Pour installer proprement OpenTofu, le plus simple est d'utiliser les dépôts officiels. Choisis la méthode qui correspond à ton système.

### Sur Debian / Ubuntu (et dérivés)

```shell
# Installation des dépendances
sudo apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Ajout de la clé GPG d'OpenTofu
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://get.opentofu.org/opentofu.gpg | sudo tee /etc/apt/keyrings/opentofu.gpg >/dev/null
sudo chmod a+r /etc/apt/keyrings/opentofu.gpg

# Ajout du dépôt
echo "deb [signed-by=/etc/apt/keyrings/opentofu.gpg] https://packages.opentofu.org/opentofu/opentofu/any/ any main" | sudo tee /etc/apt/sources.list.d/opentofu.list

# Installation finale
sudo apt-get update
sudo apt-get install -y tofu
```

### Sur Fedora (et distributions RHEL-like)

Puisque j'utilise Fedora pour ce test, voici la procédure spécifique avec `dnf`. Elle est encore plus rapide grâce au script d'installation automatique du dépôt :

```shell
# Ajout du dépôt et configuration automatique
curl -sS https://get.opentofu.org/install.sh | sudo bash -s -- --install-repo

# 2. Installation du paquet tofu
sudo dnf install -y tofu
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/579d3a7a-cec0-4f72-9707-5fa5bca76b1f.png align="left")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/2d709ae1-cfc5-4f9b-88ab-71d89a650bb0.png align="left")

### Vérification (Valable pour tous)

Une fois l'installation terminée, vérifie que le binaire est bien reconnu en tapant :

```shell
tofu --version
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/007d3126-93ea-41d3-8248-9dd1fd73d9e3.png align="center")

Astuce de Nexus : Si tu as déjà Terraform d'installé, pas de panique ! Comme tu peux le voir, la commande tofu est distincte de terraform. Tu peux donc garder tes anciens scripts tout en expérimentant le futur de l'IaC avec OpenTofu.

## 3\. Ta première ressource : Le provider Docker

Pour éviter de sortir la carte bleue chez un fournisseur Cloud, on va tester OpenTofu avec **Docker**. On va demander à Tofu de créer un conteneur Nginx pour nous.

### Créer le fichier [`main.tf`](http://main.tf)

Crée un dossier `mon-premier-tofu` et ajoutes-y ce fichier `main.tf`:

```terraform
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "4.2.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "nginx" {
  name         = "nginx:latest"
  keep_locally = false
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name  = "tuto-opentofu"
  ports {
    internal = 80
    external = 8080
  }
}
```

## 4\. Le cycle de vie : The Tofu Way

Les commandes sont identiques à celles que tu connais avec Terraform, mais avec le préfixe `tofu`.

**1.Initialisation :** Télécharge le provider

```shell
tofu init
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/ee58acef-94e5-4381-acd5-8311ecf0c0f6.png align="left")

**2\. Planification :** Regarde ce que Tofu s'apprête à faire.

```shell
tofu plan
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/28ad90b2-d801-4d36-ba78-eb6a6f360678.png align="left")

**3.Application :** Déploie le conteneur.

```shell
tofu apply
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/502088a9-f215-4f3d-8211-942d684790bf.png align="left")

1.  *Tape* `yes` *quand il te le demande :*
    

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/323622d4-74c2-4ed4-a8c9-01a486765450.png align="left")

Félicitations ! Si tu vas sur [`http://localhost:8080`](http://localhost:8080), ton serveur Nginx tourne, géré entièrement par OpenTofu.

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/b288b614-c558-4682-87fb-397a33ff593a.png align="left")

## 5\. Migration : Passer de Terraform à OpenTofu

Si tu as déjà un projet Terraform, la migration est ridiculeusement simple :

1.  Fais un backup de ton fichier `terraform.tfstate` :
    

```shell
cp terraform.tfstate terraform.tfstate.backup
```

1.  Lance `tofu init`.
    
2.  OpenTofu va détecter l'état Terraform et te proposer de le reprendre. Dis `yes`.
    

* * *

### ⚠️ Le conseil "Système" : Maîtrise tes Alias

Si tu es comme moi et que tu as personnalisé ton `.bashrc` ou `.zshrc` avec des raccourcis type `alias tf='terraform'`, **fais attention**.

La mémoire musculaire peut te trahir et te faire lancer un `apply` avec le mauvais binaire. Je te conseille de mettre à jour tes alias via `.bashrc` ou `.zshrc` avec la commande `nano ~/.bashrc` ou la commande `nano ~/.zshrc` :

```shell
# Rediriger ton raccourci vers OpenTofu au lieu de Terraform
alias tf='tofu'

# Optionnel : Un rappel si tu tapes encore "terraform" par erreur
alias terraform='echo "⚠️ Utilise la commande tofu !"; terraform'
```

Astuce : Utilise `type tf` pour vérifier quel binaire ton terminal appelle réellement.

### Troubleshooting : Quand le parachute s'emmêle

Même pour un remplacement "drop-in", on peut tomber sur quelques turbulences. Voici les cas concrets que j'ai rencontrés lors de la rédaction de ce guide :

#### 1\. L'erreur de signature (`Failed to install provider`)

Lors de mon premier tofu init, j'ai eu une erreur m'indiquant que le provider Docker n'était pas signé avec une clé valide.

*   **Le problème :** Un conflit de versions ou une signature mal reconnue dans le fichier de verrouillage existant.
    
*   **La solution "Brute Force" (et efficace) :**
    
*   1\. Modifier la version dans le `main.tf` (passer à la 4.2.0).
    
*   2\. Supprimer le fichier de verrouillage : `rm .terraform.lock.hcl`.
    
*   3\. Forcer la mise à jour : `tofu init -upgrade`.
    
*   **Résultat :** Tofu repart de zéro, télécharge la version stable et génère un nouveau lock tout propre.
    

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/4ceeeb7a-8425-4458-bc3e-585226083f50.png align="left")

#### 2\. Erreur de syntaxe lors de l'installation (Fedora)

Si en installant le dépôt tu vois apparaître du code HTML (`<!doctype html>`) dans ton terminal :

*   **Le problème :** `curl` a récupéré une page d'erreur web au lieu du script d'installation.
    

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/7de10f1f-6857-4eb1-a820-f8379feb9380.png align="left")

*   **La solution :** Utiliser l'URL officielle simplifiée qui gère mieux les redirections :
    

```shell
curl -sS https://get.opentofu.org/install.sh | sudo bash -s -- --install-repo
```

Une fois ces petits réglages effectués, tu devrais avoir un environnement stable et prêt à l'emploi. Ce qu'il faut retenir, c'est qu'OpenTofu n'est pas juste un clone : c'est un outil qui remet la sécurité et la transparence au centre, tout en restant familier pour ceux qui viennent de Terraform.

### Le mot de la fin

> Et voilà, c'est fait. La mission est réussie. Tux a atterri en douceur sur la banquise Toulousaine.  
> Ce n'était pas si difficile, n'est-ce pas ? La transition est fluide, le code est libre, et l'avenir est radieux (enfin, aussi radieux que le soleil de Toulouse, ce qui est quand même pas mal). Alors, n'hésite pas, saute le pas !

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/99a7e113-86a3-4837-9765-2836e35ef98c.png align="center")