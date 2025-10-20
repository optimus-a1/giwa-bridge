// pages/_app.tsx
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useMemo } from 'react'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'

import { WagmiProvider, http, createConfig } from 'wagmi'
import { sepolia as wagmiSepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/** ========= 环境变量 ========= */
const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || 'GIWA Bridge Test Frontend'
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
const APP_ICON =
  process.env.NEXT_PUBLIC_APP_ICON || 'https://sepolia-explorer.giwa.io/favicon.ico'

const WC_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '' // 可留空

const RPC_SEPOLIA =
  process.env.NEXT_PUBLIC_RPC_SEPOLIA ||
  'https://ethereum-sepolia-rpc.publicnode.com'
const RPC_GIWA =
  process.env.NEXT_PUBLIC_RPC_GIWA ||
  'https://sepolia-rpc.giwa.io'

const CHAIN_ID_SEPOLIA = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID_SEPOLIA || 11155111
)
const CHAIN_ID_GIWA = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID_GIWA || 91342
)

/** ========= 自定义 GIWA 链 ========= */
const giwaChain = {
  id: CHAIN_ID_GIWA,
  name: 'GIWA Sepolia',
  network: 'giwa-sepolia',
  nativeCurrency: { name: 'GIWA ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_GIWA] },
    public: { http: [RPC_GIWA] },
  },
  blockExplorers: {
    default: { name: 'GIWA Explorer', url: 'https://sepolia-explorer.giwa.io' },
  },
} as const

/** ========= wagmi config（使用 wagmi 自带 connectors） ========= */
const queryClient = new QueryClient()

// 连接器：始终启用 injected 与 MetaMask；仅当提供了 WalletConnect 项目 ID 时才启用 WalletConnect
const connectors = [
  injected(),        // 通用浏览器注入钱包（含小狐狸）
  metaMask(),        // MetaMask 专用（和 injected 并存没关系）
  ...(WC_PROJECT_ID ? [walletConnect({ projectId: WC_PROJECT_ID })] : []),
]

const wagmiConfig = createConfig({
  chains: [
    // 强制 sepolia 使用你的 RPC，避免 viem 报 "No URL provided to the Transport"
    {
      ...wagmiSepolia,
      id: CHAIN_ID_SEPOLIA,
      rpcUrls: {
        ...wagmiSepolia.rpcUrls,
        default: { http: [RPC_SEPOLIA] },
        public: { http: [RPC_SEPOLIA] },
      },
    },
    giwaChain,
  ],
  connectors,
  transports: {
    [CHAIN_ID_SEPOLIA]: http(RPC_SEPOLIA),
    [CHAIN_ID_GIWA]: http(RPC_GIWA),
  },
  ssr: true,
})

/** ========= 应用壳 ========= */
export default function MyApp({ Component, pageProps }: AppProps) {
  const title = useMemo(() => APP_NAME, [])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="GIWA ↔ Sepolia Bridge Test UI" />
        <link rel="icon" href={APP_ICON} />
      </Head>

      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#f5a524',
              borderRadius: 'medium',
            })}
            appInfo={{ appName: APP_NAME, learnMoreUrl: APP_URL }}
            initialChain={CHAIN_ID_GIWA} // 默认展示 GIWA，可改为 CHAIN_ID_SEPOLIA
            coolMode
          >
            <Component {...pageProps} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}
