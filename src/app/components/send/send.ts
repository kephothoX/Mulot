import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

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



@Component({
  selector: 'app-send',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './send.html',
  styleUrl: './send.css'
})
export class Send implements OnInit {
  readonly _dialog = inject(MatDialog);

  constructor(
    private localStorage: LocalStorageService,
    public matSnackBar: MatSnackBar
  ) { }

  async ngOnInit(): Promise<void> {

  }



  sendToOneDialog() {
    const dialogRef = this._dialog.open(SendToOneDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  sendToManyDialog() {
    const dialogRef = this._dialog.open(SendToManyDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}

@Component({
  selector: 'send-to-one-dialog',
  templateUrl: 'send-to-one-dialog.html',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatSelectModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendToOneDialog {
  VerifyResponse: any;

  Chains: string[] = [
    'Ethereum',
    'Arbitrum',
    'Optimism',
    'Avalanche',
    'Optimism',
    'Arbitrum',
    'Base',
    'Polygon',
    'Unichain',
  ]

  constructor(
    private sessionStorage: SessionStorageService,
    private localStorage: LocalStorageService,
    public matSnackBar: MatSnackBar
  ) { }

  sendToOneForm = new FormGroup({
    recipient: new FormControl(''),
    chain: new FormControl(''),
    amount: new FormControl(''),
  });

  resetForm() {
    this.sendToOneForm.reset();
  }

  async completeTransaction(): Promise<void> {
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


    console.log('SDK  --------->  ', sdk);
    console.log(this.sendToOneForm.value);

    const intent = {
      sourceChain: 'Ethereum',
      targetChain: `${this.sendToOneForm.value.chain}`,
      amount: `${this.sendToOneForm.value.amount}`,
      sender,
      recipient: this.sendToOneForm.value.recipient,
      gasDropoffDesired: 0n,
      //paymentToken: 'usdc'
    };

    const routes = await sdk.findRoutes(intent);

    const route = routes.all[0];

    //route.progress.on('*', (event) => {
    //console.log(`[Progress] ${event.name}:`, event.data);
    //});

    route.transactionListener.on('*', (event) => {
      console.log(`[TxListener] ${event.name}:`, event.data);
    });

    if (await sdk.checkHasEnoughFunds(route)) {
      const {
        transactions,
        attestations,
        //redeems,
        transferHash,
        //redeemHash,
      } = await sdk.executeRoute(route);
      this.matSnackBar.open('Executed route:', 'Dismiss');
      this.matSnackBar.open(`Transfer TX:  ${transferHash}`,
        'Dismiss'
      );
      //console.log('Redeem TX:', redeemHash);
      this.matSnackBar.open(`Attestations:  ${attestations}`,
        'Dismiss'
      );
      this.matSnackBar.open(`Transactions:  ${transactions}`,
        'Dismiss'
      );
      //console.log('Transactions:', transactions);
      this.matSnackBar.open(`Attestations:  ${attestations}`,
        'Dismiss'
      );
      //console.log('Redeems:', redeems);
    } else {
      this.matSnackBar.open(
        'Not enough funds to execute the route. Please top up your account.',
        'Dismiss'
      )
    }
  }

  async VerifyAddress() {
    const formValues = this.sendToOneForm.value;

    await fetch('https://api.circle.com/v1/w3s/compliance/screening/addresses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer TEST_API_KEY:217c20cd139202ffafc71ef13499ab5c:e2fbd29d95b0aa6b77d0bff21cc89db3`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        address: formValues.recipient,
        chain: formValues.chain,
      }),
    })
      .then(async (response) => {
        const result = await response.json();
        this.VerifyAddress = result;

        console.log('Address Verification: ', this.VerifyAddress);

      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        console.log('Finally Ive Completed...');
      });
  }

}


interface Recipient {
  address: string;
  amount: string;
  chain: string;
}


@Component({
  selector: 'send-to-many-dialog',
  templateUrl: 'send-to-many-dialog.html',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendToManyDialog {
  VerifyResponse: any;

  Recipients: Recipient[] = [];
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
    private sessionStorage: SessionStorageService,
    private localStorage: LocalStorageService,
    public matSnackBar: MatSnackBar
  ) { }

  sendToManyForm = new FormGroup({
    recipient: new FormControl(''),
    chain: new FormControl(''),
    amount: new FormControl(''),
  });

  resetForm() {
    this.sendToManyForm.reset();
  }

  addRecipient() {
    const formValues = this.sendToManyForm.value;

    this.Recipients.push({
      address: `${formValues.recipient}`,
      chain: `${formValues.chain}`,
      amount: `${formValues.amount}`
    });

    this.resetForm();

    console.log('Recipients:  ', this.Recipients);

  }

  async completeTransaction(): Promise<void> {
    if (this.Recipients.length <= 1) {
      this.matSnackBar.open(
        'Please Add more Recipients to Proceed.',
        'Dismiss'
      )

    } else {

      const account = privateKeyToAccount(PRIVATE_KEY);

      const sdk = new StableSDK({
        network: 'Testnet',
        signer: new ViemSigner(account),
        rpcUrls: {
          Ethereum: 'https://ethereum-sepolia.rpc.subquery.network/public',
          Arbitrum: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
          Optimism: 'https://optimism-sepolia.blockpi.network/v1/rpc/public',
        },
      });

      const sender = this.localStorage.retrieve('CircleWallet')?.address;

      if (sender !== null || '') {

        for (const payout of this.Recipients) {
          console.log(typeof payout.amount);

          const intent = {
            sourceChain: 'Ethereum',
            targetChain: payout.chain,
            amount: payout.amount,
            sender,
            recipient: payout.address,
            gasDropoffDesired: 0n,
          };

          const routes = await sdk.findRoutes(intent);
          const route = routes.all[0];

          // Listen for transaction lifecycle events
          route.transactionListener.on('transaction-included', (event) => {
            this.matSnackBar.open('Transaction included in block:', 'Dismiss');

          });

          // Listen for final transfer confirmation
          //route.progress.on('transfer-redeemed', (event) => {
          this.matSnackBar.open(`Transfer complete. USDC received by:  ${payout}`,
            'Dismiss'
          );

          //});

          if (await sdk.checkHasEnoughFunds(route)) {
            await sdk.executeRoute(route);
          } else {
            this.matSnackBar.open(
              `Insufficient funds for ${payout.address} on ${payout.chain}`,
              'Dismiss'
            );
          }
        }
      } else {
        this.matSnackBar.open(
          'We could not locate Senders Address. Connect with your wallet to continue.',
          'Dismiss'
        );
      }
    }

  }


  async VerifyAddress() {
    const formValues = this.sendToManyForm.value;

    await fetch('https://api.circle.com/v1/w3s/compliance/screening/addresses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer TEST_API_KEY:217c20cd139202ffafc71ef13499ab5c:e2fbd29d95b0aa6b77d0bff21cc89db3`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        address: formValues.recipient,
        chain: formValues.chain,
      }),
    })
      .then(async (response) => {
        const result = await response.json();
        this.VerifyAddress = result;

        console.log('Address Verification: ', this.VerifyAddress);

      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        console.log('Finally Ive Completed...');
      });
  }


}
