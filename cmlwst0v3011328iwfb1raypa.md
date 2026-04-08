---
title: "La Toolbox DevSecOps : 
Sécuriser vos images Docker avec Trivy"
seoTitle: "Sécuriser tes conteneurs Docker avec Trivy : Guide complet"
seoDescription: "Tu veux sécuriser ta Forge ? installes Trivy et scannes tes images Docker pour détecter tes failles de sécurité, pas à pas. Ton guide commence içi"
datePublished: 2026-02-21T20:55:40.194Z
cuid: cmlwst0v3011328iwfb1raypa
slug: la-toolbox-devsecops-securiser-vos-images-docker-avec-trivy
cover: https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/175858ca-070f-4e40-b019-8b8ff4e55688.png
ogImage: https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/og-images/6989fc595065ae2aa69fc161/ce06c7e0-3b94-4247-abfd-6ca443e176c0.png
tags: tutorial, docker, cybersecurity, devsecops, trivy

---

## **I. Qu’est-ce que Trivy ?**

***Dans l’univers de The Mandalorian, aucune pièce d'armure ne quitte la Forge sans avoir été purifiée et martelée selon le Code. Déployer un conteneur sur Kubernetes sans vérification, ce serait comme partir au combat avec une armure en simple plastique : une erreur fatale. Trivy, c'est l'équivalent du regard de l'Armurière sur votre Beskar. Avant que votre image Docker ne soit intégrée à la "Grande Armée" de votre cluster, Trivy l'inspecte sous toutes les coutures. Il détecte les impuretés (les vulnérabilités) et les failles de conception dans vos fichiers de configuration.***

> ***"Le scan est le chemin."***

Développé par Aqua Security, Trivy est devenu un standard du **DevSecOps** pour plusieurs raisons :

*   **Polyvalence :** Il ne scanne pas que les images Docker. Il analyse aussi tes fichiers **YAML** Kubernetes, tes dépôts Git, et même tes systèmes de fichiers locaux ;
    
*   **Vitesse :** Il est extrêmement rapide. En quelques secondes, il compare ton code à d'énormes bases de données de vulnérabilités (**CVE**).
    
*   **Simplicité :** Pas de base de données complexe à gérer ou de serveur lourd. C'est un simple binaire.
    

### A quoi sert-il concrètement ?

*   **Scanner les vulnérabilités (OS & Langages) :** Il détecte si les paquets installés dans ton image Python (ou autre) ont des failles connues.
    
*   **Détecter les erreurs de configuration (IaC) :** Il te prévient si ton fichier `deployment.yaml` permet à un conteneur de s'exécuter en mode root ;
    
*   **Analyse de secrets :** Il peut repérer si tu as accidentellement laissé un mot de passe ou une clé API dans ton code
    

## **II. Installation : La méthode robuste**

Comme tu le sais, les méthodes par dépôt APT peuvent parfois être capricieuses. Pour garantir une installation qui fonctionne du premier coup nous allons utiliser le paquet officiel `.deb`.

### **Conseil : Quelle architecture choisir ?**

Avant de télécharger le paquet, on doit connaître l'architecture de notre machine. Pour cela, on va lancer cette commande dans votre terminal :

```shell
uname -a
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/124ad2bc-c573-48b3-a54d-0f81990d7574.png align="center")

**Interprétons le résultat retourné par la commande :**

*   `x86_64` : Tu as un processeur 64-bit classique (Intel/AMD), Il te faudra choisir le fichier `trivy_X.X.X_Linux-64bit.deb` ;
    
*   `aarch64` ou `arm64` : Tu es sur une puce ARM, il te faudra choisir le fichier `trivy_X.X.X_Linux-ARM64.deb`
    

Si tu vois apparaître `x86_64` comme sur ma machine sadhill (capture du dessus), c'est que tu es sur une architecture classique. C'est ce que nous utiliserons dans ce guide.

### **1\. Téléchargement du paquet**

On récupère la version stable directement depuis le [**GitHub officiel**](https://github.com/aquasecurity/trivy/releases/tag/v0.69.1).

```shell
wget https://github.com/aquasecurity/trivy/releases/download/v0.59.1/trivy_0.59.1_Linux-64bit.deb
```

*(Note : Penses à vérifier la dernière version sur le GitHub d'Aqua Security !)*

### **2\. Installation système**

On utilise `dpkg` pour intégrer l'outil à nos binaires système :

```shell
sudo dpkg -i trivy_0.59.1_Linux-64bit.deb
```

### **3\. Nettoyage**

Une fois installé, le fichier `.deb` ne nous sert plus à rien. On fait place nette :

```shell
rm trivy_0.59.1_Linux-64bit.deb
```

### **4\. Vérification**

Si tout est bon, cette commande doit vous répondre avec fierté :

```shell
trivy --version
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/92401a83-8e97-484f-8fc5-3dc9cf71ebbb.png align="center")

