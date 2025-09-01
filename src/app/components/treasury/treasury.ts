import { Component, OnInit } from '@angular/core';
import StableSDK from '@stable-io/sdk'
import { ViemSigner } from '@stable-io/sdk';
import { privateKeyToAccount } from 'viem/accounts';
import { PRIVATE_KEY } from 'src/app/app.config';

import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

import { SessionStorageService, LocalStorageService } from 'ngx-webstorage';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';



interface TreasuryAccount {
  chainId: string;
  balance: number;
  chain: string;
}

@Component({
  selector: 'app-treasury',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './treasury.html',
  styleUrl: './treasury.css'
})
export class Treasury implements OnInit {
  TreasuryReport: any;
  TreasuryAccounts: TreasuryAccount[] = [];
  Chains: string[] = [
    'Ethereum',
    'Avalanche',
    'Optimism',
    'Arbitrum',
    'Base',
    'Polygon',
    'Unichain',
  ]

  constructor(
    private localStorage: LocalStorageService,
    private matSnackBar: MatSnackBar
  ) { }

  async ngOnInit(): Promise<void> { }


  treasuryForm = new FormGroup({
    chainId: new FormControl(''),
    chain: new FormControl(''),
    balance: new FormControl(''),
    recipient: new FormControl(''),
  });

  resetForm() {
    this.treasuryForm.reset();
  }


  addTreasuryAccount() {
    const formValues = this.treasuryForm.value;

    this.TreasuryAccounts.push({
      chainId: `${formValues.chainId}`,
      chain: `${formValues.chain}`,
      balance: parseInt(`${formValues.balance}`)
    });

    this.resetForm();

    console.log('Treasury Accounts:  ', this.TreasuryAccounts);

  }

  async completeConsolidation() {
    this.matSnackBar.open(`Current Address: ${this.localStorage.retrieve('CircleWallet')?.address}`,
      'Dismiss');
    const account = privateKeyToAccount(PRIVATE_KEY);

    const sdk = new StableSDK({
      network: 'Testnet',
      signer: new ViemSigner(account),
      rpcUrls: { // optional
        Ethereum: 'https://ethereum-sepolia.rpc.subquery.network/public',
      },
    });

    const sender = `${this.localStorage.retrieve('CircleWallet')?.address}`;

    const targetChain = "Ethereum";

    // Execute consolidation from each chain into the target
    for (const { chain, balance, chainId } of this.TreasuryAccounts) {
      if (balance <= 0) {
        console.log(`[${chain}] No USDC to consolidate.`);
        continue;
      }

      const intent = {
        sourceChain: chain,
        targetChain,
        amount: balance.toFixed(2),
        sender,
        recipient: this.treasuryForm.value.recipient,
        gasDropoffDesired: 0n,
      };

      // If using this in a browser (e.g. MetaMask), prompt the user to switch to the source chain:
      // await window.ethereum.request({
      //   method: "wallet_switchEthereumChain",
      //   params: [{ chainId }],
      // });

      const routes = await sdk.findRoutes(intent);
      const route = routes.all[0];

      route.transactionListener.on("transaction-included", (event) => {
        this.matSnackBar.open(
          `[${chain}] Tx included:  ${event}`,
          'Dismiss'
        );
      });

      /*route.progress.on("transfer-redeemed", () => {
        console.log(`[${chain}] Consolidation to ${targetChain} complete.`);
      });*/

      if (await sdk.checkHasEnoughFunds(route)) {
        await sdk.executeRoute(route);
      } else {
        this.matSnackBar.open(
          `[${chain}] Not enough funds to consolidate.`,
          'Dismiss'
        );
      }
    }
  }

}
