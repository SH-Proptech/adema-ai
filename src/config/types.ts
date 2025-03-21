export interface EnvVars {
  PORT: number;
  AUTH0_AUDIENCE: string;
  AUTH0_DOMAIN: string;
  AUTH0_BASIC_CLIENT_ID: string;
  AUTH0_BASIC_CLIENT_SECRET: string;
  AZURE_AISEARCH_ENDPOINT: string;
  AZURE_AISEARCH_KEY: string;
  AZURE_OPENAI_API_KEY: string;
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_DEPLOYMENT_NAME: string;
  AZURE_OPENAI_API_VERSION: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_PORT: number;
  POSTGRES_HOST: string;
  POSTGRES_SSL: boolean;
  POSTGRES_USER: string;
  POSTGRES_DB: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_DB: number;
  GOOGLE_MAPS_API_KEY: string;
  PROPERTY_DATA_API_KEY: string;
}
