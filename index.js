const xrpl = require("xrpl");

const signature = require('verify-xrpl-signature');

const fetch = require("node-fetch");

var exports=module.exports={};

exports.SDK = function (config) {
	
	var rpcUrl = 'wss://xrplcluster.com/';
	
	var Issuer = 'raAyazbgEkwzLByXipQuPLWFfnsPS1v1q9';

	var endpoint = 'https://app.xrpdomains.xyz/api/xrplnft';
	
	if (config !== null && typeof config !== 'undefined')
	{
		rpcUrl = config.rpcUrl;
		try{
			Issuer = config.Issuer;
		}catch{}
	}
	
	if (rpcUrl == ''){
		throw Error ('rpcUrl is not empty');
	}
	if (Issuer == ''){
		throw Error ('Issuer is not empty');
	}
	
	const func = new Object();
	
	func.getAddress = async (domain, metadata = false) => 
	{
		var _return = null;
		try{
			const client = new xrpl.Client(rpcUrl);
			await client.connect();
			const res = await fetch(endpoint + '/getAddress?domain=' + domain);
			const obj = await res.json();
			client.disconnect();
			_return = obj;
		}catch(error){
			var output = new Object();
			output.status = false;
			output.code = 1;
			output.msg = error.toString()
			_return = output;
		}
		return _return;
	}
	
	func.getName = async (address) => 
	{

		var _return = null;
		try{
			const client = new xrpl.Client(rpcUrl);
			await client.connect();
			const res = await fetch(endpoint + '/getName?address=' + address);
			const obj = await res.json();
			client.disconnect();
			_return = obj;
		}
		catch(error){
			var output = new Object();
			output.status = false;
			output.code = 1;
			output.msg = error.toString();
			output.data = null;
			_return = output;
		}
		return _return;
	}
  
    func.getAllNames = async (address) => 
	{
		var _return = null;
		try{
			const client = new xrpl.Client(rpcUrl);
			await client.connect();
			const res = await fetch(endpoint + '/getAllNames?address=' + address);
			const obj = await res.json();
			client.disconnect();
			_return = obj;
		}
		catch(error){
			var output = new Object();
			output.status = false;
			output.code = 1;
			output.msg = error.toString();
			output.data = null;
			_return = output;
		}
		return _return;
	}
	
	func.extractName = async (uri) => 
	{
		const NFTokenBaseUri = 'https://mainnet.xrpdomains.xyz/api/nftdomains/metadata/';
		const url = xrpl.convertHexToString(uri);
		const domain = url.replace(NFTokenBaseUri, '');
		return domain;
	}

	func.verifySign = async (txhex) => 
	{
		var obj = signature.verifySignature(txhex);
		return obj;
	}
	
	return func;	
}


