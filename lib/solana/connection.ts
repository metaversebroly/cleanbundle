import { Connection } from '@solana/web3.js';

export const getSolanaConnection = () => {
  return new Connection(
    'https://proportionate-restless-ensemble.solana-mainnet.quiknode.pro/b2f7a23eaa26d9511c1a33cd92fd9304bf6eac2e/',
    'confirmed'
  );
};
