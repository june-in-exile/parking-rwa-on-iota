/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IOTA_NETWORK: string
  readonly VITE_PACKAGE_ID: string
  readonly VITE_LOT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
