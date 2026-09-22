import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myraa.ai.assistant',
  appName: 'MYRAA',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Allows clean communication with cloud WebSocket and secure endpoints
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#06B6D4',
      sound: 'beep.wav',
    },
  },
};

export default config;
