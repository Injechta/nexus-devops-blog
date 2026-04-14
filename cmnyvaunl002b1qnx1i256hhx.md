---
title: "Gestion de paquets : Sherlock Nexus traque l'origine de tes fichiers""
seoTitle: "APT, Snap : Sherlock Nexus traque l'origine de tes fichiers "
seoDescription: "APT vs Snap : Comment être sûr de la provenance de tes binaires Linux ? Sherlock Nexus traque l'origine des fichiers et déjoue les risques de sécurité"
datePublished: 2026-04-14T17:00:28.215Z
cuid: cmnyvaunl002b1qnx1i256hhx
slug: gestion-de-paquets-sherlock-nexus-traque-l-origine-de-tes-fichiers
cover: https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/29fbcbde-512c-42a7-9f5d-f5b9b85a3dec.png
ogImage: https://cdn.hashnode.com/uploads/og-images/6989fc595065ae2aa69fc161/d29153b9-61fb-4d9a-9aec-0e48588d1830.png
tags: ubuntu, sysadmin, linux, security, devops

---

Hello friend,

Sherlock Nexus est de retour !

Après avoir fouillé les secrets de ton serveur, il s'attaque aujourd'hui à un mystère de plus bas niveau : la provenance de tes logiciels.

Tu as déjà eu ce message méprisant du terminal te disant qu'un fichier n'existe pas alors qu'il est juste sous tes yeux ? Sherlock Nexus sort sa loupe et te prouve que sous Linux, rien ne disparaît vraiment, tout se transforme.

## Le paysage des gestionnaires : Qui fait quoi ?

Chaque distribution a sa propre logique. Sherlock Nexus a dressé cette carte pour ne jamais te perdre, que tu travailles sur un projet perso ou dans une grande infrastructure (Debian/Ubuntu ou Red Hat/SUSE).

<table style="min-width: 100px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><td colspan="1" rowspan="1"><p><strong>Famille</strong></p></td><td colspan="1" rowspan="1"><p><strong>Distributions</strong></p></td><td colspan="1" rowspan="1"><p><strong>Outil Bas Niveau (Local)</strong></p></td><td colspan="1" rowspan="1"><p><strong>Gestionnaire Haut Niveau (Réseau)</strong></p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Debian</strong></p></td><td colspan="1" rowspan="1"><p>Ubuntu, Mint, Debian</p></td><td colspan="1" rowspan="1"><p><code>dpkg</code></p></td><td colspan="1" rowspan="1"><p><strong>APT</strong></p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Red Hat</strong></p></td><td colspan="1" rowspan="1"><p>RHEL, Fedora, CentOS</p></td><td colspan="1" rowspan="1"><p><code>rpm</code></p></td><td colspan="1" rowspan="1"><p><strong>DNF</strong> (ou YUM)</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>SUSE</strong></p></td><td colspan="1" rowspan="1"><p>OpenSUSE, SLES</p></td><td colspan="1" rowspan="1"><p><code>rpm</code></p></td><td colspan="1" rowspan="1"><p><strong>Zypper</strong></p></td></tr></tbody></table>

> Sherlock Nexus note que chaque famille a son format de fichier : `.deb` pour le monde Debian et `.rpm` pour les mondes Red Hat et SUSE. Pour les plus téméraires, l'outil `alien` permet parfois de transformer l'un en l'autre, tel un alchimiste du binaire.

## L'enquête : D'où vient ce fichier ?

La commande de base pour identifier l'origine d'un binaire est `dpkg -S`. Mais Sherlock Nexus a découvert que le système aime nous jouer des tours.

### 1\. Le mirage du "Merged /usr"

  
Si tu tapes `dpkg -S /bin/ls`, Sherlock Nexus voit une erreur : aucun chemin ne correspond.

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/4a9f40c5-4a8a-4dd2-b936-c3dc52054ad9.png align="left")

\=> Le coupable : Sur les versions modernes d'Ubuntu, `/bin` n'est qu'un raccourci (lien symbolique) vers `/usr/bin`.

\=> La preuve : `dpkg` est rigoureux et ne cherche que les chemins réels. Utilise cette commande pour le forcer à trouver la vérité :

```shell
dpkg -S $(which ls) 
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/0ea45ba1-d623-4320-8244-e7a09b1eb600.png align="left")

### 2\. Le paquet "Fantôme" `/etc/timezone`)

Le fichier est là, tu peux le lire, mais `dpkg -S` ne le trouve toujours pas ?

**Le secret :** Ce fichier est généré dynamiquement par des scripts de configuration après l'installation du paquet. Il n'existe pas dans la base de données statique.

**La solution de Sherlock Nexus:** Pour identifier le paquet responsable, il faut chercher par mot-clé dans les descriptions des paquets installés :

```shell
dpkg -l | grep -E "tz|timezone"
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/810ca22b-6e59-4cf3-9080-257e5979deb7.png align="center")

**Résultat :** On démasque le paquet `tzdata`.

### L'astuce de l'enquêteur : `apt-cache policy`

Avant même de passer à l'action, Sherlock Nexus vérifie ses sources. Cette commande te permet de voir d'où vient un paquet et quelles versions sont disponibles dans tes dépôts.

**Exemple d'utilisation pour le paquet** `docker-ce` **:**

