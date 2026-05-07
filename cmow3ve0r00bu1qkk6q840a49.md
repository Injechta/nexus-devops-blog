---
title: "Project Sky Deploy
"
datePublished: 2026-05-07T23:16:47.164Z
cuid: cmow3ve0r00bu1qkk6q840a49
slug: project-sky-deploy

---

### 1\. Création du cluster Kind

Lance la création du cluster avec le nom de ton choix. Pour ma part ce sera `sky-deploy` :

```shell
kind create cluster --name sky-deploy
```

![](https://cdn.hashnode.com/uploads/covers/6989fc595065ae2aa69fc161/7f279e46-bede-4511-a561-6e496e649ca9.png align="center")

### 2\. Création et initialisation du repo

```shell
git init
gh repo create sky-deploy-infra --public --source=. --remote=origin
```

Avant de passer à l'étape 3, il est crucial d'avoir un fichier à "donner" à ArgoCD. Dans ton terminal, tape ceci :

```shell
# Créer un déploiement de test
cat <<EOF > app-test.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sky-web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sky-web
  template:
    metadata:
      labels:
        app: sky-web
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
EOF
```

### 3\. Installation d'ArgoCD (La méthode "Industrialisée")

Une fois que le cluster est prêt, on utilise Helm. L'avantage de passer par Helm, c'est que l'on pourra plus tard mettre nos configurations dans un fichier `values.yaml`, ce qui est très apprécié en entreprise.

```shell
# Ajout du repo si ce n est pas déjà fait
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Installation dans le namespace dédié
helm install argocd argo/argo-cd --create-namespace --namespace argocd
```