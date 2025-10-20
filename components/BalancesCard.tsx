import { useAccount, useBalance, useChainId, useReadContract } from 'wagmi';
import { ERC20 as erc20Abi } from "@/lib/abis";
import { env, fmt } from '@/lib/utils';
import { L2, L1 } from '@/lib/chains';

export default function BalancesCard() {
  const { address } = useAccount();
  const l1Id = L1.id;
  const l2Id = L2.id;

  const l1Eth = useBalance({ address, chainId: l1Id, query: { enabled: !!address, refetchInterval: 8000 } });
  const l2Eth = useBalance({ address, chainId: l2Id, query: { enabled: !!address, refetchInterval: 8000 } });

  const l1Erc20 = useReadContract({
    chainId: l1Id,
    abi: erc20Abi,
    address: env.L1_ERC20 as `0x${string}`,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address && env.L1_ERC20 !== '0x0000000000000000000000000000000000000000' }
  });

  const l2Erc20 = useReadContract({
    chainId: l2Id,
    abi: erc20Abi,
    address: env.L2_ERC20 as `0x${string}`,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address && env.L2_ERC20 !== '0x0000000000000000000000000000000000000000' }
  });

  return (
    <div className="card">
      <h3>余额总览</h3>
      {!address ? <div className="small">请先连接钱包</div> :
      <>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>Sepolia ETH</div>
          <div>{l1Eth.isLoading ? '…' : l1Eth.data ? `${l1Eth.data.formatted} ETH` : '-'}</div>
        </div>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>GIWA ETH</div>
          <div>{l2Eth.isLoading ? '…' : l2Eth.data ? `${l2Eth.data.formatted} ETH` : '-'}</div>
        </div>
        <div className="separator" />
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>L1 ERC-20</div>
          <div>{l1Erc20.isFetching ? '…' : (typeof l1Erc20.data === 'bigint' ? fmt(l1Erc20.data) : '-')}</div>
        </div>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>L2 ERC-20</div>
          <div>{l2Erc20.isFetching ? '…' : (typeof l2Erc20.data === 'bigint' ? fmt(l2Erc20.data) : '-')}</div>
        </div>
      </>}
      <div className="separator" />
      <div className="small">
        Explorer：
        <a className="link" href={env.L1_EXPLORER} target="_blank">Sepolia</a> ·
        <a className="link" href={env.L2_EXPLORER} target="_blank">GIWA</a>
      </div>
    </div>
  );
}

