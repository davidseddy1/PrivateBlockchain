/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            try{
               await this._addBlock(block);
            } catch {
                console.log("Issue Adding Genesis.")
            }
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        let self = this;
        return new Promise((resolve, reject) => {
            resolve(self.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */

    _addBlock(block) {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {

            block.height = self.chain.length;
            // UTC timestamp
            block.time = new Date().getTime().toString().slice(0,-3);
            if (self.chain.length>0) {
              // previous block hash
              block.previousBlockHash = self.chain[self.chain.length-1].hash;
            }
            
            try{
                let errorLog = await self.validateChain();

                if (errorLog.length == 0){
                    // SHA256 requires a string of data
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    //console.log(JSON.stringify(block));
                    // add block to chain
                    self.chain.push(block);
                    resolve(block);
                }
            } catch {
                console.log("Issue validating and/or adding");
            }


            // else {reject(errorLog); }
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} employer_pk 
     * 
     *  You will need to replace <WALLET_ADDRESS> with the wallet address 
    submitted by the requestor and the time in your message will allow you to validate the 5 minutes time window.

     */
    requestMessageOwnershipVerification(employer_pk) {
        return new Promise((resolve) => {
            resolve( employer_pk + ":" + new Date().getTime().toString().slice(0,-3) + ":RUIsRegistry");
        });
    }

    /**
     * The submitScore(employer_pk, message, signature, employee_pk, rui) method
     * will allow users to register a new Block with the score and employee_pk object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} employer_pk 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} employee_pk
     * @param {*} rui
     */
    submitScore(employer_pk, message, signature, employee_pk, rui) {
        let self = this;
        return new Promise(async (resolve, reject) => {

            let messageTime = parseInt(message.split(':')[1]);
            let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));

            if (currentTime - messageTime > 3000000) { // maximum time they have to submit signature
                reject(Error("Time Expired"));
            };

            if(!bitcoinMessage.verify(message, employer_pk, signature)){
                reject(Error("Invalid Signature"));
            }
            let contents = {"employer_pk":employer_pk,"message":message,"signature":signature,"employee_pk":employee_pk, "rui":rui};
            let block = new BlockClass.Block(contents);
            try{
                await self._addBlock(block);
            } catch{
                console.log("Issue adding");
            }
            resolve(block);
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.find(p => p.hash === hash);
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Scores objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the score should be returned decoded.
     * @param {*} address 
     */
    getScore (employee_pk) {
        let self = this;
        let scores = [];
        return new Promise((resolve, reject) => {
            self.chain.forEach(elementBlock => {
                let data = elementBlock.getBData();
                if(data!="Genesys block!"){
                    if (data.employee_pk == employee_pk){
                        scores.push(data.rui);
                    }
                }
            });
            resolve(scores);
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            let j = 0;
            for ( var i in self.chain ) {
                if (j>0){
                    try{
                        let result = await self.chain[i].validate();
                            if(!result){
                                errorLog.push("invalid block number:" + i);
                            }
                        } catch {
                            console.log("Error with block validation a");
                        }
                    }
                    j++;
            };
            self.chain.forEach((elementBlock, i) => {
                if(i>0){
                    let previousBlock = self.chain[i-1];
                    if(elementBlock.previousBlockHash != previousBlock.hash){
                        errorLog.push("invalid link from block number" + i + " to previous block.");
                    }
                }
            });
            resolve(errorLog);
        });
    }

}

module.exports.Blockchain = Blockchain;   