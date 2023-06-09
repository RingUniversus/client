import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { argentWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, configureChains, WagmiConfig } from "wagmi";
import { Chain, hardhat } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const rinkeby: Chain = {
  id: 4,
  name: "Rinkeby",
  network: "rinkeby",
  nativeCurrency: { name: "Rinkeby Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    alchemy: { http: ["https://eth-rinkeby.alchemyapi.io/v2"] },
    default: { http: ["https://rpc.ankr.com/eth_rinkeby"] },
    infura: { http: ["https://rinkeby.infura.io/v3"] },
    public: { http: ["https://rpc.ankr.com/eth_rinkeby"] },
  },
  blockExplorers: {
    etherscan: { name: "Etherscan", url: "https://rinkeby.etherscan.io" },
    default: { name: "Etherscan", url: "https://rinkeby.etherscan.io" },
  },
  contracts: {
    ensRegistry: {
      address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 10299530,
    },
  },
  testnet: true,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [hardhat],
  [publicProvider()]
);

const projectId = "4cfe4db857f48ef9f6f2b0365fe505e0";

const { wallets } = getDefaultWallets({
  appName: "RainbowKit Mint NFT Demo",
  projectId,
  chains,
});

const demoAppInfo = {
  appName: "RainbowKit Mint NFT Demo",
};

const connectors = connectorsForWallets([
  ...wallets,
  // {
  //   groupName: "Other",
  //   wallets: [
  //     argentWallet({ projectId, chains }),
  //     trustWallet({ projectId, chains }),
  //   ],
  // },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
