// src/Voting.js
import { ethers } from 'ethers';
import VotingABI from './VotingABI.json'; // Save your ABI as VotingABI.json in the src folder

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const API_URL = process.env.REACT_APP_API_URL;

export default class Voting {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(API_URL);
    const privateKey = process.env.REACT_APP_PRIVATE_KEY;
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI, this.wallet);
  }

  async getCandidates() {
    try {
      const candidates = await this.contract.getAllVotesOfCandiates();
      return candidates;
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  }

  async vote(candidateIndex) {
    try {
      const tx = await this.contract.vote(candidateIndex);
      await tx.wait();
      console.log("Voted successfully");
    } catch (error) {
      console.error("Error voting:", error);
    }
  }

  async getVotingStatus() {
    try {
      return await this.contract.getVotingStatus();
    } catch (error) {
      console.error("Error fetching voting status:", error);
    }
  }

  async getRemainingTime() {
    try {
      return await this.contract.getRemainingTime();
    } catch (error) {
      console.error("Error fetching remaining time:", error);
    }
  }
}
