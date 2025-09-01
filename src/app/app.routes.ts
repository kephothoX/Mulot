import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Wallet } from './components/wallet/wallet';
import { Auth } from './components/auth/auth';



export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', title: 'Mulot Home', component: Home },
  { path: 'login', title: 'Mulot Login', component: Auth }
];
