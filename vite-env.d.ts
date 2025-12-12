// Removed reference to vite/client to fix "Cannot find type definition" error.
// Manually defining ImportMeta and ImportMetaEnv.

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_CAL_API_KEY: string;
  readonly VITE_CAL_EVENT_TYPE_ID: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
