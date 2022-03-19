/**
 *          BlockchainController
 *       (Do not change this code)
 * 
 * This class expose the endpoints that the client applications will use to interact with the 
 * Blockchain dataset
 */
class BlockchainController {

    //The constructor receive the instance of the express.js app and the Blockchain class
    constructor(app, blockchainObj) {
        this.app = app;
        this.blockchain = blockchainObj;
        // All the endpoints methods needs to be called in the constructor to initialize the route.
        this.getBlockByHeight();
        this.requestOwnership();
        this.submit();
        this.getBlockByHash();
        this.getEmployee();
        this.getValidateChain();
        this.Verification();
    }

    // Enpoint to Get a Block by Height (GET Endpoint)
    getBlockByHeight() {
        this.app.get("/block/height/:height", async (req, res) => {
            if(req.params.height) {
                const height = parseInt(req.params.height);
                let block = await this.blockchain.getBlockByHeight(height);
                if(block){
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send("Block Not Found!");
                }
            } else {
                return res.status(404).send("Block Not Found! Review the Parameters!");
            }
            
        });
    }

    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    requestOwnership() {  // generates a message by inputting an address
        this.app.post("/requestValidation", async (req, res) => {
            if(req.body.employer_pk) {
                const employer_pk = req.body.employer_pk;
                const message = await this.blockchain.requestMessageOwnershipVerification(employer_pk);
                if(message){
                    return res.status(200).json(message);
                } else {
                    return res.status(500).send("An error happened!");
                }
            } else {
                return res.status(404).send("Check the Body Parameter!");
            }
        });
    }

    // Endpoint that allows user to request the verificaiton of a signature given (GET Endpoint)
    Verification() { // validates a message by inputting an address, message and signature
            this.app.get("/check", async (req, res) => {
            if(req.body.employer_pk && req.body.message && req.body.signature) {
                        const employer_pk = req.body.employer_pk;
                        const signature = req.body.signature;
                        const message = req.body.message;
                        try{
                            let verify = await this.blockchain.verifysignature(employer_pk, message, signature);
                            if(verify) {
                                return res.status(200).send("good");
                            }else {
                                res.status(500).send("an error happened");
                            }
                        }catch (error) {
                            return res.status(500).send(error);
                        }
            }else {
                return res.status(500).send("Check the Body Parameter!");
            }
        });
    }   


    // Endpoint that allow Submit a Star, yu need first to `requestOwnership` to have the message (POST endpoint)
    submit() { // may need to eventually change this to fit project more
        this.app.post("/submit", async (req, res) => {
            if(req.body.employer_pk && req.body.message && req.body.signature && req.body.employee_pk && req.body.rui) {
                const employer_pk = req.body.employer_pk;
                const message = req.body.message;
                const signature = req.body.signature;
                const employee_pk = req.body.employee_pk;
                const rui = req.body.rui;
                try {
                    let block = await this.blockchain.submitScore(employer_pk, message, signature, employee_pk, rui);
                    if(block){
                        return res.status(200).json(block);
                    } else {
                        return res.status(500).send("An error happened!");
                    }
                } catch (error) {
                    return res.status(500).send(error);
                }
            } else {
                return res.status(500).send("Check the Body Parameter!");
            }
        });
    }

    // This endpoint allows you to retrieve the block by hash (GET endpoint)
    getBlockByHash() {
        this.app.get("/block/hash/:hash", async (req, res) => {
            if(req.params.hash) {
                const hash = req.params.hash;
                let block = await this.blockchain.getBlockByHash(hash);
                if(block){
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send("Block Not Found!");
                }
            } else {
                return res.status(404).send("Block Not Found! Review the Parameters!");
            }
            
        });
    }

    // This endpoint allows you to request the list of Scores registered by an owner
    getEmployee() {
        this.app.get("/blocks/:employee_pk", async (req, res) => {
            if(req.params.employee_pk) {
                const employee_pk = req.params.employee_pk;
                try {
                    let scores = await this.blockchain.getStarsByWalletAddress(employee_pk);
                    if(scores){
                        return res.status(200).json(stars);
                    } else {
                        return res.status(404).send("Block Not Found!");
                    }
                } catch (error) {
                    return res.status(500).send("An error happened!");
                }
            } else {
                return res.status(500).send("Block Not Found! Review the Parameters!");
            }
            
        });
    }

    // This endpoint allows you to request the list of Scores registered by an owner
    getValidateChain() {
        this.app.get("/validateChain", async (req, res) => {
                try {
                    let errorLog = await this.blockchain.validateChain();
                    if(errorLog.length == 0){
                        return res.status(200).send("All good.");
                    } else {
                        return res.status(404).json(errorLog);
                    }
                } catch (error) {
                    return res.status(500).send("An error happened!");
                }
            
        });
    }

}

module.exports = (app, blockchainObj) => { return new BlockchainController(app, blockchainObj);}