export interface CircleWallet {
  id: string,
  state: string,
  walletSetId: string,
  custodyType: string,
  address: string,
  blockchain: string,
  accountType: string,
  updateDate: string,
  createDate: string
}


export interface WalletCreateResponse {
  Wallet: {
    id: string,
    state: string,
    walletSetId: string,
    custodyType: string,
    address: string,
    blockchain: string,
    accountType: string,
    updateDate: Date,
    createDate: Date,
  },
  User: {
    id: string,
    status: string,
    createDate: Date,
    pinStatus: string,
    pinDetails: {
      failedAttempts: number
    },
    securityQuestionStatus: string,
    securityQuestionDetails: {
      failedAttempts: number,
    },
    authMode: string
  },
  UserToken: string,
}


export interface WalletIPFS {
  id: string,
  name: string,
  size: number,
  mime_type: string,
  cid: string,
  network: string,
  number_of_files: number,
  streamable: boolean,
  created_at: Date,
  updated_at: Date
}



export interface WalletBalances {
  WalletTokenBalance: [],
  WalletNFTBalance: [],
  WalletTransactions: []
}
