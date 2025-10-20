import { useState } from 'react';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseAmount, explorerTx } from '@/lib/utils';
import { giwa } from '@/lib/chains';

export default function SelfTransferL2() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const l2Eth = useBalance({ address, chainId: giwa.id, query: { refetchInterval: 10000 } });
  const { sendTransactionAsync } = useSendTransaction();

  const onSend = async () => {
    setMsg('');
    if (!address) return setMsg('请先连接钱包');
    const wei = parseAmount(amount, 18);
    if (wei <= 0n) return setMsg('请输入有效数量');
    if (!l2Eth.data) return setMsg('读取余额中…');
    if (BigInt(l2Eth.data.value.toString()) < wei) return setMsg('余额不足');

    try {
      const hash = await sendTransactionAsync({ chainId: giwa.id, to: address, value: wei });
      setMsg(`已发送 L2 自转：${explorerTx(true, hash)}`);
    } catch (e:any) {
      setMsg(`发送失败：${e.shortMessage || e.message}`);
    }
  };

  return (
    <div className="card">
      <h3>GIWA ETH 自转测试</h3>
      <div className="row"><input className="input" placeholder="数量（ETH）" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
      <div className="row" style={{gap:8}}>
        <button className="button primary" onClick={onSend}>发送给自己</button>
        <span className="small">余额：{l2Eth.data?.formatted ?? '…'} ETH</span>
      </div>
      <div className="small" style={{marginTop:8}}>{msg}</div>
    </div>
  );
}

