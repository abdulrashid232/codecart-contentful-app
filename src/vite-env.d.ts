/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMERCE_LAYER_ENDPOINT: string;
  readonly VITE_COMMERCE_LAYER_AUTH_URL: string;
  readonly VITE_COMMERCE_LAYER_CLIENT_ID: string;
  readonly VITE_COMMERCE_LAYER_CLIENT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
