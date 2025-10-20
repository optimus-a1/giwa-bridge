export const FaucetAbis = [
  // claimFaucet()
  [{ "inputs": [], "name": "claimFaucet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
  // claimFaucet(address to)
  [{ "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "claimFaucet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
  // claimFaucet(uint256 amount)
  [{ "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "claimFaucet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
  // claimFaucet(address to, uint256 amount)
  [{
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "claimFaucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }],
] as const;
