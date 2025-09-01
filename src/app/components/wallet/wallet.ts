import { Component, AfterViewInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';

import { User } from 'src/app/models/user';

import { APPID, WALLET_SET_ID } from 'src/app/app.config';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { WalletCreateResponse, WalletBalances, CircleWallet, WalletIPFS } from 'src/app/models/wallet';

import { DatePipe } from '@angular/common';
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



@Component({
  selector: 'app-wallet',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class Wallet implements AfterViewInit {
  readonly _dialog = inject(MatDialog);

  CircleWallet = signal<CircleWallet>(
    {
      id: '',
      state: '',
      walletSetId: '',
      custodyType: '',
      address: '',
      blockchain: '',
      accountType: '',
      updateDate: '',
      createDate: ''
    }
  )

  constructor(
    private sessionStorage: SessionStorageService,
    private localStorage: LocalStorageService
  ) { }

  async ngAfterViewInit(): Promise<void> {
    await this.getWallet();

  }

  async getWallet() {
    console.log(` Wallet ID: ${this.localStorage.retrieve('Wallet')?.id}`);
    await fetch('/find-wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletId: `${this.localStorage.retrieve('Wallet')?.id}`,
      }),
    })
      .then(async (response) => {
        const result = await response.json();
        this.CircleWallet.set(result.Wallet);

        this.localStorage.store('CircleWallet', result.Wallet);

      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        console.log('Finally Ive Completed...');
      });
  }




  importWalletDialog() {
    const dialogRef = this._dialog.open(ImportWalletDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  createWalletDialog() {
    const dialogRef = this._dialog.open(CreateWalletDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  recoverWalletDialog() {
    const dialogRef = this._dialog.open(RecoverWalletDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}

@Component({
  selector: 'import-wallet-dialog',
  templateUrl: 'import-wallet-dialog.html',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportWalletDialog {
  CircleWallet = signal<CircleWallet>(
    {
      id: '',
      state: '',
      walletSetId: '',
      custodyType: '',
      address: '',
      blockchain: '',
      accountType: '',
      updateDate: '',
      createDate: ''
    }
  )

  constructor(
    private sessionStorage: SessionStorageService,
    private localStorage: LocalStorageService
  ) { }

  importWalletForm = new FormGroup({
    walletId: new FormControl(''),
  });

  async importWallet() {
    await fetch('/find-wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletId: this.importWalletForm.value.walletId,
      }),
    })
      .then(async (response) => {
        const result = await response.json();
        this.CircleWallet.set(result.Wallet);

        this.localStorage.store('CircleWallet', result.Wallet);

      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        console.log('Finally Ive Completed...');
      });
  }

}

@Component({
  selector: 'recover-wallet-dialog',
  templateUrl: 'recover-wallet-dialog.html',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoverWalletDialog {

  constructor(
    private sessionStorage: SessionStorageService,
    private localStorage: LocalStorageService
  ) { }

  walletRecoveryForm = new FormGroup({
    fileId: new FormControl(''),
  });


  async ngOnSubmit() {
    console.log('Form Submitted: ', this.walletRecoveryForm.value);
    const fileId = this.walletRecoveryForm.value.fileId;

    await fetch('/wallet-recovery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: `${this.sessionStorage.retrieve('User').uid}`,
        fileId: fileId,
      }),
    })
      .then(async (response) => {
        const result = await response.json();
        console.log('Wallet Recovery Result: ', result);

        window.location.href = result.AccessLink;

      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        console.log('Finally Ive Completed Wallet Recovery...');
      });

  }

}


@Component({
  selector: 'create-wallet-dialog',
  templateUrl: 'create-wallet-dialog.html',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    DatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateWalletDialog {
  Blockchains: string[] = [
    'ARB',
    'ARB-SEPOLIA',
    'AVAX',
    'AVAX-FUJI',
    'BASE',
    'BASE-SEPOLIA',
    'ETH',
    'ETH-SEPOLIA',
    'EVM',
    'EVM-TESTNET',
    'MATIC',
    'MATIC-AMOY',
    'NEAR',
    'NEAR-TESTNET',
    'OP',
    'OP-SEPOLIA',
    'SOL',
    'SOL-DEVNET',
    'UNI',
    'UNI-SEPOLIA'
  ];


  CircleWallet = signal<CircleWallet>(
    {
      id: '',
      state: '',
      walletSetId: '',
      custodyType: '',
      address: '',
      blockchain: '',
      accountType: '',
      updateDate: '',
      createDate: ''
    }
  )

  WalletCreateResponse = signal<WalletCreateResponse>(
    {
      Wallet: {
        id: '',
        state: '',
        walletSetId: '',
        custodyType: '',
        address: '',
        blockchain: '',
        accountType: '',
        updateDate: new Date(),
        createDate: new Date(),
      },
      User: {
        id: '',
        status: '',
        createDate: new Date(),
        pinStatus: '',
        pinDetails: {
          failedAttempts: 0
        },
        securityQuestionStatus: '',
        securityQuestionDetails: {
          failedAttempts: 0,
        },
        authMode: ''
      },
      UserToken: '',
    }
  );

  WalletBackupResponse = signal<WalletIPFS>(
    {
      id: '',
      name: '',
      size: 1,
      mime_type: '',
      cid: '',
      network: '',
      number_of_files: 1,
      streamable: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  );

  constructor(
    private sessionStorage: SessionStorageService,
    private localStorage: LocalStorageService
  ) { }

  walletCretionForm = new FormGroup({
    blockchain: new FormControl(''),
  });


  async createWallet() {
    console.log('Form Submitted: ', this.walletCretionForm.value.blockchain);
    await fetch('/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletSetId: WALLET_SET_ID,
        userEmail: `${this.sessionStorage.retrieve('Email')}`,
        userId: `${this.sessionStorage.retrieve('User')?.uid}`,
        blockchain: this.walletCretionForm.value.blockchain,
      }),
    })
      .then(async (response) => {
        const result = await response.json();

        this.WalletCreateResponse.set(result);
        this.WalletBackupResponse.set(result.IPFS);

        console.log('Wallet Create Response: ', this.WalletCreateResponse());

        this.localStorage.store('Wallet', result.Wallet);
        this.localStorage.store('User', result.User);
        this.localStorage.store('UserToken', result.UserToken);
        this.localStorage.store('IPFSCID', result.IPFSCID);
        this.localStorage.store('IPFSName', result.IPFSName);
        this.localStorage.store('IPFS', result.IPFS);


      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        console.log('Finally Completed Creating Wallet...');
      });
  }

}
