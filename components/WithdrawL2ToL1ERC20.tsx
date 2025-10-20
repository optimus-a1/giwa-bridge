import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { erc20Abi, l2StandardBridgeAbi } from '@/lib/abis';
import { env, parseAmount, explorerTx } from '@/lib/utils';
import { giwa } from '@/lib/chains';

export default function WithdrawL2ToL1ERC20() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const { writeContractAsync } = useWriteContract();

  const dec = useReadContract({
    chainId: giwa.id, abi: erc20Abi, address: env.L2_ERC20 as `0x${string}`,
    functionName: 'decimals', args: [], query: { enabled: !!address }
  });
  const bal = useReadContract({
    chainId: giwa.id, abi: erc20Abi, address: env.L2_ERC20 as `0x${string}`,
    functionName: 'balanceOf', args: [address!], query: { enabled: !!address }
  });

  const onWithdraw = async () => {
    setMsg('');
    if (!address) return setMsg('请先连接钱包');
    const decimals = Number(dec.data ?? 18);
    const amt = parseAmount(amount, decimals);
    if (amt <= 0n) return setMsg('请输入有效数量');
    if (typeof bal.data !== 'bigint') return setMsg('读取 L2 代币余额中…');
    if ((bal.data as bigint) < amt) return setMsg('L2 代币余额不足');

    try {
      const hash = await writeContractAsync({
        chainId: giwa.id,
        address: env.L2_BRIDGE as `0x${string}`,
        abi: l2StandardBridgeAbi,
        functionName: 'withdraw',
        args: [env.L2_ERC20 as `0x${string}`, amt, 0, '0x']
      });
      setMsg(`已初始化 ERC-20 提现：${explorerTx(true, hash)} ；后续需在 L1 侧 prove/finalize。`);
    } catch (e:any) {
      setMsg(`提现失败：${e.shortMessage || e.message}`);
    }
  };

  return (
    <div className="card">
      <h3>L2→L1：ERC-20 提现（初始化）</h3>
      <div className="row"><input className="input" placeholder="数量" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
      <div className="row" style={{gap:8}}>
        <button className="button primary" onClick={onWithdraw}>初始化提现</button>
        <span className="small">余额：{typeof bal.data==='bigint' ? `${bal.data}` : '…'}</span>
      </div>
      <div className="small" style={{marginTop:8}}>{msg || '初始化后需等待挑战期再在 L1 侧完成最终化。'}</div>
    </div>
  );
}

