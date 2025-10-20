import { useState } from 'react';
import { useAccount, useBalance, useReadContract, useSendTransaction, useWriteContract } from 'wagmi';
import { erc20Abi, l1StandardBridgeAbi, l2MessagePasserAbi, l2StandardBridgeAbi } from '@/lib/abis';
import { env, parseAmount, explorerTx } from '@/lib/utils';
import { sepolia, giwa } from '@/lib/chains';

const shuffle = <T,>(arr: T[]) => arr.sort(()=> Math.random()-0.5);

export default function OneClickFlow() {
  const { address } = useAccount();
  const [log, setLog] = useState<string[]>([]);
  const push = (s: string) => setLog(v=>[s, ...v].slice(0,8));

  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const run = async () => {
    if (!address) { push('请先连接钱包'); return; }

    // 读余额（简化演示：固定数量）
    const steps = shuffle(['L1->L2_ERC20', 'L2->L1_ETH', 'L2->L1_ERC20', 'L2_SELF'] as const);

    for (const step of steps) {
      try {
        if (step === 'L1->L2_ERC20') {
          const decimals = 18;
          const amt = parseAmount('0.001', decimals);
          push('开始：L1→L2 ERC20 存入 0.001');

          // approve
          await writeContractAsync({
            chainId: sepolia.id,
            address: env.L1_ERC20 as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            args: [env.L1_BRIDGE as `0x${string}`, amt]
          });
          const tx = await writeContractAsync({
            chainId: sepolia.id,
            address: env.L1_BRIDGE as `0x${string}`,
            abi: l1StandardBridgeAbi,
            functionName: 'depositERC20To',
            args: [env.L1_ERC20 as `0x${string}`, env.L2_ERC20 as `0x${string}`, address, amt, 200000, '0x']
          });
          push(`已发送：${explorerTx(false, tx)}（L2 到账异步）`);
        }

        if (step === 'L2->L1_ETH') {
          const amt = parseAmount('0.00005', 18);
          push('开始：L2→L1 ETH 提现初始化 0.00005');
          const tx = await writeContractAsync({
            chainId: giwa.id,
            address: env.L2_MSG_PASSER as `0x${string}`,
            abi: l2MessagePasserAbi,
            functionName: 'initiateWithdrawal',
            args: [address, 0n, '0x'],
            value: amt
          });
          push(`已发送：${explorerTx(true, tx)}`);
        }

        if (step === 'L2->L1_ERC20') {
          const amt = parseAmount('0.001', 18);
          push('开始：L2→L1 ERC20 提现初始化 0.001');
          const tx = await writeContractAsync({
            chainId: giwa.id,
            address: env.L2_BRIDGE as `0x${string}`,
            abi: l2StandardBridgeAbi,
            functionName: 'withdraw',
            args: [env.L2_ERC20 as `0x${string}`, amt, 0, '0x']
          });
          push(`已发送：${explorerTx(true, tx)}`);
        }

        if (step === 'L2_SELF') {
          const amt = parseAmount('0.00002', 18);
          push('开始：GIWA 自转 0.00002 ETH');
          const tx = await sendTransactionAsync({ chainId: giwa.id, to: address, value: amt });
          push(`已发送：${explorerTx(true, tx)}`);
        }
      } catch (e:any) {
        push(`步骤 ${step} 失败：${e.shortMessage || e.message}`);
      }
    }

    push('一键流程完成（失败项已保留日志）。');
  };

  return (
    <div className="card">
      <h3>一键全流程（随机顺序，不含分发）</h3>
      <button className="button primary" onClick={run}>开始执行</button>
      <div className="separator" />
      <div className="small">{log.length ? log.map((l,i)=><div key={i}>{l}</div>) : '点击开始后，这里会显示进度与交易链接。'}</div>
    </div>
  );
}

