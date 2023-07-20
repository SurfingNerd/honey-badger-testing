# honey-badger-testing

A collection of scripts to test the Honey Badger BFT integration in Parity

the term `localnet` refers to a local testnet.
the term `remotenet` refers to a testnet that is accessable via SSH,
and requires ssh config entries in the sheme `hbbft1, hbbft2, ....hbbft999`,
as well corrisponding files in the testnet nodes directory

# Performance Test Scripts

The test scripts are implemented using node.js v10, install and run as usual:

```
npm ci
```

There are following tests available:
- latency1 (1 Transaction all 1-10 Seconds)
- latency2 (1 Transaction all 1-10 Seconds, background baseload 10tx/second)
- throughput1 (~ 70 transactions a second)
- throughput2 (~ 7 * 70 transactions a second, distributed on multiple nodes in the network.)

The Tests are further described in detail here:
https://github.com/artis-eco/wiki/wiki/Honey-Badger-BFT-Hypothesis-Testing

It is possible to run all tests using the `npm run runAllTests` command.


The Tests are configured in the ./config directory.

Starting from a new Testchain requires to feed those testaccounts first: `npm run feedAccounts`


## Test Results

The tests write Testresults into the output directory.
This directory is not mapped by the Git repository.
Testresults, that require to be analysed need to get 
manually transfered to the jupyter/data directory.

## Test Result Analysis

Jupyter Notebooks are used to analyse the testresults.
please refere to the jupyter/README.md

# Testnet Setup Scripts

This repository contains scripts to automatically generate config files to set up a hbbft test network of arbitrary size.

# SSH Setup

The remote-net-system works on the system of named ssh nodes.
Therefore every setup is supported that can be supported by the ssh system.
you can either have a Network infrastructure on localhost, localhost within a (para) VM,
remote VM's, real hardware...

The system expects to have the nodes numerated in the sense of
- hbbft1
- hbbft2
- ...


## Introduction

We are using Docker to quickly spin up and down a test network of any size.

One desired property of the setup is the ability to replace individual Docker nodes with locally running nodes for the purpose of interactive debugging.

We achieve this property by mapping the nodes' port to the Docker bridge address, and let all nodes communicate through this bridge address. Locally running nodes can bind to that interface as well, allowing for a mix of Docker and local nodes.

## Usage

Requirements:
* The following repositories cloned at the same directory level as this repository
  * diamond-node (git@github.com:dmdcoin/diamond-node.git)
  * diamond-contracts-core (git@github.com:dmdcoin/diamond-contracts-core.git)
* Python >=v3.6
* Docker

To generate the configs for n nodes cd into this repository and execute:
```
cd pumba
./setup_testnet.py n
```
Where "n" has to be replaced by a number >=1 denoting the number of validator node configs to generate.

The script also supports generating configs for nat/extip setups. Simply add the external ip address as argument to the script.
```
./setup_testnet.py n ext_ip
```
Where "ext_ip" has to replaced by the external IP address to use.

## Folder Structure

To be compatible with both local and Docker nodes we have to use an appropriate directory structure.

For the sake of simplicity we choose a single directory containing all configs and data to be mounted into a Docker volume.

Caveat: Filesystem performance inside of a Docker volume may be significantly slower than inside the container. We may re-consider the approach of sharing the "data" folder through a Docker volume for that reason.


## Block Number Tracking

Requires to manually find the first block in the CSV.
We could fix this by memorizing the block number befor we start.
For example by writing it into a file.



# Managing Network




## building diamond node fresh

removing existing installation, and getting new one as defined in the repository
```
npm run remotenet-git-delete-node
npm run remotenet-git-setup-build-from-source

```

Building the Node Software
```
npm run remotenet-git-pull-node-and-build
```

or if a lot of nodes have to be build, do it async

```
npm run remotenet-binary-update-from-git-async
```


# tipps for managing nodes.


## example stop a node and build latest from git
```
export NODE_TARGET= -s hbbft10 
npm run remotenet-stop $NODE_TARGET && npm run remotenet-git-pull-and-build $NODE_TARGET         
```