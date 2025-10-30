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
    },
    chains: {
      '137': {
        rpcUrls: ['https://polygon-mainnet.infura.io/v3/be5a139ca13b42609fab98b55dbb5a03'],
      },
      '40': {
        rpcUrls: ['https://rpc.telos.net']
      },
    },
    "snarkParamsSet": {
      "prod": isElectron() ? {
        transferParamsUrl: assetURL('assets/transfer_params_22022023.bin'),
        transferVkUrl: assetURL('assets/transfer_verification_key_22022023.json'),
      } : {
        transferParamsUrl: 'https://telos-privacy-params.s3.us-east-2.amazonaws.com/transfer_params.bin',
        transferVkUrl: 'https://telos-privacy-params.s3.us-east-2.amazonaws.com/transfer_verification_key.json',
      }
    }
  },
  dev: {
    defaultPool: 'eth_sepolia',
    pools: {
      'ptk_sepolia': {
        chainId: 11155111,
        poolAddress: '0x31dD7AD6f82F657266c47ac5dDeeB5e02A14aCB6',
        tokenAddress: '0x53FA37CCad75d391bBEc857C6f359A101D754441',
        relayerUrls: ['https://3.147.241.79/'],
        delegatedProverUrls: ['https://prover-staging.thgkjlr.website/'],
        coldStorageConfigPath: 'https://r2-staging.zkbob.com/coldstorage/coldstorage.cfg',
        kycUrls: {
          status: 'https://api-stage.knowyourcat.id/v1/%s/categories?category=BABTokenBOB',
          homepage: 'https://stage.knowyourcat.id/address/%s/BABTokenBOB',
        },
        tokenSymbol: 'PTK',
        tokenDecimals: 18,
        feeDecimals: 2,
        depositScheme: 'approve',
        addressPrefix: 'ptk_sepolia',
        parameters: 'staging'
      },
      'eth_sepolia': {
        chainId: 11155111,
        poolAddress: '0xd65B229714FE713E91ee58dbD8e6cDaC414017cc',
        tokenAddress: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
        relayerUrls: ['https://3.147.241.79/'],
        delegatedProverUrls: ['https://prover-staging.thgkjlr.website/'],
        coldStorageConfigPath: 'https://r2-staging.zkbob.com/coldstorage/coldstorage.cfg',
        kycUrls: {
          status: 'https://api-stage.knowyourcat.id/v1/%s/categories?category=BABTokenBOB',
          homepage: 'https://stage.knowyourcat.id/address/%s/BABTokenBOB',
        },
        tokenSymbol: 'ETH',
        tokenDecimals: 18,
        feeDecimals: 2,
        depositScheme: 'approve',
        addressPrefix: 'eth_sepolia',
        parameters: 'staging'
      },
    },
    "snarkParamsSet": {
      "staging": {
        transferParamsUrl: 'https://telos-privacy-params.s3.us-east-2.amazonaws.com/transfer_params.bin',
        transferVkUrl: 'https://telos-privacy-params.s3.us-east-2.amazonaws.com/transfer_verification_key.json'
      },
    },
    chains: {
      '11155111': {
        // rpcUrls: ['https://virtual.sepolia.eu.rpc.tenderly.co/e2d3c7a3-b5e9-46c1-8b04-35febc2fb719'],
        rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
      },
      '41': {
        rpcUrls: ['https://rpc.testnet.telos.net']
      },
    },
    extraPrefixes: [
      {
        poolId: 16776969,
        prefix: 'zkbob_sepolia',
        name: 'Bob Pool on Sepolia with decentralized relayer',
      },
    ],
  }
};

export default config[process.env.REACT_APP_CONFIG || 'dev'];
