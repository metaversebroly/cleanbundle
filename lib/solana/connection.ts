import { Connection } from '@solana/web3.js';

export const getSolanaConnection = () => {
  return new Connection(
    'https://quiet-purple-bridge.solana-mainnet.quiknode.pro/3b4934557503f620e41bed833c53fc753d1917e4/',
    'confirmed'
  );
};
