---
title: "Kubernetes : K-LAB#1 
Déployer une API Python sécurisée sur Kubernetes (et survivre au CrashLoopBackOff)"
seoTitle: "K-LAB#1 : Déployer une API Python sur Kubernetes (Pas à Pas)"
seoDescription: "Déployez une API Python sur MicroK8s (K-LAB#1). Maîtrisez Pods, Services et évitez le CrashLoopBackOff. Le guide pratique signé Nexus DevOps !"
datePublished: 2026-02-19T18:19:01.958Z
cuid: cmltsbvsy00f62boxf7b99za8
slug: k-lab-1-deployer-api-python-kubernetes
cover: https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/7da181f6-d37b-424b-8e07-ead76a209557.png
ogImage: https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/og-images/6989fc595065ae2aa69fc161/631fb70a-69ea-4f0c-b7b4-47932a660193.png
tags: tutorial, python, kubernetes, devops, cloud-native

---

Dans cet article, je te propose de m'accompagner dans la création d'un laboratoire DevOps complet. L'objectif est de passer d'un simple script Python à une infrastructure **immuable, scalable et auto-guérie** sur un cluster **MicroK8s**.

**Pourquoi ce setup ?** Dans un environnement de production , on ne déploie jamais en tant que `root` et on ne laisse jamais une application sans surveillance. Ce lab simule ces contraintes réelles.

* * *

## 1\. Préparation de l'espace de travail

Tout d'abord, créons un dossier propre pour isoler notre projet :

```shell
mkdir ~/lab-nexus && cd ~/lab-nexus
```

## 2\. L'Application et ses dépendances

Je vais utiliser **Flask**. Le point crucial ici est la route `/health` qui servira de "sonde de vie" (Liveness Probe) à Kubernetes.

**Fichier** `app.py` **:**

```python
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify(
        message="Bienvenue sur l'API Nexus v2 !",
        status="Running",
        environment=os.getenv("ENV", "Production")
    )

@app.route('/health')
def health():
    # Kubernetes utilisera cette route pour vérifier si le conteneur doit être redémarré
    return jsonify(status="UP"), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**Fichier** `requirements.txt` **:**

```plaintext
flask
```

* * *

## 3\. La Conteneurisation : Sécurité "By Design"

Le Dockerfile est conçu pour être léger. Nous appliquons le **principe du moindre privilège** en créant un utilisateur dédié.

**Fichier** `Dockerfile` **:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Sécurité : Création d'un utilisateur non-privilégié
RUN useradd -m nexususer

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# On garantit que notre utilisateur possède les droits sur le dossier de travail
RUN chown -R nexususer:nexususer /app
USER nexususer

EXPOSE 5000
CMD ["python", "app.py"]
```

**Commande de Build :**

Ne pas oublier le . dans la commande

```shell
docker build -t nexus-app:v2 .
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/00d31b2a-7fce-4be2-82a2-c7a8d2892103.png align="center")

On peut vérifier que notre image a bien été construite :

```shell
docker images | grep nexus-app
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/cfdf95f4-3a05-417c-840a-218600a062ed.png align="center")

**Création du Namespace :**

Avant de lancer nos services, créons un **Namespace**. C'est une cloison virtuelle qui permet d'isoler notre projet des autres composants du cluster.

```shell
microk8s kubectl create namespace nexus-lab
```

Ici, on va définir 3 répliques pour la haute disponibilité et configurer la surveillance automatique.

**Fichier** `deployment.yaml` **:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexus-deployment
  namespace: nexus-lab
spec:
  replicas: 3 # Haute disponibilité
  selector:
    matchLabels:
      app: nexus-api
  template:
    metadata:
      labels:
        app: nexus-api
    spec:
      containers:
      - name: nexus-container
        image: nexus-app:v2
        imagePullPolicy: Never
        ports:
        - containerPort: 5000
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 10
```

**Fichier** `service.yaml` **(Exposition) :**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nexus-service
  namespace: nexus-lab
spec:
  selector:
    app: nexus-api
  ports:
    - protocol: TCP
      port: 80         # Port externe
      targetPort: 5000 # Port interne de l'app
  type: NodePort
```

* * *

## 5\. Déploiement sur MicroK8s

**Note importante :** MicroK8s utilise `containerd` et ne partage pas automatiquement le cache de notre Docker local. Il faut donc importer l'image manuellement dans le registre du cluster.

**Importation et lancement :**

1.  Export/Import de l'image
    
2.  Application des configurations
    

