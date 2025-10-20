export const env = {
  L1_RPC: process.env.NEXT_PUBLIC_L1_RPC!,
  L2_RPC: process.env.NEXT_PUBLIC_L2_RPC!,
  L1_EXPLORER: process.env.NEXT_PUBLIC_L1_EXPLORER!,
  L2_EXPLORER: process.env.NEXT_PUBLIC_L2_EXPLORER!,
  L1_BRIDGE: process.env.NEXT_PUBLIC_L1_STANDARD_BRIDGE!,
  L2_BRIDGE: process.env.NEXT_PUBLIC_L2_STANDARD_BRIDGE!,
  L2_MSG_PASSER: process.env.NEXT_PUBLIC_L2_MESSAGE_PASSER!,
  L1_ERC20: process.env.NEXT_PUBLIC_L1_ERC20!,
  L2_ERC20: process.env.NEXT_PUBLIC_L2_ERC20!,

  L1_FAUCET_MODE: (process.env.NEXT_PUBLIC_L1_FAUCET_MODE || 'link') as 'link'|'contract'|'both',
  L1_FAUCET_URL: process.env.NEXT_PUBLIC_L1_FAUCET_URL || '',
  L1_FAUCET_ADDR: process.env.NEXT_PUBLIC_L1_FAUCET_ADDRESS || '',
  L1_FAUCET_METHOD: process.env.NEXT_PUBLIC_L1_FAUCET_METHOD || 'claim',

  L2_FAUCET_MODE: (process.env.NEXT_PUBLIC_L2_FAUCET_MODE || 'link') as 'link'|'contract'|'both',
  L2_FAUCET_URL: process.env.NEXT_PUBLIC_L2_FAUCET_URL || '',
  L2_FAUCET_ADDR: process.env.NEXT_PUBLIC_L2_FAUCET_ADDRESS || '',
  L2_FAUCET_METHOD: process.env.NEXT_PUBLIC_L2_FAUCET_METHOD || 'claim',

  FAUCET_DEFAULT: Number(process.env.NEXT_PUBLIC_FAUCET_DEFAULT_AMOUNT || '0')
};

export const fmt = (n: bigint, decimals = 18) => {
  const str = n.toString().padStart(decimals + 1, '0');
  const i = str.length - decimals;
  return `${str.slice(0, i)}.${str.slice(i).replace(/0+$/, '')}`.replace(/\.$/,'');
};

export const parseAmount = (v: string, decimals = 18) => {
  if (!v || Number(v) <= 0) return 0n;
  const [int, frac = ''] = v.split('.');
  const f = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(int || '0') * (10n ** BigInt(decimals)) + BigInt(f || '0');
};

export const explorerTx = (isL2: boolean, hash: `0x${string}`) =>
  `${isL2 ? env.L2_EXPLORER : env.L1_EXPLORER}/tx/${hash}`;

