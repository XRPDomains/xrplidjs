const xrpl = require("xrpl");

const signature = require('verify-xrpl-signature');

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser')
const timeout = require('connect-timeout');
const editJsonFile = require("edit-json-file");
const bs58 = require("bs58");
const Pusher = require("pusher");
const fetch = require('node-fetch');
const axios = require('axios');

const app = express();
const port = 5555;
const baseNetwork = 'TESTNET'; //devnet

const verifySign = signature.verifySignature;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(timeout('120s'));

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

app.get('/verifySign', (req, res) => {
    var sign = req.query.sign;
    var obj = signature.verifySignature(sign);
    res.send(obj);
});

app.post('/mintDomain', (req, res) => {

    var domain = req.body.domain;
    var payment_tx = req.body.payment_tx;
    var owner = req.body.owner;
    var receiver = req.body.receiver;
    var amount = req.body.amount;
    var network = req.body.network;
    var url = req.body.url;
    var uuid = req.body.uuid;

    var rpcUrl = 'wss://s.altnet.rippletest.net:51233';

    if (network == 'MAINNET') {
        rpcUrl = 'wss://s2.ripple.com';
    }

    const pusher = new Pusher({
        appId: "422916",
        key: "f730ce75d58b8975fba7",
        secret: "b50f9fa9e50e8dcbdcc7",
        cluster: "ap1",
        useTLS: true
    });

    mintDomain();

    async function mintDomain() {
        // check params

        var client = new xrpl.Client(rpcUrl);

        await client.connect();

        var msg = 'Success';

        var uri = xrpl.convertStringToHex(url);

        var isOK = true;

        var _obj;

        var objMint;

        // process
        if (isOK == true) {
            try {

                const wallet = xrpl.Wallet.fromSeed('sEd7QtEVdEGsCEDDKG2TxHogD9KMPD3');

                var nftoken_id_new = '';

                var mint_tx_new = '';

                var offer_id_new = '';

                var create_offer_tx_new = '';

                const mint_payload = {
                    "TransactionType": "NFTokenMint",
                    "Account": wallet.classicAddress,
                    "URI": uri,
                    "Flags": parseInt(8),
                    "TransferFee": parseInt(0),
                    "NFTokenTaxon": 0 //Required, but if you have no use for it, set to zero.
                }

                objMint = await client.submitAndWait(mint_payload, { wallet: wallet });

                mint_tx_new = objMint.result.hash;

                if (objMint.result.meta.TransactionResult == 'tesSUCCESS') {

                    var NFTokens = objMint.result.meta.AffectedNodes[1].ModifiedNode.FinalFields.NFTokens;

                    var objNFToken = NFTokens.find(p => p.NFToken.URI == uri);

                    nftoken_id_new = objNFToken.NFToken.NFTokenID;

                    if (nftoken_id_new !== '') {

                        var objMinted = new Object();
                        objMinted.domain = domain;
                        objMinted.owner = owner;
                        objMinted.mint_tx = mint_tx_new;
                        objMinted.nftoken_id = nftoken_id_new;
                        objMinted.uri = uri;

                        var mintedOrderUrl = 'https://xrpdomains.xyz/api/xrplnft/mintedOrder';

                        axios({
                            method: 'post',
                            url: mintedOrderUrl,
                            data: JSON.stringify(objMinted)
                        });

                        pusher.trigger("xrpdomains_pusher", uuid, {
                            message: JSON.stringify(objMinted)
                        });
                    }
                }

                if (nftoken_id_new !== '') {
                    var days = 365;
                    let d = new Date();
                    d.setDate(d.getDate() + parseInt(days));
                    var expirationDate = xrpl.isoTimeToRippleTime(d);
                    
                    var MemoData = xrpl.convertStringToHex(domain);
                    
                    const createOffer_payload = {
                        "TransactionType": "NFTokenCreateOffer",
                        "Account": wallet.classicAddress,
                        "NFTokenID": nftoken_id_new,
                        "Amount": xrpl.xrpToDrops("0"),
                        "Flags": parseInt(1),
                        "Expiration": expirationDate,
                        "Destination": owner,
                        "Memos": [
                            {
                                "Memo": {
                                    "MemoData": MemoData
                                }
                            }
                        ]
                    }

                    const objCreateOffer = await client.submitAndWait(createOffer_payload, { wallet: wallet });

                    create_offer_tx_new = objCreateOffer.result.hash;

                    if (objCreateOffer.result.meta.TransactionResult == 'tesSUCCESS') {

                        var nftSellOffers;
                        try {
                            nftSellOffers = await client.request({
                                method: "nft_sell_offers",
                                nft_id: nftoken_id_new
                            });
                        } catch (err) {

                        }

                        if (typeof nftSellOffers !== 'undefined') {

                            var offers = nftSellOffers.result.offers;

                            var offer = offers.find(p => p.destination !== null && p.destination == owner);

                            offer_id_new = offer.nft_offer_index;

                            var objCreateOffered = new Object();
                            objCreateOffered.domain = domain;
                            objCreateOffered.owner = owner;
                            objCreateOffered.create_offer_tx = objCreateOffer.result.hash;
                            objCreateOffered.offer_id = offer_id_new;

                            var createOfferedOrderUrl = 'https://xrpdomains.xyz/api/xrplnft/createOfferedOrder';

                            axios({
                                method: 'post',
                                url: createOfferedOrderUrl,
                                data: JSON.stringify(objCreateOffered)
                            });

                            pusher.trigger("xrpdomains_pusher", uuid, {
                                message: JSON.stringify(objCreateOffered)
                            });
                        }
                    }
                }

                _obj = new Object({
                    domain: domain,
                    owner: owner,
                    uri: uri,
                    mint_tx: mint_tx_new,
                    nftoken_id: nftoken_id_new,
                    create_offer_tx: create_offer_tx_new,
                    offer_id: offer_id_new,
                });

            } catch (error) {
                console.log(error);
                isOK = false;
                msg = error.toString();
            }
        }

        var _out = new Object({
            status: isOK,
            msg: msg,
            data: _obj
        });

        return res.send(JSON.stringify(_out));
    };
});

app.listen(port, () => {

});

