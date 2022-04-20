# PrivateBlockchain

### **BlockChainCode has all the source code for this repo** 

#### Run Locally
- app.js is the main file to run the project locally
    - Refer to: [BlockChainCode README.md](./BlockChainCode/README.md)


#### Run As Docker Container
- There is a Dockerfile which if there is docker desktop installed on your computer then you can create a docker container by:
  - first build a docker image: `docker build -t image_name .`
      - replace image_name with whatever name you would like
  - Second run this command `docker run -dp host_portname: container_portname image_name`
      - `-d` command stands for detached and is so container runs in the background
      - `-p` command stands for publish that exposes the container_port to the host_port
  - If Further assistance is needed please refer to: [Docker Documentation](https://docs.docker.com/get-started/)

#### Run in AWS
- Refer to [OtRL-Reputation-Index/otrl-referral](https://github.com/OtRL-Reputation-Index/otrl-referral)
