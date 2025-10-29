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
        transferParamsUrl: 'https://telos-privacy-ui.s3-website.us-east-2.amazonaws.com/transfer_params_22022023.bin',
        transferVkUrl: 'https://telos-privacy-ui.s3-website.us-east-2.amazonaws.com/transfer_verification_key_22022023.json',
      }
    }
  },
  dev: {
    defaultPool: 'zkbob_sepolia',
    pools: {
      'zkbob_sepolia': {
        chainId: 11155111,
        poolAddress: '0x31dD7AD6f82F657266c47ac5dDeeB5e02A14aCB6',
        tokenAddress: '0x53FA37CCad75d391bBEc857C6f359A101D754441',
        relayerUrls: ['http://localhost:3000'],
        delegatedProverUrls: ['https://prover-staging.thgkjlr.website/'],
        coldStorageConfigPath: 'https://r2-staging.zkbob.com/coldstorage/coldstorage.cfg',
        kycUrls: {
          status: 'https://api-stage.knowyourcat.id/v1/%s/categories?category=BABTokenBOB',
          homepage: 'https://stage.knowyourcat.id/address/%s/BABTokenBOB',
        },
        tokenSymbol: 'BOB',
        tokenDecimals: 18,
        feeDecimals: 2,
        depositScheme: 'approve',
        addressPrefix: 'zkbob_sepolia',
        parameters: 'staging'
      },
    },
    "snarkParamsSet": {
      "staging": {
        transferParamsUrl: 'https://dev-telos-params.s3.us-east-1.amazonaws.com/transfer_params.bin',
        transferVkUrl: 'https://dev-telos-params.s3.us-east-1.amazonaws.com/transfer_verification_key.json'
      },
    },
    chains: {
      '11155111': {
        rpcUrls: ['https://sepolia.infura.io/v3/9a94d181b23846209f01161dcd0f9ad6'],
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
