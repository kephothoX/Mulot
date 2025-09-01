import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';


import { Request, Response } from 'express';
import express from 'express';

import { join } from 'node:path';

import { CIRCLE_API_KEY, ENTITY_SECRET } from './app/app.config';

import { initiateUserControlledWalletsClient, TestnetBlockchain } from '@circle-fin/user-controlled-wallets';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmYmQxODlhMS00OTIwLTQ4MGItYWU1ZS1hZDUwMTMyOWNmODUiLCJlbWFpbCI6ImtlcGhvdGhvbWVkaWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIxYzM1ZGZhM2NhZThkZmVkMzQ2Iiwic2NvcGVkS2V5U2VjcmV0IjoiZWQ4MTFkM2ZhMzdiNjI5ZWVkMDJlNWZhMGQ0ODFjMTI2OWJkNzQ3MDUyMGM4OThlODRlNzVmNDIzYTYxMDU2MCIsImV4cCI6MTc2MDk5NTY1OH0.ir293WSX6PMKEklTZBzgt7_6PY7saE--TuTNXprvOfI",
  pinataGateway: "amaranth-past-ladybug-860.mypinata.cloud"
});



const walletClient = initiateDeveloperControlledWalletsClient({
  apiKey: CIRCLE_API_KEY,
  entitySecret: ENTITY_SECRET,
});


const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());

const angularApp = new AngularNodeAppEngine();


const client = initiateUserControlledWalletsClient({
  apiKey: CIRCLE_API_KEY,
});

app.post('/user', async (req: Request, res: Response) => {
  const user = await client.getUser({
    userId: req.body.userId
  });

  console.log('User: ', user);

  if (user) {

    console.log(user.data);
    const response = await client.createUserToken({ userId: `${user.data?.user.id}` });

    const Token = response.data?.userToken

    console.log('Token: ', Token);

    const response_02 = await client.createUserPinWithWallets({
      userToken: `${Token}`, blockchains: ['ETH-SEPOLIA'],

    });

    console.log('Wallet Challenge Token: ', response_02.data?.challengeId);

    return res.send(user.data);

  } else {
    const response = await client.createUser({
      userId: req.body.userId
    });

    return res.send(response);
  }

});

app.post('/wallet', async (req: Request, res: Response) => {

  const walletCreateResponse = await walletClient.createWallets({
    blockchains: [req.body.blockchain],
    count: 1,
    walletSetId: req.body.walletSetId,
    /*metadata: {
      name: req.body.userEmail,
      refId: req.body.userId
    }*/
  });

  if (walletCreateResponse.data) {
    console.log('Wallet Created: ', walletCreateResponse.data);

    const wallet = walletCreateResponse.data.wallets[0];

    console.log('Wallets: ', walletCreateResponse.data.wallets);

    const user = await client.getUser({
      userId: req.body.userId
    });

    console.log('User: ', user.data);
    const response = await client.createUserToken({ userId: `${user.data?.user.id}` });
    const Token = response.data?.userToken;

    const wallet_data = JSON.stringify({
      userId: user.data?.user.id,
      userEmail: req.body.userEmail,
      userToken: Token,
      walletId: wallet.id,
      walletAddress: wallet.address,
      walletSetId: req.body.walletSetId,
      custodyType: wallet.custodyType,
      address: wallet.address,
      blockchain: wallet.blockchain,
      updateDate: new Date(wallet.updateDate),
      createDate: new Date(wallet.createDate),
      Wallet: wallet,
      User: user.data?.user,
    });

    const blob = new Blob([wallet_data], { type: 'application/json' });
    const file = new File([blob], `${req.body.userId}.json`, { type: "text/json" });
    const upload = await pinata.upload.private.file(file);

    console.log('IPFS Upload: ', upload)

    res.send({
      Wallet: wallet,
      User: user.data?.user,
      UserToken: Token,
      IPFSCID: upload.cid,
      IPFSName: upload.name,
      IPFS: upload
    });
  }

});

app.post('/balances', async (req: Request, res: Response) => {
  const walletTokenBalanceResponse = await walletClient.getWalletTokenBalance({
    id: req.body.walletId,
  });

  console.log('Balances: ', walletTokenBalanceResponse.data);


  const walletNFTBalanceResponse = await walletClient.getWalletNFTBalance({
    id: req.body.walletId,
  });

  console.log('NFT Balances: ', walletNFTBalanceResponse.data);


  const walletTransactionsRespone = await walletClient.listTransactions({
    walletIds: [`${req.body.walletId}`],
  });

  console.log('Transactions: ', walletTransactionsRespone.data)

  res.send({
    WalletTokenBalance: walletTokenBalanceResponse.data?.tokenBalances,
    WalletNFTBalance: walletNFTBalanceResponse.data?.nfts,
    WalletTransactions: walletTransactionsRespone.data?.transactions,

  });
});

app.post('/find-wallet', async (req: Request, res: Response) => {
  const walletResponse = await walletClient.getWallet({
    id: req.body.walletId,
  });

  console.log('Wallet: ', walletResponse.data?.wallet);


  return res.send({
    Wallet: walletResponse.data?.wallet
  });
});


app.post('/free-tokens', async (req: Request, res: Response) => {
  const freeCoinsResponse = await walletClient.requestTestnetTokens({
    address: req.body.walletAddress,
    blockchain: TestnetBlockchain.EthSepolia,
    usdc: true
  });

  console.log('Balances: ', freeCoinsResponse.data);


  return res.send({
    Coins: freeCoinsResponse.data
  });
});

app.post('/wallet-recovery', async (req: Request, res: Response) => {
  const result = await pinata.gateways.private.createAccessLink({
    cid: req.body.fileId,
    expires: 10000,
  });

  console.log('Access Link: ', result);

  res.send({
    AccessLink: result,
    FileCID: req.body.fileId
  })
})



/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req: Request, res: Response, next: any) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error: any) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
