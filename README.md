# XRP Web3 Identity
SDK and API for XRP Web3 Identity

Nodejs SDK

Npm: https://www.npmjs.com/package/xrpdomainjs

Github: https://github.com/XRDomains/XRPDomainJS

Before installing the package you need to check and be sure to install the packages below:

```
npm install xrpl verify-xrpl-signature
```

Install Package

```
npm install xrpdomainjs
```

Call 
```
const xrpdomainjs = require('xrpdomainjs');
const network = 'TESTNET';

const config = 
{
		rpcUrl: "wss://xrplcluster.com/",
		Issuer: "raAyazbgEkwzLByXipQuPLWFfnsPS1v1q9",
		
}

async function main() {
	const sdk = xrpdomainjs.SDK(config);	
	
  // your xrp domain
	const domain = "hello.xrp";
		
	// resolve domain to get the address of the owner.
	const owner = await sdk.gerAddress(domain);
	
	console.log(owner);
	
	// your address
	const address = "rLhi87aSCyNW88tW4632yLiwinbghFZNue";
	
	const domain = await sdk.getName(address);
	
	console.log(domain);
}

main();
```

Pls update test.js for specific instructions

Thanks!