```shell
apt-cache policy docker-ce
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/97ea4d07-8c09-4ddc-b31f-93380575d87e.png align="center")

**Ce que Sherlock Nexus déduit :**

*   **La version est à jour :** La version installée est identique à la version "Candidate". Mission accomplie.
    
*   **La Source :** Le paquet provient bien du dépôt officiel Docker ([`download.docker.com`](http://download.docker.com)) et non des dépôts génériques d'Ubuntu. C'est un gage de sécurité et de fraîcheur pour un DevOps.
    
*   **L'Historique :** On voit que de nombreuses versions précédentes (comme la `5:29.3.1`) sont disponibles. Pratique si Sherlock Nexus doit effectuer un "rollback" (retour en arrière) suite à un bug !
    

## Sécurité : Vérifier l'intégrité avec `debsums`

Un binaire se comporte bizarrement ? Sherlock Nexus ne laisse rien passer. Si l'outil d'audit `debsums` manque à l'appel, installe-le et lance l'enquête sur l'intégrité de tes fichiers :

```bash
# Sherlock Nexus installe ses outils
sudo apt update && sudo apt install debsums -y
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/7e957038-ad2c-4d2d-8205-515144807a86.png align="left")

Lance l'audit détaillé de `coreutils` :

```bash
# L'audit détaillé du paquet coreutils
sudo debsums coreutils
```

**Ce que Sherlock Nexus voit à l'écran :** En lançant cette commande, tu vas voir défiler une liste impressionnante. Chaque fichier critique du système (comme `ls`, `cat`, ou `cp`) est passé au crible :

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/98fc679a-ec33-43f9-b7c4-104534c26ca4.png align="center")

*   **Le statut "OK" :** Signifie que l'empreinte numérique (le hash) du fichier sur ton disque correspond exactement à celle fournie par les dépôts officiels.
    
*   **L'astuce de Sherlock :** Si tu as trop de lignes, utilise l'option `-s` (silent) pour que l'outil ne t'avertisse **que si un fichier a été modifié**. Si rien ne s'affiche avec `-s`, ton système est sain !
    

```shell
# Audit d'un paquet (silencieux s'il n'y a pas d'erreur, affiche les fichiers modifiés sinon)
sudo debsums -s coreutils
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/ebe29e74-8dac-4f25-b59d-0aa9e5dde45a.png align="left")

## Le Bonus Entreprise : La gestion de flotte

En production, on ne travaille pas à l'unité sur un seul serveur. On utilise des outils de **gestion de souscriptions et de dépôts centralisés** pour garder le contrôle.

*   **RHSat (Red Hat Satellite) & SUMA (SUSE Manager) :** Imagine que tu doives corriger une faille de sécurité critique sur 2000 serveurs à Toulouse et Hambourg. Ces outils permettent de **"Staging"** les paquets. On fige une version validée des dépôts pour s'assurer que tous les serveurs ont exactement la même version d'un logiciel.
    
*   **RMT (Repository Mirroring Tool) :** Pour les environnements sécurisés sans accès Internet direct (Air-Gap), Sherlock Nexus installe un miroir. Les serveurs récupèrent leurs paquets localement, garantissant vitesse et sécurité.
    
*   **Snap & Flatpak :** La solution au "Dependency Hell". Sherlock Nexus les utilise pour isoler des outils comme **Go** ou **MicroK8s**. Chaque application embarque ses propres bibliothèques, évitant de casser le reste du système.
    

### L'enquête Snap : L'exemple de MicroK8s

Imagine que tu doives installer un cluster Kubernetes local (**MicroK8s**). C'est un outil puissant, mais qui nécessite énormément de dépendances. Pour éviter de polluer le système, Sherlock Nexus choisit **Snap**.

#### 1\. L'Interpellation (Installation)

L'enquête commence par une installation propre. Sherlock utilise l'option `--classic` car MicroK8s a besoin d'un accès spécifique aux ressources du système pour gérer les conteneurs.

```shell
sudo snap install microk8s --classic
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/55c5def3-d0d4-4bc2-a787-20464935f7d0.png align="center")

*   **Le constat de Sherlock :** Contrairement à APT, Snap ne télécharge pas des dizaines de paquets séparés. Il récupère un seul bloc monolithique, signé et certifié par l'éditeur (ici, Canonical).
    

#### 2\. La Fiche d'Identité (`snap list`)

Une fois installé, Sherlock Nexus vérifie ses informations pour s'assurer qu'aucun "imposteur" n'est présent sur le système.

```shell
snap list microk8s
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/bc800add-8c81-4c91-9db8-b6740b864a44.png align="left")

**Le constat de Sherlock Nexus :** La colonne `Éditeur` avec la petite encoche verte confirme la chaîne de confiance. On connaît la version précise (`v1.33.9`) et le canal de suivi (`1.33/stable`). C'est la traçabilité totale : on sait d'où vient le code et qui le maintient.

#### 3\. La Preuve de l'Isolation (`df -h`)

Pour Sherlock Nexus, la plus belle preuve est celle du terrain. En inspectant les points de montage, il découvre comment Snap protège le système.

```shell
df -h | grep microk8s
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/67617ce1-0234-403b-bb3a-26d5f838ca56.png align="left")

**Le constat de Sherlock :** Regarde bien ces lignes. MicroK8s possède ses propres espaces de stockage (`shm`) isolés dans des "sandboxes". Snap monte l'application en **lecture seule**. C'est l'immutabilité : même avec les droits root, modifier le binaire original est impossible car il est verrouillé dans son image compressée.

### Pourquoi Sherlock Nexus valide cette méthode :

*   **L'Isolation :** MicroK8s tourne dans sa propre "bulle" sans toucher à ton Ubuntu.
    
*   **Le Rollback Facile :** Une mise à jour rate ? Sherlock revient en arrière en une seconde : `sudo snap revert microk8s`
    

* * *

### Le mot de la fin

Comprendre son gestionnaire de paquets, c'est maîtriser la chaîne de confiance de son serveur. Sherlock Nexus a bouclé l'enquête, mais le terminal nous réserve encore des mystères...

**Et toi, quelle commande t'a donné le plus de fil à retordre récemment ?**