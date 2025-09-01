import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";



import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideNgxWebstorage, withLocalStorage, withNgxWebstorageConfig, withSessionStorage } from 'ngx-webstorage';


export const PRIVATE_KEY = '';

export const CIRCLE_API_KEY: string = '';
export const ENTITY_SECRET: string = '';

export const APPID: string = '';

export const WALLET_SET_ID: string = '';



export const firebaseConfig = {
  apiKey: "",
  authDomain: "mulot-io.firebaseapp.com",
  projectId: "mulot-io",
  storageBucket: "mulot-io.firebasestorage.app",
  messagingSenderId: "527223147039",
  appId: "1:527223147039:web:d645d57295b624a8bce32a",
  measurementId: "G-NX98KNYYTH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//export const analytics = getAnalytics(app);



export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxWebstorage(
      withNgxWebstorageConfig({ separator: ':', caseSensitive: true }),
      withLocalStorage(),
      withSessionStorage()
    ),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay())
  ]
};
