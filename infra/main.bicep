// main.bicep

targetScope = 'resourceGroup'

@description('App Service Plan')
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' existing = {
  name: 'expert-snapshot-legal-plan'
}

@description('User Assigned Managed Identity')
resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' existing = {
  name: 'expert-snapshot-legal-uami'
}

@description('App Service (Docker)')
resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: 'expert-snapshot-legal-docker'
  location: 'westus3'
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned, UserAssigned'
    userAssignedIdentities: {
      '${uami.id}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|ghcr.io/himadevisetti/expert-snapshot-legal:latest'
      appSettings: [
        // Non-secret env vars
        { name: 'FRONTEND_BUILD_PATH'; value: '/app/frontend' }
        { name: 'STORAGE_PATH'; value: '/storage' }
        { name: 'DEBUG_LOGS'; value: 'true' }
        { name: 'DEBUG_READ_FIELDS'; value: 'false' }
        { name: 'DEBUG_TRACE'; value: 'false' }
        { name: 'NODE_ENV'; value: 'production' }
        { name: 'CANDIDATE_TTL_MS'; value: '86400000' }
        { name: 'BIND_HOST'; value: '0.0.0.0' }
        { name: 'CHROME_BIN'; value: '/usr/bin/google-chrome' }
        { name: 'PYTHON_BIN'; value: '/opt/venv/bin/python3' }
        { name: 'DISABLE_TELEMETRY'; value: 'false' }
        { name: 'AZURE_FORM_RECOGNIZER_ENDPOINT'; value: 'https://legal-ai-foundry-dev.services.ai.azure.com/' }
        { name: 'GRAPH_CLIENT_ID'; value: '4afe5d49-f775-42d7-a625-7fabce4df597' }
        { name: 'GRAPH_REFRESH_TOKEN'; value: '<token>' } // consider moving to KV if sensitive
        { name: 'GRAPH_TENANT'; value: 'consumers' }
        { name: 'AZURE_STORAGE_ACCOUNT_NAME'; value: 'retainerdocs' }
        { name: 'AZURE_STORAGE_CONTAINER_NAME'; value: 'documents' }
        { name: 'APPINSIGHTS_INSTRUMENTATIONKEY'; value: appInsights.properties.InstrumentationKey }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'; value: appInsights.properties.ConnectionString }
        { name: 'AZURE_SQL_SERVER'; value: 'microconsult-sqlserver-dev.database.windows.net' }
        { name: 'AZURE_SQL_DATABASE'; value: 'expert-snapshot-legal-db-dev' }
        { name: 'AZURE_SQL_USER'; value: 'sqladmin' }
        { name: 'SQL_CONNECTION_TIMEOUT'; value: '30000' }
        { name: 'SQL_REQUEST_TIMEOUT'; value: '30000' }
        { name: 'JWT_EXPIRES_IN'; value: '8h' }
        { name: 'VERIFICATION_TOKEN_TTL_HOURS'; value: '24' }
        { name: 'RESET_TOKEN_TTL_HOURS'; value: '1' }
        { name: 'APP_BASE_URL'; value: 'https://expert-snapshot-legal-docker-dvbvcmajcpetekb5.westus3-01.azurewebsites.net' }
        { name: 'AZURE_CLIENT_ID'; value: '94dfed5e-ec48-437a-8f5b-394d12f53a3d' }
        { name: 'AZURE_TENANT_ID'; value: '3188f024-fce9-420f-bc71-264d7ffb403e' }
        { name: 'AZURE_SIGNIN_REDIRECT_URI'; value: 'https://expert-snapshot-legal-docker-dvbvcmajcpetekb5.westus3-01.azurewebsites.net/api/auth/callback/microsoft' }
        { name: 'AZURE_SIGNIN_CLIENT_ID'; value: 'facb92f0-86db-4116-99c7-071c469c5718' }
        { name: 'FRONTEND_MICROSOFT_CALLBACK_URL'; value: 'https://expert-snapshot-legal-docker.azurewebsites.net/auth/callback/microsoft' }
        { name: 'RETENTION_DAYS'; value: '180' }

        // Secrets via Key Vault
        { name: 'ACS_CONNECTION_STRING'; value: '@Microsoft.KeyVault(SecretUri=https://kv-expert-snapshot-legal.vault.azure.net/secrets/acs-connection-string)' }
        { name: 'AZURE_FORM_RECOGNIZER_KEY'; value: '@Microsoft.KeyVault(SecretUri=https://kv-expert-snapshot-legal.vault.azure.net/secrets/azure-form-recognizer-key)' }
        { name: 'AZURE_SIGNIN_CLIENT_SECRET'; value: '@Microsoft.KeyVault(SecretUri=https://kv-expert-snapshot-legal.vault.azure.net/secrets/azure-signin-client-secret)' }
        { name: 'AZURE_SQL_PASSWORD'; value: '@Microsoft.KeyVault(SecretUri=https://kv-expert-snapshot-legal.vault.azure.net/secrets/azure-sql-password)' }
        { name: 'JWT_SECRET'; value: '@Microsoft.KeyVault(SecretUri=https://kv-expert-snapshot-legal.vault.azure.net/secrets/jwt-secret)' }
      ]
    }
  }
}

