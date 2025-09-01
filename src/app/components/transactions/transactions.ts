import { Component, OnInit, signal } from '@angular/core';

import { CircleWallet } from 'src/app/models/wallet';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-transactions',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions implements OnInit {
  CircleWallet = signal<CircleWallet>({
    id: '',
    state: '',
    walletSetId: '',
    custodyType: '',
    address: '',
    blockchain: '',
    accountType: '',
    updateDate: '',
    createDate: ''
  });

  constructor() {

  }

  async ngOnInit(): Promise<void> {

  }

}
