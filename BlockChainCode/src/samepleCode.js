/**
 * Import crypto-js/SHA256 library
 */
const SHA256 = require('crypto-js/sha256');

/**
 * Class with a constructor for block 
 */
class Block {

	constructor(data){
		this.id = 0;
        this.nonce = 144446;
      	this.body = data;
      	this.hash = "";
    }
    
    /**
     * Step 1. Implement `generateHash()`
     * method that return the `self` block with the hash.
     * 
     * Create a Promise that resolve with `self` after you create 
     * the hash of the object and assigned to the hash property `self.hash = ...`
     
     needs to return a Promise
     */
  	// 
  	generateHash() {
      var promise = new Promise((resolve, reject) => {
  
        this.hash = SHA256(JSON.stringify(this));

  		if (this.hash != "") {
    		resolve(this);
  		}
  		else {
    		reject(Error("It broke"));
  		}
		});
	return promise;
    
    }
}

// Exporting the class Block to be reuse in other files
module.exports.Block = Block;