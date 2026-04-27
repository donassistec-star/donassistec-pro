import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.donassistec.app",
  appName: "DonAssistec",
  webDir: "dist",
  server: {
    // Em produção o app carrega os arquivos do webDir; não precisa de URL
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
