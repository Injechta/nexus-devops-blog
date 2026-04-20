---
title: "Kubernetes : K-LAB#2 Transformer son Lab Kubernetes en forteresse"
seoTitle: "K-LAB #2 : Transformer son lab K8s en forteresse blindée"
seoDescription: "De 16 failles à 0 échec : apprenez à sécuriser vos déploiements Kubernetes sur Fedora avec Trivy, Alpine Linux et un SecurityContext imprenable."
datePublished: 2026-04-20T21:02:06.141Z
cuid: cmo7okpbt004s2bpw73gch1sp
slug: kubernetes-k-lab-2-transformer-son-lab-kubernetes-en-forteresse
cover: https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/ef3269b8-6a12-4a62-9b87-21000b4a8ff2.png
ogImage: https://cdn.hashnode.com/uploads/og-images/6989fc595065ae2aa69fc161/4729658a-2fc4-496a-b348-6fcefa5ce144.png
tags: linux, security, kubernetes, cloud-computing, devops, fedora, trivy

---

### 💡 Note de Nexus : Nouveau setup, même combat !

"Petite mise à jour côté coulisses : jusqu'ici, je travaillais exclusivement sur mon laptop sous Ubuntu. Mais pour ce K-LAB#2, j'ai migré sur une tour sous **Fedora**.

C'est l'occasion parfaite de tester la portabilité de mon lab.

J'ai troqué MicroK8s pour **Minikube**, mais tu vas voir que la magie opère :

à part une commande spécifique pour charger l'image (`minikube image load`), mes fichiers YAML et ma logique restent strictement les mêmes.

C'est ça, la promesse de Kubernetes : l'infrastructure devient agnostique du matériel !

> 💡 **Note pour les utilisateurs de MicroK8s :**
> 
> Si comme dans le K-LAB#1 tu travailles sur MicroK8s, la commande `minikube image load` n'existe pas. Tu devras soit exporter/importer ton image en `.tar` via `microk8s ctr image import`, soit utiliser le registre local (`microk8s enable registry`). La destination change, mais le voyage reste le même !

### Rappel

*Dans le premier volet, K-LAB#1, on a réussi ensemble à faire tourner notre API Nexus sur Kubernetes. C'était une belle victoire, mais restons lucides : si on poussait ce code en production tel quel, n'importe quel auditeur de sécurité nous bannirait de la salle serveur.*

*Pourquoi ? Parce qu'une application qui "tourne" peut cacher des centaines de vulnérabilités. Aujourd'hui, on passe en mode* ***DevSecOps****. On va auditer, scanner et durcir notre infrastructure.*

## 1\. L'Audit de Vulnérabilités avec Trivy

La **Supply Chain Security**, c'est s'assurer que les "briques" qu'on utilise (images de base, librairies) ne sont pas empoisonnées. Pour cela, on utilise **Trivy**, l'outil de référence pour scanner les images et les fichiers de config.

### Installation (sur Fedora)

```shell
sudo dnf install trivy -y
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/dafb2c23-8803-42a6-815f-68da97f901fb.png align="left")

### Le verdict du scan

Lançons l'analyse sur notre image `nexus-app:v2` du K-LAB#1 :

```shell
trivy image nexus-app:v2
```

**Le choc :** Tu vas probablement voir apparaître des lignes rouges (**CRITICAL**). Notre image `python:3.11-slim`, bien que "légère", contient des utilitaires système hérités de Debian qui portent des failles connues (CVE).

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/807bb80a-3fb9-4dc9-ad0f-b9af4f5ffccb.png align="left")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/38d6291a-3e0a-4475-8313-6b31fb60a7ed.png align="left")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/eeeac2de-0c34-4b90-8c54-8c6780fdcefe.png align="center")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/3443a8b4-9952-4adb-91a7-520e1db01762.png align="left")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/c54bb374-53e3-419f-902f-12ce91a7b971.png align="left")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/3eea2eab-50f8-4ca5-93e6-c1341e0d3da3.png align="left")

## 2\. Optimisation : Réduire la surface d'attaque

Pour sécuriser un conteneur, la règle est simple : **si ce n'est pas nécessaire, ça ne doit pas être là.** On va passer d'une base Debian (`slim`) à une base **Alpine Linux**, ultra-minimaliste.

### Le Dockerfile v3 "Hardened"

Modifions notre Dockerfile pour réduire son poids et ses failles :

```dockerfile
# On passe sur Alpine (~5MB au lieu de ~100MB pour la base)
FROM python:3.11-alpine

WORKDIR /app

# Alpine utilise adduser au lieu de useradd
RUN adduser -D nexususer

COPY requirements.txt .

# Installation et nettoyage immédiat du cache
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