## **III. Utilisation de Trivy : Scanner une image**

Rien de tel qu'une démonstration pour comprendre l'utilité de l'outil. En l’occurrence je vais demander à Trivy d’ausculter une image que l'on utilise parfois par défaut : `python:latest`.

```shell
trivy image python:latest 
```

**Ce qui apparaît :** Une liste impressionnante de vulnérabilités classées par sévérité :

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/02444e40-b886-4e39-a141-91ecded577cc.png align="center")

> ***L'astuce de la Forge =>*** *Si tu lances Trivy sur une image comme* `python:3.9-slim` ou `python:3.9-alpine`, tu vois que le nombre de vulnérabilités *chute drastiquement. C'est une des premières leçons du DevSecOps : réduire la surface d'attaque en choisissant des images de base minimalistes.*

### **À l'aide, mon terminal déborde**

> \-We are sinking, we're sinking !
> 
> \-What are you thinking about ?

Une fois le scan lancé, ne panique pas si tu vois défiler des vagues de lignes à toute vitesse. C'est l'effet kisscool de Trivy.

Par défaut, l'outil est extrêmement exhaustif : il liste chaque bibliothèque, chaque dépendance et chaque vulnérabilité, même la plus minime.

Le problème ? Notre terminal a une mémoire limitée (le ***scrollback buffer***). Si l'image scannée est lourde, le début du rapport —(là où se trouvent parfois les informations les plus cruciales ) disparaît avant même que nous n'ayons pu le lire.

Pour dompter ce flux d'informations et transformer ce "bruit" en données exploitables, je te propose trois méthodes pour reprendre le contrôle :

### **1\. La méthode "Pagination" (Lecture tranquille)**

La commande suivante utilise le symbole `|` (appelé "pipe") pour rediriger ce flux vers l'outil `less` , qui permet de parcourir le résultat page par page :

```bash
trivy image python:3.9-slim | less -R
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/a3881723-cba7-4a94-8b38-ca1616ae8ab1.png align="center")

*   **Contrôle total :** Tu peux naviguer ligne par ligne avec les flèches de ton clavier ou page par page avec la barre d'espace.
    
*   **Mémoire préservée :** Tu ne dépends plus de la capacité de ton terminal à stocker l'historique du texte.
    
*   **Navigation simple :** Appuie sur **q** à tout moment pour quitter le rapport et reprendre la main sur ton terminal.
    

### **2\. La méthode "Filtre de sévérité" (Aller à l'essentiel)**

Au lieu de tout voir, on ne demande à Trivy que ce qui est vraiment dangereux.

```bash
trivy image --severity HIGH,CRITICAL python:3.9-slim
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/ab260821-f14b-4c24-bed2-ac2b8985e636.png align="center")

Cela élimine les alertes "Low" et "Medium" qui remplissent souvent 80% de l'écran pour rien.

### **3\. La méthode "Export" Pour une analyse approfondie**

Parfois, lire un rapport de sécurité directement dans le terminal n'est pas le plus confortable. Pour prendre le temps d'analyser chaque faille ou pour archiver tes résultats, tu peux exporter le rapport complet dans un fichier texte :

```shell
trivy image python:3.9-slim > resultat_trivy.txt
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/a71e888a-49fd-4146-9822-8c3fa2993575.png align="center")

Tu pourras ensuite ouvrir ce fichier avec n'importe quel éditeur de texte (VS Code, Nano, ou même ton bloc-notes) *pour effectuer des recherches précises.*

Pour les besoins plus avancés (automatisation, rapports visuels), Trivy supporte aussi les exports au format **JSON** ou **HTML**, mais le format texte reste notre meilleur allié pour un diagnostic rapide.

### **Conclusion**

Ton outil est désormais en place et tu es prêt à détecter les failles avant qu'elles ne deviennent des brèches.

**La suite du chemin ?** Dans le prochain article, nous ne nous contenterons plus de scanner manuellement. Nous allons intégrer ce rituel directement dans nos pipelines pour que plus aucune vulnérabilité ne puisse franchir les portes de notre cluster Kubernetes.