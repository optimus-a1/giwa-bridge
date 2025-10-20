// lib/chains.ts
export const L1 = {
  id: 11155111,
  name: 'Sepolia',
  explorer: 'https://sepolia.etherscan.io',
  rpc: process.env.NEXT_PUBLIC_RPC_SEPOLIA || 'https://ethereum-sepolia-rpc.publicnode.com',
};

export const L2 = {
  id: 91342, // GIWA Sepolia
  name: 'GIWA',
  explorer: 'https://sepolia-explorer.giwa.io',
  rpc: process.env.NEXT_PUBLIC_RPC_GIWA || 'https://sepolia-rpc.giwa.io',
};

// === 官方合约地址（OP Stack 标准）===
export const ADDR = {
  // L1 (Sepolia)
  L1_PORTAL: '0x956962C34687A954e611A83619ABaA37Ce6bC78A',          // OptimismPortal on Sepolia
  L1_BRIDGE: '0x77b2ffc0F57598cAe1DB76cb398059cF5d10A7E7',          // L1StandardBridge on Sepolia

  // L2 (GIWA Sepolia)
  L2_BRIDGE: '0x4200000000000000000000000000000000000010',          // L2StandardBridge (常量地址)
  L2_MESSAGE_PASSER: '0x4200000000000000000000000000000000000016',  // L2ToL1MessagePasser (常量地址)

  // —— 文档提供的「示例 ERC-20」对（自带 claimFaucet），方便演示桥接 ——
  // L1 faucet 代币（Sepolia）
  L1_ERC20: '0x50B1eF6e0fe05a32F3E63F02f3c0151BD9004C7c',
  // L2 对应的桥接代币（GIWA）
  L2_ERC20: '0xB11E5c9070a57C0c33Df102436C440a2c73a4c38',
};

// 官方水龙头（仅供快捷入口）
export const FAUCET = {
  sepolia: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
  giwa: 'https://faucet.giwa.io/',
};

export { default as ERC20 } from './abis/erc20.json';
export { default as L1StandardBridge } from './abis/L1StandardBridge.json';
export { default as L2StandardBridge } from './abis/L2StandardBridge.json';
export { default as L2MessagePasser } from './abis/L2MessagePasser.json';
