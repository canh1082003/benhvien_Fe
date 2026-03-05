// custom environment variables for the frontend
// see https://vitejs.dev/guide/env-and-mode.html#env-files

declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  // more variables can be added here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
