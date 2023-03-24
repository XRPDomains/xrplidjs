const xrplidjs = require('xrplidjs');

const config = 
{
	rpcUrl: "wss://xrplcluster.com/",
	Issuer: "raAyazbgEkwzLByXipQuPLWFfnsPS1v1q9",
		
}

async function main() {
	const sdk = xrplidjs.SDK(config);	
	
    // your xrp domain
	const domain = "hello.xrp";
		
	// resolve domain to get the address of the owner.
	const objOwner = await sdk.getAddress(domain);
	
	console.log(objOwner);
	
	// your address
	const address = "rLhi87aSCyNW88tW4632yLiwinbghFZNue";
	
	const objDomain = await sdk.getName(address);
	
	console.log(objDomain);
}

main();