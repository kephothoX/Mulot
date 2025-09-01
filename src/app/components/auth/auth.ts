import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


import { app } from 'src/app/app.config';
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, getRedirectResult, signInWithCredential, onAuthStateChanged } from 'firebase/auth';
import { SessionStorageService } from 'ngx-webstorage';


import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';





@Component({
  selector: 'app-auth',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth implements OnInit {
  Auth = getAuth(app);
  Provider = new GoogleAuthProvider();

  constructor(
    private sessionStorage: SessionStorageService,
    private _router: Router,
    public matSnackBar: MatSnackBar
  ) { }



  ngOnInit(): void {

    this.Auth.onAuthStateChanged((user: any) => {
      if (user) {
        this.sessionStorage.store('User', user);
        this.sessionStorage.store('Email', `${user.email}`);
        this.sessionStorage.store('Token', `${user.accessToken}`);
        this.sessionStorage.store('Photo', `${user.photoURL}`);

        console.log('User:   ', user);

        this.matSnackBar.open(
          `Welcome ${user.displayName}`,
          'Dismiss'
        );

        this._router.navigate(['/']);

      } else {
        this.matSnackBar.open(
          'You are not logged in. Please login to continue.',
          'Dismiss'
        );

        this.googleSignInPopup();
      }
    });
  }

  signupWithEmailAndPassword(email: string, password: string) {
    createUserWithEmailAndPassword(this.Auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }


  googleProvider() {
    this.Provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    this.Provider.setCustomParameters({
      'login_hint': 'user@example.com'
    });
  }

  public googleSignInPopup() {
    signInWithPopup(this.Auth, this.Provider)
      .then((result: any) => {


        this.sessionStorage.store('Token', result.user.accessToken);
        this.sessionStorage.store('UserCredential: ', `${result}`);

        const token = result.user.accessToken;
        const user = result.user;
        console.log('User', `${user}`)
        this.sessionStorage.store('User', `${user}`);
        this.sessionStorage.store('Email', `${user.email}`);

        this.matSnackBar.open(
          `Welcome ${user.displayName}`,
          'Dismiss'
        );

        this._router.navigate(['/']);


      }).catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;

        this.matSnackBar.open(
          `Oooops an error occured. Code: ${errorCode}.  ${errorMessage} from ${email}`,
          'Dismiss'
        );
      });
  }

  googleSignInRedirectResult() {
    getRedirectResult(this.Auth)
      .then((result: any) => {
        if (result) {
          const credential = result;
          console.log('Credential: ', credential);
          const token = credential.user.accessToken;

          this.sessionStorage.store('Token', token);
        }

        const user = result.user;
        this.sessionStorage.store('User', user);

        this._router.navigate(['/wallet']);

      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        this.matSnackBar.open(
          `Oooops an error occured. Code: ${errorCode}.  ${errorMessage} from ${email}`,
          'Dismiss'
        );
      });
  }

  googleBuildAndSignIn(id_token: any) {
    const credential = GoogleAuthProvider.credential(id_token);

    signInWithCredential(this.Auth, credential).catch((error: any) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      this.matSnackBar.open(
        `Oooops an error occured. Code: ${errorCode}.  ${errorMessage} from ${email}`,
        'Dismiss'
      );
    });
  }


  onSignIn(googleUser: any) {
    console.log('Google Auth Response', googleUser);
    const unsubscribe = onAuthStateChanged(this.Auth, (firebaseUser: any) => {
      unsubscribe();
      if (!this.isUserEqual(googleUser, firebaseUser)) {
        const credential = GoogleAuthProvider.credential(
          googleUser.getAuthResponse().id_token);

        signInWithCredential(this.Auth, credential).catch((error: any) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          this.matSnackBar.open(
            `Oooops an error occured. Code: ${errorCode}.  ${errorMessage} from ${email}`,
            'Dismiss'
          );

        });
      } else {
        this.matSnackBar.open('User already signed-in Firebase.', 'Dismiss');
      }
    });
  }

  isUserEqual(googleUser: any, firebaseUser: any) {
    if (firebaseUser) {
      const providerData = firebaseUser.providerData;
      for (let i = 0; i < providerData.length; i++) {
        if (providerData[i].providerId === GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()) {
          return true;
        }
      }
    }
    return false;
  }


  googleProviderCredential(idToken: any) {
    const credential = GoogleAuthProvider.credential(idToken);
  }

}