@description('SQL Server')
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' existing = {
  name: 'microconsult-sqlserver-dev'
  scope: resourceGroup('rg-microConsult-dev')
}

@description('SQL Database')
resource sqlDb 'Microsoft.Sql/servers/databases@2022-05-01-preview' existing = {
  parent: sqlServer
  name: 'expert-snapshot-legal-db-dev'
}

@description('Storage Account')
resource storage 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: 'retainerdocs'
}

@description('Cognitive Services (Form Recognizer)')
resource cognitive 'Microsoft.CognitiveServices/accounts@2022-12-01' existing = {
  name: 'legal-ai-foundry-dev'
}

@description('Azure Communication Services Core')
resource acsCore 'Microsoft.Communication/CommunicationServices@2023-04-01' existing = {
  name: 'acs-core-microConsult'
  scope: resourceGroup('rg-microConsult-dev')
}

@description('Azure Communication Services Email')
resource acsEmail 'Microsoft.Communication/emailServices@2023-04-01' existing = {
  name: 'acs-email-microConsult'
  scope: resourceGroup('rg-microConsult-dev')
}

@description('Application Insights (canonical)')
resource appInsights 'microsoft.insights/components@2020-02-02' existing = {
  name: 'expert-snapshot-legal202511141723'
}

@description('Log Analytics Workspace')
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  name: 'DefaultWorkspace-bb452d16-1e92-4afd-af21-c2808944be28-USW3'
}

@description('Certificates')
resource certRoot 'Microsoft.Web/certificates@2022-03-01' existing = {
  name: 'microconsultnetwork.com'
}

resource certWww 'Microsoft.Web/certificates@2022-03-01' existing = {
  name: 'www.microconsultnetwork.com'
}

@description('Bind custom domains + certs')
resource hostnameBindingRoot 'Microsoft.Web/sites/hostNameBindings@2022-03-01' = {
  parent: appService
  name: 'microconsultnetwork.com'
  properties: {
    sslState: 'SniEnabled'
    thumbprint: certRoot.properties.thumbprint
  }
}

resource hostnameBindingWww 'Microsoft.Web/sites/hostNameBindings@2022-03-01' = {
  parent: appService
  name: 'www.microconsultnetwork.com'
  properties: {
    sslState: 'SniEnabled'
    thumbprint: certWww.properties.thumbprint
  }
}

@description('SQL admin username')
param sqlAdminUser string = 'sqladmin'

@description('Initialize SQL schema using Key Vault secret')
resource dbInit 'Microsoft.Resources/deploymentScripts@2020-10-01' = {
  name: 'init-db-schema'
  location: resourceGroup().location
  kind: 'AzureCLI'
  properties: {
    azCliVersion: '2.30.0'
    scriptContent: '''
      sqlcmd -S ${sqlServer.name}.database.windows.net \
             -d ${sqlDb.name} \
             -U ${sqlAdminUser} \
             -P $(AZURE_SQL_PASSWORD) \
             -i ./scripts/create_schema.sql
    '''
    environmentVariables: [
      {
        name: 'AZURE_SQL_PASSWORD'
        secureValue: '@Microsoft.KeyVault(SecretUri=https://kv-expert-snapshot-legal.vault.azure.net/secrets/azure-sql-password)'
      }
    ]
    timeout: 'PT30M'
    retentionInterval: 'P1D'
  }
}
