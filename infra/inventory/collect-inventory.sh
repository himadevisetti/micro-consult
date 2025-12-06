#!/bin/bash
set -e

echo "Collecting resources from rg-legal-ai-dev..."
az resource list --resource-group rg-legal-ai-dev -o json > rg-legal-ai-dev.json

echo "Collecting resources from rg-microConsult-dev..."
az resource list --resource-group rg-microConsult-dev -o json > rg-microConsult-dev.json

# --- Cognitive Services (Form Recognizer / AI Foundry) ---
echo "Collecting Cognitive Services (Form Recognizer)..."
az cognitiveservices account show --name legal-ai-foundry-dev --resource-group rg-legal-ai-dev -o json > legal-ai-foundry-dev.json

# --- Storage ---
echo "Collecting Storage Account..."
az storage account show --name retainerdocs --resource-group rg-legal-ai-dev -o json > retainerdocs.json

# --- App Service ---
echo "Collecting App Service details..."
az webapp show --name expert-snapshot-legal-docker --resource-group rg-legal-ai-dev -o json > expert-snapshot-legal-docker.json
az webapp config appsettings list --name expert-snapshot-legal-docker --resource-group rg-legal-ai-dev -o json > expert-snapshot-legal-docker-settings.json

# --- App Service Plan ---
echo "Collecting App Service Plan..."
az appservice plan show --name expert-snapshot-legal-plan --resource-group rg-legal-ai-dev -o json > expert-snapshot-legal-plan.json

# --- Managed Identity ---
echo "Collecting Managed Identity..."
az identity show --name expert-snapshot-legal-uami --resource-group rg-legal-ai-dev -o json > expert-snapshot-legal-uami.json

# --- SQL Server + Database ---
echo "Collecting SQL Server..."
az sql server show --name microconsult-sqlserver-dev --resource-group rg-microConsult-dev -o json > microconsult-sqlserver-dev.json

echo "Collecting SQL Databases..."
az sql db show --name expert-snapshot-legal-db-dev --server microconsult-sqlserver-dev --resource-group rg-microConsult-dev -o json > expert-snapshot-legal-db-dev.json

# --- App Insights (keep only required ones) ---
echo "Collecting App Insights (expert-snapshot-legal202511141723)..."
az monitor app-insights component show --app expert-snapshot-legal202511141723 --resource-group rg-legal-ai-dev -o json > expert-snapshot-legal202511141723-ai.json

echo "Collecting App Insights (microconsult-analytics-prod)..."
az monitor app-insights component show --app microconsult-analytics-prod --resource-group rg-legal-ai-dev -o json > microconsult-analytics-prod-ai.json

# --- Log Analytics Workspace (optional, but included for completeness) ---
echo "Collecting Log Analytics Workspace..."
az monitor log-analytics workspace show --resource-group rg-legal-ai-dev --workspace-name DefaultWorkspace-bb452d16-1e92-4afd-af21-c2808944be28-USW3 -o json > log-analytics-workspace.json

# --- Communication Services ---
echo "Collecting Communication Services..."
az communication email show --name acs-email-microConsult --resource-group rg-microConsult-dev -o json > acs-email-microConsult.json
az communication show --name acs-core-microConsult --resource-group rg-microConsult-dev -o json > acs-core-microConsult.json

# --- App Registrations ---
echo "Collecting App Registration: ExpertSnapshotAuth..."
az ad app show --id facb92f0-86db-4116-99c7-071c469c5718 -o json > ExpertSnapshotAuth.json

echo "Collecting App Registration: GraphDocxConverter..."
az ad app show --id 4afe5d49-f775-42d7-a625-7fabce4df597 -o json > GraphDocxConverter.json

echo "Inventory collection complete."

