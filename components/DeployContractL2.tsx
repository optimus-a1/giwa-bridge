import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { giwa } from '@/lib/chains';
import { explorerTx } from '@/lib/utils';

// 一个极简合约的字节码（可替换）
const defaultBytecode =
  '0x6080604052348015600f57600080fd5b50603a80601d6000396000f3fe6080604052600080fdfea2646970667358221220b3c...'; // 请替换为有效字节码或留空

export default function DeployContractL2() {
  const { address } = useAccount();
  const { writeContractAsync, data, isPending } = useWriteContract();
  const [bytecode, setBytecode] = useState(defaultBytecode);
  const [msg, setMsg] = useState('');

  // wagmi v2 推荐使用 deployContract（但可直接发 raw tx：data=bytecode）
  const deploy = async () => {
    setMsg('');
    if (!address) return setMsg('请先连接钱包');
    if (!bytecode || !bytecode.startsWith('0x')) return setMsg('请输入有效字节码（0x 开头）');

    try {
      // 直接用 writeContractAsync 发送 raw data 到空地址不可行；
      // 这里更简单：使用 client.request({ method:'eth_sendTransaction', params:[{ from, data }] })
      // 但 wagmi 暴露的是 useSendTransaction。为了简化，我们走 viem 原生（下方改用 window.ethereum 请求）：
      const provider = (window as any).ethereum;
      if (!provider) return setMsg('未检测到钱包提供者');

      const txHash: string = await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: address, data: bytecode, chainId: '0x1651E' /* 91342 hex */ }]
      });
      setMsg(`已发送部署交易：${txHash}`);
    } catch (e:any) {
      setMsg(`部署失败：${e.shortMessage || e.message}`);
    }
  };

  return (
    <div className="card">
      <h3>L2 合约部署（字节码）</h3>
      <textarea className="input" rows={5} placeholder="0x 字节码" value={bytecode} onChange={e=>setBytecode(e.target.value)} />
      <div className="row" style={{gap:8, marginTop:8}}>
        <button className="button primary" onClick={deploy}>部署</button>
        <a className="button ghost" href="#" onClick={(e)=>{e.preventDefault(); setBytecode('');}}>清空</a>
      </div>
      <div className="small" style={{marginTop:8}}>{msg || '可粘贴由 solc/foundry 编译出的 0x 字节码。'}</div>
    </div>
  );
}

