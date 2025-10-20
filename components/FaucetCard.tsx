import { useAccount, useChainId, useWriteContract } from 'wagmi';
import { faucetAbi } from '@/lib/abis';
import { env } from '@/lib/utils';
import { sepolia, giwa } from '@/lib/chains';
import { useState } from 'react';

export default function FaucetCard() {
  const { address } = useAccount();
  const [msg, setMsg] = useState<string>('');
  const { writeContractAsync } = useWriteContract();

  const claim = async (isL2: boolean) => {
    setMsg('');
    if (!address) return setMsg('请先连接钱包');
    const mode = isL2 ? env.L2_FAUCET_MODE : env.L1_FAUCET_MODE;
    const url = isL2 ? env.L2_FAUCET_URL : env.L1_FAUCET_URL;
    const fa = isL2 ? env.L2_FAUCET_ADDR : env.L1_FAUCET_ADDR;
    const fn = isL2 ? env.L2_FAUCET_METHOD : env.L1_FAUCET_METHOD;
    const chainId = isL2 ? giwa.id : sepolia.id;

    if (mode === 'link' || (!fa && url)) {
      window.open(url, '_blank'); return;
    }
    if (!fa) return setMsg('未配置 Faucet 合约地址，请改用外链领取');

    try {
      const hash = await writeContractAsync({
        address: fa as `0x${string}`,
        abi: faucetAbi,
        functionName: fn === 'drip' ? 'drip' : 'claim',
        args: fn === 'drip' ? [address, BigInt(env.FAUCET_DEFAULT) * 10n ** 18n] : [],
        chainId
      });
      setMsg(`已发送领取交易：${hash}`);
    } catch (e:any) {
      setMsg(`领取失败：${e.shortMessage || e.message}`);
    }
  };

  return (
    <div className="card">
      <h3>水龙头 / Faucet</h3>
      <div className="row" style={{gap:8}}>
        <button className="button" onClick={()=>claim(false)}>领取 L1（Sepolia）</button>
        <button className="button" onClick={()=>claim(true)}>领取 L2（GIWA）</button>
      </div>
      <div className="small" style={{marginTop:8}}>{msg || '若为外链模式，将在新窗口打开官方水龙头。'}</div>
    </div>
  );
}

