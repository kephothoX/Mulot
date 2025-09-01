import { Component, AfterViewInit, signal } from '@angular/core';

import { WalletBalances } from 'src/app/models/wallet';

import { LocalStorageService } from 'ngx-webstorage';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-balances',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './balances.html',
  styleUrl: './balances.css'
})
export class Balances implements AfterViewInit {
  BalancesResponse = signal<WalletBalances>(
    {
      WalletTokenBalance: [],
      WalletNFTBalance: [],
      WalletTransactions: []
    }
  );

  constructor(
    private localStorage: LocalStorageService
  ) { }

  async ngAfterViewInit(): Promise<void> {
    await this.getBalances();
  }

  async getBalances() {
    await fetch('/balances', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletId: `${this.localStorage.retrieve('CircleWallet').id}`,
      }),
    })
      .then(async (response) => {
        const result = await response.json();

        this.BalancesResponse.set(result);
        console.log('Balances Response: ', this.BalancesResponse());
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        console.log('Finally Ive Completed...');
      });
  }

}
