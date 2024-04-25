import { createContext, useEffect, useState, uuseState } from "react";
import { ethers, Contract } from "ethers";

import ABI from "../utils/abi.json";
import { contractAddress } from "../utils/constants";

export const TransactionContext = createContext();

const { ethereum } = window;

const getEthereumContract = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const transactionContract = new Contract(contractAddress, ABI, signer);
  console.log(transactionContract);
  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const getAllTRansaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const transactionContract = await getEthereumContract();
      const availableTRansactions =
        await transactionContract.getAllTransaction();
      const structuredTransactions = availableTRansactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            ethers.toNumber(transaction.timestamo) * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(ethers.toQuantity(transaction.amount)) / 10 ** 18,
        })
      );
      console.log(structuredTransactions);
      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object available");
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTRansaction();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object available");
    }
  };

  const checkIfTransactionExists = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const transactionContract = await getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();
      window.localStorage.setItem(
        "transactionCount",
        transactionCount.toString()
      );
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object available");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object available");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      //get the data from the form

      const { addressTo, amount, keyword, message } = formData;

      c;
      let parsedAmount = ethers.parseEther(amount);
      parsedAmount = ethers.toQuantity(parsedAmount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", //21000 gwei
            value: parsedAmount,
          },
        ],
      });
      // 0xc8f775Ee55f00C23595A99B9ABBC4Ae51A2D7573
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log(`Loading - ${transactionHash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash}`);

      const transactionCount = await transactionContract.getTransactionCount();
      console.log(transactionCount.toString());
      // setTransactionCount(transactionCount.toNumber());
      window.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object available");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionExists();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        sendTransaction,
        handleChange,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
