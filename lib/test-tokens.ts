"use client"

// Test token configurations for different networks
export interface TestToken {
  address: string
  symbol: string
  name: string
  decimals: number
  icon: string
  faucetUrl?: string
  description: string
  network: string
}

export const TEST_TOKENS: { [networkId: string]: TestToken[] } = {
  ethereum: [
    {
      address: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      symbol: "LINK",
      name: "Chainlink Token",
      decimals: 18,
      icon: "🔗",
      faucetUrl: "https://faucets.chain.link/",
      description: "Chainlink test token for Ethereum testnet",
      network: "ethereum",
    },
    {
      address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
      symbol: "USDC",
      name: "USD Coin (Test)",
      decimals: 6,
      icon: "💵",
      faucetUrl: "https://faucet.circle.com/",
      description: "Test USDC token for development",
      network: "ethereum",
    },
    {
      address: "0xaFF4481D10270F50f203E0763e2597776068CBc5",
      symbol: "WEENUS",
      name: "Weenus Token",
      decimals: 18,
      icon: "🌭",
      faucetUrl: "https://github.com/bokkypoobah/WeenusTokenFaucet",
      description: "Free test token for Ethereum development",
      network: "ethereum",
    },
    {
      address: "0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8",
      symbol: "XEENUS",
      name: "Xeenus Token",
      decimals: 18,
      icon: "❌",
      faucetUrl: "https://github.com/bokkypoobah/WeenusTokenFaucet",
      description: "Another free test token for development",
      network: "ethereum",
    },
  ],
  bsc: [
    {
      address: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
      symbol: "BUSD",
      name: "Binance USD (Test)",
      decimals: 18,
      icon: "💰",
      faucetUrl: "https://testnet.binance.org/faucet-smart",
      description: "Test BUSD token for BSC testnet",
      network: "bsc",
    },
    {
      address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      symbol: "USDT",
      name: "Tether USD (Test)",
      decimals: 18,
      icon: "🟢",
      faucetUrl: "https://testnet.binance.org/faucet-smart",
      description: "Test USDT token for BSC development",
      network: "bsc",
    },
  ],
  polygon: [
    {
      address: "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e",
      symbol: "TST",
      name: "Test Token",
      decimals: 18,
      icon: "🧪",
      faucetUrl: "https://faucet.polygon.technology/",
      description: "Generic test token for Polygon",
      network: "polygon",
    },
    {
      address: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23",
      symbol: "USDC",
      name: "USD Coin (Test)",
      decimals: 6,
      icon: "💵",
      faucetUrl: "https://faucet.polygon.technology/",
      description: "Test USDC for Polygon Mumbai",
      network: "polygon",
    },
  ],
  arbitrum: [
    {
      address: "0x179522635726710Dd7D2035a81d856de4Aa7836c",
      symbol: "USDC",
      name: "USD Coin (Test)",
      decimals: 6,
      icon: "💵",
      faucetUrl: "https://bridge.arbitrum.io/",
      description: "Test USDC for Arbitrum testnet",
      network: "arbitrum",
    },
  ],
}

// Mock token balances for testing
export const MOCK_TOKEN_BALANCES: { [address: string]: string } = {
  "0x326C977E6efc84E512bB9C30f76E30c160eD06FB": "1000.0",
  "0x07865c6E87B9F70255377e024ace6630C1Eaa37F": "5000.0",
  "0xaFF4481D10270F50f203E0763e2597776068CBc5": "10000.0",
  "0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8": "7500.0",
  "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7": "2500.0",
  "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd": "3000.0",
  "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e": "8000.0",
  "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23": "4500.0",
  "0x179522635726710Dd7D2035a81d856de4Aa7836c": "6000.0",
}

export function getTestTokensForNetwork(networkId: string): TestToken[] {
  return TEST_TOKENS[networkId] || []
}

export function getTokenBalance(tokenAddress: string): string {
  return MOCK_TOKEN_BALANCES[tokenAddress] || "0"
}
