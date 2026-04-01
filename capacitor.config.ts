import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sailbosco.app',
  appName: 'Bosco',
  webDir: 'cap-web',
  server: {
    url: 'https://www.sailbosco.com',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#1B2D4F',
    },
    StatusBar: {
      style: 'DARK',
    },
  },
};

export default config;
