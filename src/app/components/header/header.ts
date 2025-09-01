import { Component, AfterViewInit } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { LocalStorageService } from 'ngx-webstorage';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements AfterViewInit {
  TokenBalance: any = 0

  constructor(
    private localStorage: LocalStorageService
  ) { }


  async ngAfterViewInit() {


  }

  async getFreeTokens() {
    await fetch('/free-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: `${this.localStorage.retrieve('CircleWallet').address}`,
      }),
    })
      .then(async (response) => {
        const result = await response.json();
        console.log('Free Tokens Result: ', result);

        window.location.href = result.AccessLink;

      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        console.log('Finally Ive Completed Free Tokens Request...');
      });

  }

}
