// Import necessary modules
import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { ethers } from "ethers";
import VotingABI from "./VotingABI.json"; // Replace with actual path to your ABI file

// Global styles for resetting and basic theming
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background-color: #f4f7f6;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
`;

const AppContainer = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
  padding: 20px;
  text-align: center;
`;

const Title = styled.h1`
  color: #4a90e2;
  margin-bottom: 10px;
`;

const InfoText = styled.p`
  font-size: 0.9em;
  margin: 8px 0;
  color: #666;
`;

const CandidatesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;

const CandidateItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
`;

const VoteButton = styled.button`
  background-color: #4a90e2;
  border: none;
  border-radius: 5px;
  color: white;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #357ab8;
  }
`;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votingStatus, setVotingStatus] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [account, setAccount] = useState(null);

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  // Initialize the contract and set up a Metamask connection
  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        try {
          const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await providerInstance.send("eth_requestAccounts", []);
          const signerInstance = providerInstance.getSigner();

          setProvider(providerInstance);
          setSigner(signerInstance);
          setAccount(accounts[0]);

          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, VotingABI, signerInstance);
          setContract(contractInstance);

          await fetchCandidates(contractInstance);
          await fetchVotingStatus(contractInstance);
          await fetchRemainingTime(contractInstance);
        } catch (error) {
          console.error("Error initializing contract:", error);
        }
      } else {
        console.error("Please install Metamask!");
      }
    };

    initializeContract();
  }, []);

  const fetchCandidates = async (contractInstance) => {
    try {
      const candidatesData = await contractInstance.getAllVotesOfCandiates();
      const formattedCandidates = candidatesData.map((candidate) => ({
        name: candidate.name,
        voteCount: candidate.voteCount.toNumber(),
      }));
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const fetchVotingStatus = async (contractInstance) => {
    try {
      const status = await contractInstance.getVotingStatus();
      setVotingStatus(status);
    } catch (error) {
      console.error("Error fetching voting status:", error);
    }
  };

  const fetchRemainingTime = async (contractInstance) => {
    try {
      const time = await contractInstance.getRemainingTime();
      setRemainingTime(time.toNumber());
    } catch (error) {
      console.error("Error fetching remaining time:", error);
    }
  };

  const handleVote = async (candidateIndex) => {
    if (!contract) return;

    try {
      const tx = await contract.vote(candidateIndex);
      await tx.wait();
      console.log("Vote successful!");
      await fetchCandidates(contract);
    } catch (error) {
      console.error("Error while voting:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        setAccount(accounts[0] || null);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Title> Smart Contract Voting App</Title>
        <InfoText>Account: {account || "Not connected"}</InfoText>
        <InfoText>Voting Status: {votingStatus ? "Active" : "Ended"}</InfoText>
        <InfoText>Time Remaining: {remainingTime} seconds</InfoText>

        <h2>Candidates</h2>
        <CandidatesList>
          {candidates.map((candidate, index) => (
            <CandidateItem key={index}>
              <span>{candidate.name}</span>
              <span>Votes: {candidate.voteCount}</span>
              <VoteButton onClick={() => handleVote(index)}>Vote</VoteButton>
            </CandidateItem>
          ))}
        </CandidatesList>
      </AppContainer>
    </>
  );
}

export default App;
