# Deployment Guide — Kadke Sports

This guide covers four deployment targets: **local Docker Compose**, **Minikube/k3s**, **DigitalOcean Kubernetes (DOKS)**, and **AWS EKS**.

---

## 0. Prerequisites

| Tool          | Version | Notes                                  |
| ------------- | ------- | -------------------------------------- |
| Node.js       | 20+     | For local dev                          |
| pnpm          | 8+      | Monorepo package manager               |
| Docker        | 24+     | For images & local stack               |
| kubectl       | 1.28+   | For Kubernetes                         |
| Helm          | 3.14+   | For production deploy                  |
| Razorpay      | account | Payments — get `KEY_ID` & `KEY_SECRET` |
| Google OAuth  | console | (optional) for Google login            |

---

## 1. Local — Docker Compose (fastest)

```bash
git clone <your-repo> kadke-sports && cd kadke-sports
cp .env.example .env
# Edit .env: set JWT secrets to random 32+ char strings, add Razorpay keys

docker compose up -d --build

# Apply migrations + seed (one-time)
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Visit:
- Storefront → http://localhost:3000
- API & Swagger → http://localhost:4000/api/docs
- MinIO console → http://localhost:9001 (login: `minioadmin` / `minioadmin`)

Login with seeded credentials:
- Admin → `admin@kadkesports.com` / `Admin@123`
- User → `user@kadkesports.com` / `User@123`

With observability profile:
```bash
docker compose --profile observability up -d
# Prometheus → http://localhost:9090
# Grafana → http://localhost:3001 (admin/admin)
```

---

## 2. Minikube / k3s (local Kubernetes)

```bash
minikube start --cpus 4 --memory 8192 --disk-size 30g
minikube addons enable ingress
minikube addons enable metrics-server

# Build images into the cluster's docker
eval $(minikube docker-env)
docker build -t ghcr.io/kadke/backend:latest apps/backend
docker build -t ghcr.io/kadke/frontend:latest apps/frontend

# Deploy via Kustomize (dev)
kubectl apply -k k8s/overlays/dev

# OR via Helm
helm install kadke ./helm/kadke-sports \
  --namespace kadke --create-namespace \
  --set backend.image.tag=latest \
  --set frontend.image.tag=latest \
  --set global.imagePullPolicy=Never

# Hostfile entry for ingress
echo "$(minikube ip) kadkesports.local api.kadkesports.local" | sudo tee -a /etc/hosts
```

---

## 3. DigitalOcean Kubernetes (DOKS)

```bash
# 1. Create cluster (3 nodes, $40/mo node pool is fine for staging)
doctl kubernetes cluster create kadke-prod \
  --region blr1 --version 1.29 --node-pool "name=worker;size=s-2vcpu-4gb;count=3"

doctl kubernetes cluster kubeconfig save kadke-prod

# 2. Install prerequisites
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace

helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace \
  --set installCRDs=true

# 3. Apply cluster-issuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata: { name: letsencrypt-prod }
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ops@kadkesports.com
    privateKeySecretRef: { name: letsencrypt-prod-key }
    solvers: [{ http01: { ingress: { class: nginx } } }]
EOF

# 4. Point your DNS A record for kadkesports.com / api.kadkesports.com at
#    the LoadBalancer IP of ingress-nginx:
kubectl -n ingress-nginx get svc ingress-nginx-controller

# 5. Deploy Kadke
helm install kadke ./helm/kadke-sports \
  --namespace kadke --create-namespace \
  --set global.domain=kadkesports.com \
  --set global.apiDomain=api.kadkesports.com \
  --set-string secrets.databaseUrl="postgresql://kadke:STRONG@postgres:5432/kadke_sports?schema=public" \
  --set-string secrets.jwtAccessSecret="$(openssl rand -base64 48)" \
  --set-string secrets.jwtRefreshSecret="$(openssl rand -base64 48)" \
  --set-string secrets.razorpayKeyId="rzp_live_xxx" \
  --set-string secrets.razorpayKeySecret="xxx" \
  --set-string secrets.postgresPassword="STRONG"
```

---

## 4. AWS EKS

```bash
# 1. Create cluster
eksctl create cluster --name kadke-prod --region ap-south-1 \
  --node-type t3.medium --nodes 3 --nodes-min 2 --nodes-max 10

# 2. Install ALB controller OR use NGINX Ingress (preferred for portability)
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace

# 3. Storage class (gp3)
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: { name: gp3 }
provisioner: ebs.csi.aws.com
parameters: { type: gp3, fsType: ext4 }
allowVolumeExpansion: true
EOF

# 4. Deploy with gp3 storage
helm install kadke ./helm/kadke-sports \
  --namespace kadke --create-namespace \
  --set postgres.persistence.storageClass=gp3 \
  --set minio.persistence.storageClass=gp3 \
  --values production-values.yaml

# 5. (Recommended for AWS) Swap MinIO for S3, Postgres for RDS
#    Set minio.enabled=false, postgres.enabled=false,
#    point secrets.databaseUrl to your RDS endpoint and S3_ENDPOINT to s3.amazonaws.com
```

---

## 5. Post-deploy checklist

- [ ] `kubectl -n kadke get pods` → all Running
- [ ] `kubectl -n kadke logs deploy/kadke-backend` → no errors, "Prisma connected to Postgres"
- [ ] `curl https://api.kadkesports.com/api/health` → `{"status":"ok"}`
- [ ] `curl https://api.kadkesports.com/api/docs` → Swagger UI loads
- [ ] Seed: `kubectl -n kadke exec deploy/kadke-backend -- npx prisma db seed`
- [ ] Change seeded passwords (admin & user) and the seed coupon codes
- [ ] Set up DNS A records → ingress LoadBalancer IP
- [ ] Verify TLS cert provisioned (`kubectl -n kadke get certificate`)
- [ ] Configure Razorpay webhook → `https://api.kadkesports.com/api/payments/rzp/webhook`
- [ ] Install kube-prometheus-stack + Loki for observability

---

## 6. Rollback

```bash
helm rollback kadke -n kadke
# or
kubectl -n kadke rollout undo deploy/kadke-backend
kubectl -n kadke rollout undo deploy/kadke-frontend
```

## 7. Backup

```bash
# Postgres
kubectl -n kadke exec postgres-0 -- pg_dump -U kadke kadke_sports | gzip > kadke-$(date +%F).sql.gz

# MinIO (use mc to mirror)
kubectl -n kadke exec deploy/kadke-minio -- mc mirror /data s3/backup-bucket
```

## 8. Monitoring

Install kube-prometheus-stack:
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n observability --create-namespace
```

Import `infra/grafana-dashboard.json` into Grafana. ServiceMonitor in `k8s/base/41-servicemonitor.yaml` will be auto-discovered.

Install Loki for logs:
```bash
helm install loki grafana/loki-stack -n observability \
  --set fluent-bit.enabled=false --set promtail.enabled=true
```

Fluent Bit is included in `k8s/base/40-fluent-bit.yaml` as an alternative log forwarder.