RUN chown -R nexususer:nexususer /app

USER nexususer

EXPOSE 5000

CMD ["python", "app.py"]
```

**Le gain :** En reconstruisant l'image (`docker build -t nexus-app:v3 .`), tu verras que la taille chute drastiquement et que le scan Trivy devient beaucoup plus "vert".

C'est parti :

```dockerfile
docker build -t nexus-app:v3 .
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/ed15c901-d122-49d1-b80c-302dc6865b1b.png align="left")

### Vérifier le résultat

C'est le moment de vérité pour ton comparatif.

Tape :

```shell
docker images | grep nexus-app
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/d2ec9c1e-17c9-4471-b367-e11c770cfdbc.png align="center")

On a réduit le poids de l'image ! Moins de librairies inutiles, c'est moins de portes ouvertes pour un attaquant.

### Le verdict de Trivy

C'est l'étape de preuve ultime. Lance le scan sur la nouvelle version :

```shell
trivy image nexus-app:v3
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/237ab7c1-86a9-4179-88f0-3e27259d0dc9.png align="left")

Le verdict est sans appel : en passant sur Alpine, on a nettoyé toutes les vulnérabilités critiques du système. Il ne reste que quelques failles mineures sur les outils de package Python, une surface d'attaque drastiquement réduite !

## 3\. Analyse IaC : Scanner nos fichiers YAML

> Lancer Trivy sur une image non sécurisée, c'est un peu comme passer un contrôle technique après avoir ignoré tous les voyants du tableau de bord : **ça finit rarement dans le vert, et ça pique un peu les yeux.**

Avoir une image sécurisée, c'est bien. Avoir une configuration de déploiement sécurisée, c'est mieux. Tes fichiers YAML (**Infrastructure as Code**) sont le plan de montage de ta forteresse. S'il y a une faille dans le plan, la forteresse tombera.

Utilisons à nouveau **Trivy**, mais cette fois pour scanner notre configuration :

```shell
trivy config deployment.yaml
```

### Le diagnostic

> Trivy va pointer du doigt plusieurs manques de sécurité (les fameux "Misconfigurations") :
> 
> *   **Privileged access** : Ton conteneur a-t-il trop de droits sur le noyau Linux ?
>     
> *   **Resource Limits** : Si ton app bug et consomme toute la RAM de ta tour Fedora, ton cluster plante.
>     
> *   **Root User** : Même si on a créé `nexususer`, est-on sûr que Kubernetes ne forcera pas le passage en root ?
>     

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/dabf0bcd-68ab-448f-b3b0-4fbce7419bdf.png align="left")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/de61d38f-2838-49f6-81e9-8534b771a1bc.png align="center")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/211278c6-1a4c-4142-ad4a-e5226b9d4633.png align="center")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/bea246fa-31a2-4cb0-8ef6-5ffe98ca7489.png align="center")

### Le diagnostic : 16 vulnérabilités dans 25 lignes de code !

En lançant le scan sur mon fichier d'origine, le verdict tombe : **16 Misconfigurations**. C'est le moment où l'on réalise que Kubernetes, par défaut, est très pour ne pas dire trop permissif.

Voici les alertes les plus critiques remontées par Trivy sur ma tour Fedora :

> *   **HIGH (KSV-0118)** : On utilise le `default security context`. En gros, on laisse les clés de la maison sous le paillasson.
>     
> *   **HIGH (KSV-0014)** : `Root file system is not read-only`. Un attaquant qui prend le contrôle du pod pourrait modifier les fichiers système du conteneur.
>     
> *   **MEDIUM (KSV-0012)** : `runAsNonRoot` n'est pas défini. Kubernetes pourrait techniquement lancer le pod en tant que root si on ne l'interdit pas explicitement.
>     
> *   **LOW (KSV-0011/0018)** : Absence de limites CPU et Mémoire. C'est la porte ouverte aux "Noisy Neighbors" qui saturent le cluster.
>     

### La solution : Le blindage du Deployment

Pour corriger ces 16 erreurs d'un coup, on va appliquer un **SecurityContext** strict et définir des **Resources Quotas**.

