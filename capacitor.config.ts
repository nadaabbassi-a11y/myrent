import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myrent.app',
  appName: 'MyRent',
  webDir: 'out',
  server: {
    // En développement, pointez vers votre serveur local
    // En production, pointez vers votre URL Vercel
    url: process.env.CAPACITOR_SERVER_URL || 'https://myrent-ca.vercel.app',
    cleartext: false
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#334155',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
    },
  },
};

export default config;
