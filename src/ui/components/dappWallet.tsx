import React, { useState } from 'react';
import { Send, X, Minimize2, Terminal, Shield, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { ethers, Contract } from "ethers";
import stakingAbi from "./ABI/stakingAbi.json"
import stakeTokenAbi from "./ABI/stakeTokenAbi.json";

const DappWallet = ({ isOpen }:any) => {
    if (!isOpen) return null;

    const connectWallet = async () => {
        try {
            let [signer, provider, stakingContract, stakeTokenContract, chainId] = [null, null, null, null, null];
            if (window.ethereum === null) {
                throw new Error("Metamsk is not installed");
            }
            // const provider1 = new ethers.BrowserProvider(window.ethereum);
            // console.log("provider1 +> ", provider1)
            // // This triggers the MetaMask popup
            // const accounts = await provider1.send("eth_requestAccounts", []);

            // console.log("accounts nayawala+> ", accounts);

            // const accounts = window.ethereum.request({
            //     method: 'eth_requestAccounts'
            // })


            // console.log("accounts +> ", accounts);


            // let chainIdHex = await window.ethereum.request({
            //     method: 'eth_chainId'
            // })
            // chainId = parseInt(chainIdHex, 16)

            // let selectedAccount = accounts[0];
            // if (!selectedAccount) {
            //     throw new Error("No ethereum accounts available")
            // }

            // provider = new ethers.BrowserProvider(window.ethereum);
            // signer = await provider.getSigner();

            // const stakingContractAddress = "0xfB528B5905C8f9398fb625Ab4155C567A75cCC9F"
            // const stakeTokenContractAddress = "0x5263fdc29e84891ded4e0fb8be4084398d9a6e84"

            // stakingContract = new Contract(stakingContractAddress, stakingAbi, signer);
            // stakeTokenContract = new Contract(stakeTokenContractAddress, stakeTokenAbi, signer);

            // return { provider, selectedAccount, stakeTokenContract, stakingContract, chainId }

        } catch (error) {
            console.error(error);
            throw error
        }

    }
    return (
        <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            className="w-[380px] h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-40"
        >
            <h2>Dapp Wallet</h2>
            <button onClick={connectWallet}>Connect Wallet</button>
        </motion.div>
    );
};

export default DappWallet;