Voici le fichier `deployment.yaml` version "forteresse" :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexus-deployment
  namespace: nexus-lab
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexus-api
  template:
    metadata:
      labels:
	app: nexus-api
    spec:
      # --- BLINDAGE NIVEAU POD ---
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      # ---------------------------
      containers:
      - name: nexus-container
        image: nexus-app:v3
        imagePullPolicy: Never
        ports:
        - containerPort: 5000
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
          requests:
            memory: "64Mi"
            cpu: "250m"
        # --- BLINDAGE NIVEAU CONTENEUR ---
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
              - ALL
        # ---------------------------------
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 10
```

### Le résultat final : 0 échecs !

Une fois ces modifications appliquées, relance le scan :

```shell
trivy config deployment.yaml
```

Si tu as bien suivi, Trivy affichera maintenant un magnifique **Failures: 0**.

C'est la satisfaction ultime : voir son infrastructure passer au vert.

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/9798be1d-0588-49b7-add0-7803d5464496.png align="left")

Note : J'ai aussi scanné mon `service.yaml`. Résultat ? 0 faille.

C'est normal : un Service est une règle de routage réseau interne, il n'embarque pas de processus vulnérable.

### 4\. Déploiement et Transition "Zero Downtime"

Maintenant qu'on a l'image **v3** et le YAML blindé, il faut envoyer tout ça sur notre cluster. Sur Fedora avec **Minikube**, la procédure est simple :

```bash
# 1. Charger l'image optimisée dans le cluster
minikube image load nexus-app:v3

# 2. Appliquer la configuration finale
kubectl apply -f deployment.yaml -n nexus-lab
```

**La magie de Kubernetes :** Si tu tapes `kubectl get pods -n nexus-lab -w`, tu verras Kubernetes opérer un **Rolling Update**. Il remplace tes anciens pods (non sécurisés) par les nouveaux (blindés) un par un. Aucun utilisateur ne verra de coupure de service. On a renforcé les fondations du bâtiment sans même faire sortir les locataires !

```shell
kubectl get pods -n nexus-lab -w
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/64cc711e-6f11-4ed5-a5c7-1b8abdd68f19.png align="left")

### 5\. La preuve par le feu : On teste le blindage !

Avoir un score de "0 échec" sur Trivy, c'est satisfaisant. Mais vérifier que ces barrières sont **réellement actives** sur le terrain, c'est encore mieux. Voici comment j'ai crash-testé mes nouveaux pods.

#### A. Vérification de l'image et du contexte

D'abord, on s'assure que Kubernetes a bien injecté nos règles de sécurité. En inspectant le pod en direct, on retrouve bien nos précieux paramètres de sécurité :

```shell
# On vérifie que chaque Pod tourne avec la v3
kubectl get pods -n nexus-lab -o custom-columns="POD:.metadata.name,IMAGE:.spec.containers[*].image"

# On inspecte le SecurityContext injecté
kubectl get pod [NOM_DU_POD] -n nexus-lab -o yaml | grep -A 15 securityContext
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/fa89dde6-8340-4e50-8dea-6effe95f17b6.png align="left")

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/c5ef975b-7a67-45c0-8f03-51eafa307e2d.png align="center")

Dans la sortie, on peut voir que Kubernetes a bien verrouillé le `runAsUser: 10001` et activé le profil `seccomp` par défaut.

#### B. Le Crash-Test : Tentative d'intrusion

> Avec le `readOnlyRootFilesystem` à `true`, mon conteneur est devenu plus têtu qu'un administrateur système un vendredi soir à 17h : **on peut regarder, mais on ne touche à rien !**

C'est le test ultime. Imaginez un attaquant qui réussit à s'introduire dans le conteneur. Sa première action ? Tenter de créer un fichier malveillant ou un script à la racine pour persister.

Tentons de forcer l'écriture d'un fichier :

```shell
kubectl exec -it [NOM_DU_POD] -n nexus-lab -- touch /test.txt
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/09a02a42-cfe8-4bdd-a2e6-f5fcfb440723.png align="center")

**Le verdict est sans appel :**

> `touch: /test.txt: Read-only file system`

Le système de fichiers est verrouillé. Même avec un accès au conteneur, l'attaquant est pied et poings liés. C'est là que le paramètre `readOnlyRootFilesystem: true` prend tout son sens.

### Conclusion : Ta forteresse est prête

Sécuriser, ce n'est pas une option, c'est une hygiène de vie pour un ingénieur DevOps. En quelques étapes, nous avons :

*   **Audité** nos briques logicielles pour éliminer les failles invisibles.
    
*   **Réduit** notre surface d'attaque en passant sur une base **Alpine Linux**.
    
*   **Verrouillé** le comportement de nos pods grâce au `securityContext`.
    

Notre lab Nexus n'est plus seulement fonctionnel, il est **résilient**. Et le plus beau dans tout ça ? Peu importe que tu sois sur Ubuntu ou Fedora, le résultat est le même : un cluster sain et pro.

**Et la suite ?** Une forteresse est inutile si on ne voit pas ce qui s'y passe à l'intérieur. Dans le **K-LAB#3**, nous allons installer nos premières "caméras de surveillance".**Parce qu'une sécurité aveugle, c'est un peu comme une porte blindée sans judas.**

Rendez-vous au K-LAB#3 pour le monitoring !

Que la forge soit avec toi !