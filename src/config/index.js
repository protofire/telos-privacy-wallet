const isElectron = () => process.env.REACT_APP_BUILD_TARGET === 'electron';


const getAppBaseURL = () => {
  const href =
    (typeof window !== 'undefined' && window.location?.href) ||
    '';

  if (!href) return './';

  return href.replace(/\/[^/]*$/, '/') + '';
};

const assetURL = (relPath) => {
  const base = getAppBaseURL();
  return new URL(relPath, base).toString();
};

const config = {
  prod: {
    defaultPool: 'BOB2USDC-polygon',
    pools: {
      'BOB2USDC-polygon': {
        chainId: 137,
        poolAddress: '0x72e6B59D4a90ab232e55D4BB7ed2dD17494D62fB',
        tokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        relayerUrls: ['https://relayer-mvp.zkbob.com'],
        delegatedProverUrls: ['https://remoteprover-mvp.zkbob.com/'],
        coldStorageConfigPath: 'https://r2.zkbob.com/coldstorage/coldstorage.cfg',
        kycUrls: {
          status: 'https://api.knowyourcat.id/v1/%s/categories?category=BABTokenBOB',
          homepage: 'https://knowyourcat.id/address/%s/BABTokenBOB',
        },
        tokenSymbol: 'USDC',
        tokenDecimals: 6,
        feeDecimals: 2,
        depositScheme: 'usdc',
        minTxAmount: 50000000n, // 0.05 USDC
        ddSubgraph: 'zkbob-usdc-polygon',
        migrations: [{
          timestamp: 1689689468,
          prevTokenSymbol: 'BOB',
        }, {
          timestamp: 1700481600,
          prevTokenSymbol: 'USDC.e',
        }],
        addressPrefix: 'zkbob_polygon',
        paymentContractAddress: '0x76a911E76fC78F39e73cE0c532F8866ac28Dfe43',
        parameters: 'prod',
        closingDate: '2025-02-01T00:00:00Z',
      },
      'BOB2USDC-optimism': {
        chainId: 10,
        poolAddress: '0x1CA8C2B9B20E18e86d5b9a72370fC6c91814c97C',
        tokenAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        // relayerUrls: ['https://relayer-optimism.zkbob.com/'],
        proxyUrls: ["https://proxy1.zkbob.com", "https://proxy2.zkbob.com"],
        delegatedProverUrls: [],
        coldStorageConfigPath: '',
        tokenSymbol: 'USDC',
        tokenDecimals: 6,
        feeDecimals: 2,
        depositScheme: 'usdc',
        minTxAmount: 50000000n, // 0.05 USDC
        ddSubgraph: 'zkbob-bob-optimism',
        migrations: [{
          timestamp: 1696854269,
          prevTokenSymbol: 'BOB',
        }],
        addressPrefix: 'zkbob_optimism',
        paymentContractAddress: '0x860513FbdC4B6B2B210e1D393BE244F1d0b1Babd',
        parameters: 'prod'
      },
      'WETH-optimism': {
        chainId: 10,
        poolAddress: '0x58320A55bbc5F89E5D0c92108F762Ac0172C5992',
        tokenAddress: '0x4200000000000000000000000000000000000006',
        relayerUrls: ['https://relayer-eth-opt-mvp.zkbob.com/'],
        delegatedProverUrls: [],
        coldStorageConfigPath: '',
        kycUrls: {
          status: 'https://api.knowyourcat.id/v1/%s/categories?category=BABTokenBOB',
          homepage: 'https://knowyourcat.id/address/%s/BABTokenBOB/10',
        },
        tokenSymbol: 'ETH',
        tokenDecimals: 18,
        isNative: true,
        depositScheme: 'permit2',
        minTxAmount: 1000000n, // 0.001 ETH
        ddSubgraph: 'zkbob-eth-optimism',
        addressPrefix: 'zkbob_optimism_eth',
        paymentContractAddress: '0x7a8006Ea0Dda93C56E60187Bd55109AbfF486c6F',
        parameters: 'prod'
      },
    },
    chains: {
      '137': {
        rpcUrls: ['https://polygon-mainnet.infura.io/v3/be5a139ca13b42609fab98b55dbb5a03'],
      },
      '10': {
        rpcUrls: ['https://optimism-mainnet.infura.io/v3/be5a139ca13b42609fab98b55dbb5a03'],
      },
    },
    "snarkParamsSet": {
      "prod": isElectron() ? {
        transferParamsUrl: assetURL('assets/transfer_params_22022023.bin'),
        transferVkUrl: assetURL('assets/transfer_verification_key_22022023.json'),
      } : {
        transferParamsUrl: 'https://r2.zkbob.com/transfer_params_22022023.bin',
        transferVkUrl: 'https://r2.zkbob.com/transfer_verification_key_22022023.json',
      }
    }
  },
  dev: {
    defaultPool: 'zkbob_sepolia',
    pools: {
      'zkbob_sepolia': {
        chainId: 11155111,
        poolAddress: '0x77f3D9Fb578a0F2B300347fb3Cd302dFd7eedf93',
        tokenAddress: '0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f',
        proxyUrls: ['https://sepolia-decentralized-relayer.thgkjlr.website'],
        delegatedProverUrls: ['https://prover-staging.thgkjlr.website/'],
        coldStorageConfigPath: 'https://r2-staging.zkbob.com/coldstorage/coldstorage.cfg',
        kycUrls: {
          status: 'https://api-stage.knowyourcat.id/v1/%s/categories?category=BABTokenBOB',
          homepage: 'https://stage.knowyourcat.id/address/%s/BABTokenBOB',
        },
        tokenSymbol: 'BOB',
        tokenDecimals: 18,
        feeDecimals: 2,
        depositScheme: 'permit',
        addressPrefix: 'zkbob_sepolia',
        parameters: 'staging'
      },
    },
    "snarkParamsSet": {
      "staging": {
        transferParamsUrl: 'https://r2-staging.zkbob.com/transfer_params_20022023.bin',
        transferVkUrl: 'https://r2-staging.zkbob.com/transfer_verification_key_20022023.json'
      },
    },
    chains: {
      '11155111': {
        rpcUrls: ['https://sepolia.infura.io/v3/9a94d181b23846209f01161dcd0f9ad6'],
      },
      '5': {
        rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161']
      },
      '420': {
        rpcUrls: ['https://goerli.optimism.io']
      },
      '3448148188': {
        rpcUrls: ['https://nile.trongrid.io'],
        external: "https://deploy-preview-250--shimmering-douhua-023cc6.netlify.app"
      },
      '10': {
        rpcUrls: ["https://virtual.optimism.rpc.tenderly.co/fb1a77c3-e7f5-4622-aee5-85025a99a658"]
      },
    },
    extraPrefixes: [
      {
        poolId: 16776968,
        prefix: 'zkbob_nile_g',
        name: 'USDT on Nile testnet (MPC guard contracts)',
      },
      {
        poolId: 16776969,
        prefix: 'zkbob_sepolia',
        name: 'Bob Pool on Sepolia with decentralized relayer',
      },
    ],
  }
};

export default config[process.env.REACT_APP_CONFIG || 'dev'];
