# Mulot Pay

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4203/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## App Functions

- Wallets (For new Wallet cration and revovery)
- Transactions (To get overview of all transactions)
- Payments (For sending USDC to one or multiple accounts)
- Treasury  (For USDC consolidation)

## App Variables

Edit `src/app/app.config.ts` and set the following variables:

- export const PRIVATE_KEY = '';
- export const CIRCLE_API_KEY: string = '';
- export const ENTITY_SECRET: string = '';
- export const APPID: string = '';
- export const WALLET_SET_ID: string = '';

Edit  `src.server.ts` and set the following variables:

- export const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: ""
});

- const walletClient = initiateDeveloperControlledWalletsClient({
  apiKey: CIRCLE_API_KEY,
  entitySecret: ENTITY_SECRET,
});

## House keeping

`cd HouseKeeping` and create a new python env bu running `python -m venv CircleEnv`  activate the env and install packages by running  `pip install -r requirements.txt` then run `python main.py` to get Entity_Secret and Cipher_Text.
Also for Wallet Set creation.