```shell
# 1.Export/Import de l'image
docker save nexus-app:v2 > nexus-app.tar
microk8s ctr image import nexus-app.tar

# 2.Application des configurations
microk8s kubectl apply -f deployment.yaml
microk8s kubectl apply -f service.yaml
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/5dcc8345-e96b-4d17-b495-8e5d82f68b7d.png align="center")

## 6\. Troubleshooting : Résoudre le CrashLoopBackOff

C'est l'étape la plus formatrice. Lors du premier déploiement, mes pods affichaient `CrashLoopBackOff`.

**Diagnostic :** `microk8s kubectl logs [nom-du-pod]`

> *Error: ModuleNotFoundError: No module named 'flask'*

**Analyse :** En passant à l'utilisateur `nexususer`, Python ne pouvait plus accéder aux packages installés si les permissions n'étaient pas correctement définies sur les répertoires de travail.

**La solution :** L'ajout de `RUN chown -R nexususer:nexususer /app` dans le Dockerfile a permis à notre utilisateur restreint de posséder son environnement d'exécution et de charger les modules Flask correctement.

* * *

## 7\. Résultat Final

Pour vérifier que tout fonctionne, on observe les pods passer au vert :

```shell
microk8s kubectl get pods -n nexus-lab
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/ceeaf0b2-e3cb-4cb6-83cf-bd3bd46665ef.png align="center")

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/2eedea19-fe53-489d-9d90-21b54a40d66d.png align="center")

Puis on récupère le port d'accès :

Le port externe est généré dynamiquement par Kubernetes (entre 30000 et 32767). On le trouvera dans la colonne PORT(S) du `get svc`."

```shell
microk8s kubectl get svc nexus-service -n nexus-lab
```

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/4d36a353-2d66-4ac6-affb-54e797e11dbb.png align="center")

L'application est désormais accessible sur `http://localhost:[TON_PORT]`.

Pour moi ce sera donc `http://localhost:30973`:

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/aea1d1ba-b24b-4874-a9b1-7e88eb7dcbd1.png align="left")

### **8\. Nettoyage : Le grand coup de balai**

Pour remettre notre environnement dans son état initial, nous allons supprimer les ressources Kubernetes, l'image et les fichiers locaux.

**A. La méthode "Atomique" (Supprimer le Namespace)**

C'est l'avantage d'avoir utilisé un Namespace dédié : au lieu de supprimer chaque fichier un par un, on supprime le "tiroir" `nexus-lab`, et Kubernetes détruit automatiquement tout ce qui est dedans (Pods, Déploiements, Services).

```shell
microk8s kubectl delete namespace nexus-lab
```

**B. Supprimer l'image du cluster**

Même si les ressources sont supprimées, l'image reste dans le cache de `containerd`. Pour libérer l'espace :

```shell
# Lister pour vérifier le nom exact
microk8s ctr image ls | grep nexus

# Supprimer l'image
microk8s ctr image rm docker.io/library/nexus-app:v2
```

**C. Supprimer les fichiers de travail**

Attention, cette commande est irréversible. Elle supprime votre dossier local :

```shell
cd ~
rm -rf ~/lab-nexus
```

* * *

### **Note : Pourquoi reste-t-il des ressources ?**

Si vous lancez `microk8s kubectl get pods -A`, vous verrez toujours des composants dans le namespace **kube-system** (Calico, CoreDNS, etc.).

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/48be8d6a-3d13-45a2-a9cb-ff0d6ba7b7b9.png align="center")

![](https://cloudmate-test.s3.us-east-1.amazonaws.com/uploads/covers/6989fc595065ae2aa69fc161/36196415-d084-4840-a2ec-5850c047a417.png align="center")

**C'est tout à fait normal !** Ce sont les organes vitaux de MicroK8s. Le nettoyage est considéré comme réussi dès que le namespace `nexus-lab` a disparu et que votre commande `kubectl get pods -n nexus-lab` renvoie une erreur ou un message "*No resources found in nexus-lab namespace*".

On a maintenant une API Python parfaitement orchestrée et isolée dans son propre namespace sur MicroK8s.  
Mais malheureusement "fonctionnel" ne signifie pas "prêt pour la production".

### **Ne nous contentons pas de déployer, sécurisons la maison !**

Dans le prochain volet, le **K-LAB#2**, nous allons faire passer notre projet au niveau supérieur en nous concentrant sur la **Supply Chain Security** :

*   **Audit de vulnérabilités :** Nous apprendrons à utiliser **Trivy** pour scanner notre image Docker et traquer les failles de sécurité (CVE) cachées dans nos dépendances.
    
*   **Analyse IaC :** Nous passerons nos fichiers YAML au détecteur de métaux pour vérifier qu'ils respectent les meilleures pratiques de sécurité.
    
*   **Optimisation :** Nous verrons comment réduire la surface d'attaque de notre conteneur.
    

Le voyage dans la "Forge Kubernetes du Mordor" ne fait que commencer.

Restez connectés pour transformer votre cluster en une véritable forteresse !

**On se retrouve au K-LAB#2 ? 😉**

**Que la forge soit avec toi**