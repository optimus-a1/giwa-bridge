import type { Abi } from 'viem'

import erc20 from './erc20.json'
import l1Bridge from './L1StandardBridge.json'
import l2Bridge from './L2StandardBridge.json'
import l2MsgPasser from './L2MessagePasser.json'

// 给组件使用的命名导出（类型断言为 Abi）
export const erc20Abi: Abi = erc20 as unknown as Abi
export const l1StandardBridgeAbi: Abi = l1Bridge as unknown as Abi
export const l2StandardBridgeAbi: Abi = l2Bridge as unknown as Abi
export const l2MessagePasserAbi: Abi = l2MsgPasser as unknown as Abi

// 兼容旧代码的默认名（仍然保留）
export { default as ERC20 } from './erc20.json'
export { default as L1StandardBridge } from './L1StandardBridge.json'
export { default as L2StandardBridge } from './L2StandardBridge.json'
export { default as L2MessagePasser } from './L2MessagePasser.json'
