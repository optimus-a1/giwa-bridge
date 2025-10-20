import { useState } from 'react';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { l2MessagePasserAbi } from '@/lib/abis';
import { env, parseAmount, explorerTx } from '@/lib/utils';
import { giwa } from '@/lib/chains';

export default function WithdrawL2ToL1ETH() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const l2Eth = useBalance({ address, chainId: giwa.id, watch: true });
  const { writeContractAsync } = useWriteContract();

  const onWithdraw = async () => {
    setMsg('');
    if (!address) return setMsg('请先连接钱包');
    const wei = parseAmount(amount, 18);
    if (wei <= 0n) return setMsg('请输入有效数量');
    if (!l2Eth.data) return setMsg('读取 L2 余额中…');
    const bal = BigInt(l2Eth.data.value.toString());
    if (bal < wei) return setMsg('L2 ETH 余额不足');

    try {
      const hash = await writeContractAsync({
        chainId: giwa.id,
        address: env.L2_MSG_PASSER as `0x${string}`,
        abi: l2MessagePasserAbi,
        functionName: 'initiateWithdrawal',
        args: [address, 0n, '0x'],
        value: wei
      });
      setMsg(`已初始化提现（L2→L1）：${explorerTx(true, hash)} ；后续需等待挑战期（~7天）并在 L1 证明/最终化。`);
    } catch (e:any) {
      setMsg(`提现失败：${e.shortMessage || e.message}`);
    }
  };

  return (
    <div className="card">
      <h3>L2→L1：ETH 提现（MessagePasser）</h3>
      <div className="row"><input className="input" placeholder="数量（ETH）" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
      <div className="row" style={{gap:8}}>
        <button className="button primary" onClick={onWithdraw}>初始化提现</button>
        <span className="small">余额：{l2Eth.data?.formatted ?? '…'} ETH</span>
      </div>
      <div className="small" style={{marginTop:8}}>{msg || '此操作只完成初始化，L1 侧需要后续 prove/finalize。'}</div>
    </div>
  );
}

