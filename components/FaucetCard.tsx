import { useAccount } from 'wagmi'
import { FAUCET } from '@/lib/chains'   // ✅ 改这里：从 chains 取水龙头 URL
import { useState } from 'react'

export default function FaucetCard() {
  const { address } = useAccount()
  const [busy, setBusy] = useState(false)

  const open = (url: string) => {
    if (typeof window !== 'undefined') window.open(url, '_blank')
  }

  return (
    <div className="card span-12">
      <div className="h2">水龙头 / Faucet</div>

      <div className="p">
        <b>L1（Sepolia）：</b> 先领取 <code>Sepolia ETH</code> 与 <code>Sepolia ERC-20</code>，
        再把 ERC-20 通过下面的 “L1→L2：ERC-20 存入” 桥到 GIWA。
      </div>

      <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => open(FAUCET.sepolia)}>
          领取 Sepolia ETH / ERC-20（外链）
        </button>

        <button className="btn sec" onClick={() => open(FAUCET.giwa)}>
          GIWA 官方水龙头（外链）
        </button>

        <span className="tips">
          说明：GIWA 侧的测试代币通常为桥接资产。若 GIWA 合约不提供 <code>claimFaucet</code>，
          请在 L1 领取 ERC-20 后，使用下方桥接功能把代币存入 L2（GIWA）。
        </span>
      </div>
    </div>
  )
}
