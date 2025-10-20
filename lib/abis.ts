export const ERC20 = [
  { "name":"decimals","outputs":[{"type":"uint8"}],"inputs":[],"stateMutability":"view","type":"function" },
  { "name":"balanceOf","outputs":[{"type":"uint256"}],"inputs":[{"name":"owner","type":"address"}],"stateMutability":"view","type":"function" },
  { "name":"allowance","outputs":[{"type":"uint256"}],"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"stateMutability":"view","type":"function" },
  { "name":"approve","outputs":[{"type":"bool"}],"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"stateMutability":"nonpayable","type":"function" },
  { "name":"claimFaucet","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function" }
] as const;

export const L1StandardBridge = [
  {
    "inputs":[
      {"internalType":"address","name":"_to","type":"address"},
      {"internalType":"uint32","name":"_l2Gas","type":"uint32"},
      {"internalType":"bytes","name":"_data","type":"bytes"}
    ],
    "name":"depositETHTo","outputs":[],"stateMutability":"payable","type":"function"
  },
  {
    "inputs":[
      {"internalType":"address","name":"_l1Token","type":"address"},
      {"internalType":"address","name":"_l2Token","type":"address"},
      {"internalType":"address","name":"_to","type":"address"},
      {"internalType":"uint256","name":"_amount","type":"uint256"},
      {"internalType":"uint32","name":"_l2Gas","type":"uint32"},
      {"internalType":"bytes","name":"_data","type":"bytes"}
    ],
    "name":"depositERC20To","outputs":[],"stateMutability":"nonpayable","type":"function"
  }
] as const;

export const L2MessagePasser = [
  {
    "inputs":[
      {"internalType":"address","name":"_target","type":"address"},
      {"internalType":"uint256","name":"_gasLimit","type":"uint256"},
      {"internalType":"bytes","name":"_data","type":"bytes"}
    ],
    "name":"initiateWithdrawal","outputs":[],"stateMutability":"payable","type":"function"
  }
] as const;

export const L2StandardBridge = [
  {
    "inputs":[
      {"internalType":"address","name":"_l2Token","type":"address"},
      {"internalType":"uint256","name":"_amount","type":"uint256"},
      {"internalType":"uint32","name":"_minGasLimit","type":"uint32"},
      {"internalType":"bytes","name":"_extraData","type":"bytes"}
    ],
    "name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"
  }
] as const;
