# Micro-Consult Infra

This folder contains the Infrastructure-as-Code (IaC) and automation scripts for deploying and validating the **Expert Snapshot Legal** application into Azure.

---

## 📂 Structure

infra/ ├── main.bicep # Consolidated IaC: infra + env vars (Key Vault refs for secrets) ├── scripts/ │ ├── post_deploy.sh # UAMI assignment, App Registrations, App Settings │ ├── post_deploy_dns_ssl.sh # Extract outbound IPs, default hostname, SSL thumbprints │ ├── validate_deploy.sh # DNS, HTTPS, SSL, login, SQL, ACS validation │ └── deploy_runbook.sh # Combined runbook chaining all steps end-to-end

Code

---

## 🚀 Deployment Steps

1. **Provision Infra**
   ```bash
   az deployment group create \
     --resource-group rg-legal-ai-prod \
     --template-file main.bicep
Run Post-Deploy Automation

bash
./scripts/post_deploy.sh
Extract DNS/IP/SSL Values

bash
./scripts/post_deploy_dns_ssl.sh
Copy Primary IP → update GoDaddy A record (@).

Copy Default Hostname → update GoDaddy CNAME record (www).

Copy SSL Thumbprints → bind certs.

Update GoDaddy DNS

@ → A record → new App Service IP.

www → CNAME → new App Service default hostname.

Bind SSL Certificates

bash
az webapp config ssl bind \
  --resource-group rg-legal-ai-prod \
  --name expert-snapshot-legal-docker \
  --certificate-thumbprint <THUMBPRINT_ROOT> \
  --ssl-type SNI

az webapp config ssl bind \
  --resource-group rg-legal-ai-prod \
  --name expert-snapshot-legal-docker \
  --certificate-thumbprint <THUMBPRINT_WWW> \
  --ssl-type SNI
Validate Deployment

bash
./scripts/validate_deploy.sh
Confirms DNS resolution.

Tests HTTPS endpoints.

Dumps SSL cert subject/issuer/dates.

Validates login callback.

Runs SQL connectivity check.

Sends ACS test email.

Full Runbook (Optional) Run everything in sequence:

bash
./scripts/deploy_runbook.sh
🛠 Rollback
If validation fails and you want to tear down the environment:

bash
az group delete --name rg-legal-ai-prod --yes --no-wait
⚠️ This deletes the entire resource group and all resources inside it.

✅ Best Practices
Secrets: Always store in Key Vault, never in plain JSON files.

IaC: main.bicep is the single source of truth.

Scripts: Use scripts/ for automation, keep IaC separate.

DNS: Update GoDaddy A + CNAME records after each new environment deployment.

Validation: Always run validate_deploy.sh before considering the environment production-ready.

