import { useState } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { erc20Abi, l1StandardBridgeAbi } from '@/lib/abis';
import { env, parseAmount, explorerTx } from '@/lib/utils';
import { sepolia, giwa } from '@/lib/chains';

export default function BridgeL1ToL2ERC20() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [gasLimit, setGasLimit] = useState('200000');
  const [msg, setMsg] = useState('');

  const l1Id = sepolia.id;
  const l2Id = giwa.id;
  const { writeContractAsync } = useWriteContract();

  const l1Eth = useBalance({ address, chainId: l1Id, query: { refetchInterval: 10000 } });

  const l1Bal = useReadContract({
    chainId: l1Id, abi: erc20Abi, address: env.L1_ERC20 as `0x${string}`,
    functionName: 'balanceOf', args: [address!], query: { enabled: !!address }
  });
  const l1Dec = useReadContract({
    chainId: l1Id, abi: erc20Abi, address: env.L1_ERC20 as `0x${string}`,
    functionName: 'decimals', args: [], query: { enabled: !!address }
  });
  const l1Allow = useReadContract({
    chainId: l1Id, abi: erc20Abi, address: env.L1_ERC20 as `0x${string}`,
    functionName: 'allowance', args: [address!, env.L1_BRIDGE as `0x${string}`], query: { enabled: !!address }
  });

  const onDeposit = async () => {
    setMsg('');
    if (!address) return setMsg('请先连接钱包');
    const decimals = Number(l1Dec.data ?? 18);
    const amt = parseAmount(amount, decimals);
    if (amt <= 0n) return setMsg('请输入有效数量');
    if (typeof l1Bal.data !== 'bigint') return setMsg('读取余额中，请稍后');

    if ((l1Bal.data as bigint) < amt) return setMsg('L1 代币余额不足');

    // allowance 检查
    const needApprove = (typeof l1Allow.data === 'bigint') ? (l1Allow.data as bigint) < amt : true;
    try {
      // 先 approve
      if (needApprove) {
        const tx1 = await writeContractAsync({
          chainId: l1Id,
          address: env.L1_ERC20 as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [env.L1_BRIDGE as `0x${string}`, amt]
        });
        setMsg(`已发送 Approve：${explorerTx(false, tx1)}`);
      }

      const tx2 = await writeContractAsync({
        chainId: l1Id,
        address: env.L1_BRIDGE as `0x${string}`,
        abi: l1StandardBridgeAbi,
        functionName: 'depositERC20To',
        args: [
          env.L1_ERC20 as `0x${string}`,
          env.L2_ERC20 as `0x${string}`,
          address,
          amt,
          Number(gasLimit) || 200000,
          '0x'
        ]
      });
      setMsg(`已发送存入交易（L1→L2）：${explorerTx(false, tx2)} ；L2 到账为异步，需数分钟。`);
    } catch (e:any) {
      setMsg(`存入失败：${e.shortMessage || e.message}`);
    }
  };

  return (
    <div className="card">
      <h3>L1→L2：ERC-20 存入</h3>
      <div className="row"><input className="input" placeholder="数量" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
      <div className="row"><input className="input" placeholder="L2 GasLimit（默认 200000）" value={gasLimit} onChange={e=>setGasLimit(e.target.value)} /></div>
      <div className="row" style={{gap:8}}>
        <button className="button primary" onClick={onDeposit}>存入 L2</button>
        <a className="button ghost" href={env.L1_EXPLORER} target="_blank">查看 L1 Explorer</a>
      </div>
      <div className="small" style={{marginTop:8}}>{msg || '会先检查 allowance，不足将自动发起 Approve。'}</div>
    </div>
  );
}

