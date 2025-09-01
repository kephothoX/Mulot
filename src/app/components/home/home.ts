import { Component, OnInit } from '@angular/core';

import { Wallet } from '../wallet/wallet';
import { Send } from '../send/send';
import { Balances } from '../balances/balances';
import { Treasury } from '../treasury/treasury';
import { SessionStorageService } from 'ngx-webstorage';


import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs'
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-home',
  imports: [
    Wallet,
    Balances,
    Send,
    Treasury,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  constructor(
    private router: Router,
    private sessionStorage: SessionStorageService,
    public matSnackBar: MatSnackBar
  ) { }

  async ngOnInit(): Promise<void> {

    const User = this.sessionStorage.retrieve('User');

    if (User !== null) {
      this.matSnackBar.open(
        `Welcome  ${User.displayName}`,
        'Dismiss'
      );

    } else {
      this.router.navigate(['/login']);
      console.log('Not authenticated....');

    }


  }

}
