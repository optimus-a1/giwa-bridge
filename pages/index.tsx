import { useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { L1, L2, ADDR, FAUCET } from '@/lib/chains';
import { ERC20, L1StandardBridge, L2MessagePasser, L2StandardBridge } from '@/lib/abis';

function ExplorerLink({ href, children }: any){
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const pcL1 = usePublicClient({ chainId: L1.id });
  const pcL2 = usePublicClient({ chainId: L2.id });
  const { data: wallet } = useWalletClient();

  // 余额（L1/L2 ETH）
  const l1Eth = useBalance({ address, query: { enabled: !!address }});
  const l2Eth = useBalance({ address, query: { enabled: !!address }});

  // ERC-20 余额
  const [l1Erc20, setL1Erc20] = useState<string>('0');
  const [l2Erc20, setL2Erc20] = useState<string>('0');
  const [decimals, setDecimals] = useState<number>(18);

  const refreshErc20 = async ()=>{
    if(!pcL1 || !pcL2 || !address) return;
    try{
      const [d, b1, b2] = await Promise.all([
        pcL1.readContract({ address: ADDR.L1_ERC20 as `0x${string}`, abi: ERC20, functionName: 'decimals' as any }),
        pcL1.readContract({ address: ADDR.L1_ERC20 as `0x${string}`, abi: ERC20, functionName: 'balanceOf', args:[address] }),
        pcL2.readContract({ address: ADDR.L2_ERC20 as `0x${string}`, abi: ERC20, functionName: 'balanceOf', args:[address] }),
      ]);
      setDecimals(Number(d as number));
      setL1Erc20((b1 as bigint).toString());
      setL2Erc20((b2 as bigint).toString());
    }catch(e){}
  };
  useEffect(()=>{ refreshErc20(); }, [address]);

  // 输入
  const [l1toL2Eth, setL1toL2Eth] = useState('0.005');
  const [l2toL1Eth, setL2toL1Eth] = useState('0.0001');
  const [erc20Amount, setErc20Amount] = useState('200000');
  const [withdrawHash, setWithdrawHash] = useState<string>('');

  // SSR 读取 localStorage
  useEffect(()=>{
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('giwa_withdraw_tx') || '';
      setWithdrawHash(saved);
    }
  }, []);

  const fmt = (wei?: bigint)=> wei ? Number(formatEther(wei)).toFixed(6) : '0.000000';
  const fmtToken = (raw: string)=> (Number(raw)/10**decimals).toFixed(6);

  // Faucet（若合约不支持 claimFaucet，会打开外链）
  const claim = async (which:'l1'|'l2')=>{
    // L2 代币是桥接资产：L2 不支持 claimFaucet
    if (which === 'l2') {
      alert("GIWA 的 L2 代币是桥接资产：请先在 L1 领取 ERC-20，再用下方\"L1→L2：ERC-20 存入\"桥到 L2。");
      if (typeof window !== 'undefined') window.open(FAUCET.giwa, '_blank');
      return;
    }
    if(!wallet || !address) return;
    const token = ADDR.L1_ERC20;
    try{
      const hash = await wallet.writeContract({
        address: token as `0x${string}`,
        abi: ERC20,
        functionName: 'claimFaucet'
      });
      alert(`已发送交易：${hash}`);
      setTimeout(refreshErc20, 5000);
    }catch(_){
      window.open(which==='l1' ? FAUCET.sepolia : FAUCET.giwa, '_blank');
    }
  };

  // L1→L2 ETH
  const depositEthL1toL2 = async ()=>{
    if(!wallet || !address) return;
    const amt = l1toL2Eth.trim();
    if(!amt || Number(amt)<=0) return alert('请输入有效金额');
    try{
      const hash = await wallet.writeContract({
        address: ADDR.L1_BRIDGE as `0x${string}`,
        abi: L1StandardBridge,
        functionName: 'depositETHTo',
        args: [address, 200000, '0x'],
        value: parseEther(amt)
      });
      alert(`已发送 L1→L2 ETH 存款：${hash}\n几分钟后 L2 到账。`);
    }catch(e:any){ alert(e.message||String(e)); }
  };

  // L1→L2 ERC-20
  const depositErc20L1toL2 = async ()=>{
    if(!wallet || !address) return;
    const raw = erc20Amount.trim();
    if(!raw || Number(raw)<=0) return alert('请输入有效数量');
    const amount = BigInt(Math.floor(Number(raw)*10**decimals));
    try{
      await wallet.writeContract({
        address: ADDR.L1_ERC20 as `0x${string}`,
        abi: ERC20,
        functionName: 'approve',
        args: [ADDR.L1_BRIDGE, amount]
      });
      const hash = await wallet.writeContract({
        address: ADDR.L1_BRIDGE as `0x${string}`,
        abi: L1StandardBridge,
        functionName: 'depositERC20To',
        args: [ADDR.L1_ERC20, ADDR.L2_ERC20, address, amount, 200000, '0x']
      });
      alert(`已发送 L1→L2 ERC-20 存款：${hash}\nL2 余额几分钟内到账。`);
    }catch(e:any){ alert(e.message||String(e)); }
  };

  // L2→L1 ETH（MessagePasser 初始化）
  const withdrawEthL2toL1 = async ()=>{
    if(!wallet || !address) return;
    const amt = l2toL1Eth.trim();
    if(!amt || Number(amt)<=0) return alert('请输入有效金额');
    try{
      const hash = await wallet.writeContract({
        address: ADDR.L2_MESSAGE_PASSER as `0x${string}`,
        abi: L2MessagePasser,
        functionName: 'initiateWithdrawal',
        args: [address, 0n, '0x'],
        value: parseEther(amt)
      });
      setWithdrawHash(hash);
      if (typeof window !== 'undefined') localStorage.setItem('giwa_withdraw_tx', hash);
      alert(`提现初始化成功：${hash}\n7 天后到 L1 进行 prove/finalize。`);
    }catch(e:any){ alert(e.message||String(e)); }
  };

  // L2→L1 ERC-20（初始化）
  const withdrawErc20L2toL1 = async ()=>{
    if(!wallet || !address) return;
    const raw = erc20Amount.trim();
    if(!raw || Number(raw)<=0) return alert('请输入有效数量');
    const amount = BigInt(Math.floor(Number(raw)*10**decimals));
    try{
      const hash = await wallet.writeContract({
        address: ADDR.L2_BRIDGE as `0x${string}`,
        abi: L2StandardBridge,
        functionName: 'withdraw',
        args: [ADDR.L2_ERC20, amount, 0, '0x']
      });
      alert(`L2→L1 ERC-20 提现初始化成功：${hash}\n7 天后在 L1 完成 prove/finalize。`);
    }catch(e:any){ alert(e.message||String(e)); }
  };

  const clearMemo = ()=>{
    if (typeof window !== 'undefined') localStorage.removeItem('giwa_withdraw_tx');
    setWithdrawHash('');
  };

  return (
    <div className="wrap">
      <header className="top">
        <div className="title">GIWA Bridge Tester</div>
        <ConnectButton showBalance />
      </header>

      <section className="card">
        <div className="row space">
          <div>
            <div className="muted">Explorer</div>
            <div className="row">
              <ExplorerLink href={L1.explorer}>Sepolia ↗</ExplorerLink>
              <span className="dot">·</span>
              <ExplorerLink href={L2.explorer}>GIWA ↗</ExplorerLink>
            </div>
          </div>
          <button className="btn line" onClick={refreshErc20}>刷新余额</button>
        </div>
      </section>

      {/* 余额 */}
      <section className="grid">
        <div className="card">
          <div className="h2">余额 · Sepolia</div>
          <div className="p">ETH：{fmt(l1Eth.data?.value)}</div>
        </div>
        <div className="card">
          <div className="h2">余额 · GIWA</div>
          <div className="p">ETH：{fmt(l2Eth.data?.value)}</div>
        </div>
      </section>

      {/* Faucet */}
      <section className="card">
        <div className="h2">水龙头 / Faucet</div>
        <div className="row">
          <button className="btn" onClick={()=>claim('l1')}>领取 Sepolia ERC-20</button>
          <button className="btn" onClick={()=>claim('l2')}>获取 GIWA ERC-20（说明）</button>
          <span className="tips">若合约不支持 <span className="kbd">claimFaucet</span>，将打开官方水龙头。</span>
        </div>
      </section>

      {/* L1→L2 ETH */}
      <section className="card">
        <div className="h2">Sepolia ETH → GIWA ETH（L1→L2）</div>
        <div className="row">
          <input className="input" value={l1toL2Eth} onChange={e=>setL1toL2Eth(e.target.value)} placeholder="金额（ETH）"/>
          <button className="btn" onClick={depositEthL1toL2}>存入 L2</button>
        </div>
        <div className="note">几分钟内 L2 到账（Sequencer 异步处理）。</div>
      </section>

      {/* L1→L2 ERC-20 */}
      <section className="card">
        <div className="h2">L1→L2：ERC-20 存入</div>
        <div className="row">
          <input className="input" value={erc20Amount} onChange={e=>setErc20Amount(e.target.value)} placeholder="数量（按 18 位）"/>
          <button className="btn" onClick={depositErc20L1toL2}>存入 L2</button>
        </div>
        <div className="note">会先 <span className="kbd">approve</span> 再 <span className="kbd">depositERC20To</span>。</div>
      </section>

      {/* L2→L1 ETH 提现 */}
      <section className="card">
        <div className="h2">L2→L1：ETH 提现（MessagePasser）</div>
        <div className="row">
          <input className="input" value={l2toL1Eth} onChange={e=>setL2toL1Eth(e.target.value)} placeholder="金额（ETH）"/>
          <button className="btn" onClick={withdrawEthL2toL1}>初始化提现</button>
        </div>
        <div className="note">此操作仅在 L2 初始化；L1 侧需后续 prove / finalize（约 7 天）。</div>
      </section>

      {/* L2→L1 ERC-20 提现 */}
      <section className="card">
        <div className="h2">L2→L1：ERC-20 提现（初始化）</div>
        <div className="row">
          <input className="input" value={erc20Amount} onChange={e=>setErc20Amount(e.target.value)} placeholder="数量（按 18 位）"/>
          <button className="btn" onClick={withdrawErc20L2toL1}>初始化提现</button>
        </div>
        <div className="note">完整提现包含 prove / finalize（约 7 天）。</div>
      </section>

      {/* 7 天备忘 */}
      <section className="card">
        <div className="h2">7 天后操作 · Prove / Finalize 备忘</div>
        <div className="p">把你的 L2 提现交易哈希保存下来，到点后在 L1 完成 <b>Prove</b> 与 <b>Finalize</b>。</div>
        <div className="row">
          <input className="input" placeholder="填入 L2 提现 txHash" value={withdrawHash} onChange={e=>setWithdrawHash(e.target.value)} />
          <button className="btn" onClick={()=>{
            if(withdrawHash && typeof window!=='undefined'){
              localStorage.setItem('giwa_withdraw_tx', withdrawHash);
              alert('已保存');
            }
          }}>保存到本地</button>
          <button className="btn line" onClick={clearMemo}>清除记录</button>
          {withdrawHash && (
            <a className="btn line" href={`${L2.explorer}/tx/${withdrawHash}`} target="_blank" rel="noreferrer">查看 L2 提现交易 ↗</a>
          )}
        </div>
        <div className="note">提示：Prove / Finalize 都在 <b>Sepolia</b> 发交易，需要 L1 ETH。</div>
      </section>

      <style jsx>{`
        .wrap{max-width:1100px;margin:24px auto;padding:0 16px;color:#E6E7EA;}
        .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
        .title{font-size:20px;font-weight:700;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .card{background:#0f1320;border:1px solid #23283b;border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:0 10px 30px rgba(0,0,0,.2);}
        .row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;}
        .space{justify-content:space-between;}
        .h2{font-size:16px;font-weight:700;margin-bottom:8px;}
        .muted{opacity:.8;margin-bottom:6px;}
        .dot{opacity:.6;margin:0 8px;}
        .input{background:#12172a;border:1px solid #28314d;border-radius:10px;padding:10px 12px;outline:none;color:#e6e7ea;min-width:260px;}
        .btn{background:#3b82f6;border:none;color:#fff;border-radius:10px;padding:10px 16px;cursor:pointer;}
        .btn.line{background:#1f2937;border:1px solid #334155;}
        .kbd{background:#111827;border:1px solid #334155;border-radius:6px;padding:2px 6px;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;}
        .note{opacity:.85;margin-top:6px;}
        .tips{opacity:.85}
        .p{margin:2px 0;}
        @media (max-width:860px){ .grid{grid-template-columns:1fr;} }
      `}</style>
    </div>
  );
}
