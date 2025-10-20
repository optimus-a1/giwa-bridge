import erc20 from './erc20.json'
import l1Bridge from './L1StandardBridge.json'
import l2Bridge from './L2StandardBridge.json'
import l2MsgPasser from './L2MessagePasser.json'

// 新代码使用的命名导出
export const erc20Abi = erc20 as const
export const l1StandardBridgeAbi = l1Bridge as const
export const l2StandardBridgeAbi = l2Bridge as const
export const l2MessagePasserAbi = l2MsgPasser as const

// 兼容旧代码（不要到处改 import）
export { default as ERC20 } from './erc20.json'
export { default as L1StandardBridge } from './L1StandardBridge.json'
export { default as L2StandardBridge } from './L2StandardBridge.json'
export { default as L2MessagePasser } from './L2MessagePasser.json'

export type { Abi } from 'viem'
