import { createSlice } from "@reduxjs/toolkit";
import {
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Settings,
  FileCode,
  CheckCircle,
} from "lucide-react";
const initialState = {
  isSetUp: false, // Whether a wallet has been created/imported
  isLoggedIn: false, // Whether the wallet is unlocked
  seedPhrase: "",
  password: "",
  accounts: [
    {
      name: "Personal Account",
      address: "0x8494...9e1",
      balance: "27.11",
      network: "base",
    },
    {
      name: "Work Account",
      address: "0x1234...abc",
      balance: "1.25",
      network: "ethereum",
    },
    {
      name: "Account for Trading",
      address: "0x5678...def",
      balance: "0.5",
      network: "ethereum",
    },
  ],
  currentAccountIndex: 0,
  selectedNetwork: "polygon", // Default network from UI
  currentView: "dashboard", // dashboard, settings, revealPhrase
  networks: [
    { id: "ethereum", name: "Ethereum", color: "#627EEA" },
    { id: "base", name: "Base Mainnet", color: "#0000ff" },
    { id: "polygon", name: "Polygon", color: "#8247E5" },
    { id: "arbitrum", name: "Arbitrum", color: "#28A0F0" },
  ],
  // transactions: [
  //     { id: 1, type: 'Contract Deployment', date: '28 Dec', amount: '0.000314', unit: 'ETH' }
  // ],
  transactions: [
    {
      id: 1,
      type: "Send Transaction",
      date: "28 Dec",
      amount: "7.99",
      unit: "USDC",
      icon: "ArrowUpRight",
      address: "0xa12b...9f3",
      txHash: "0xabc123...ef01",
    },

    {
      id: 2,
      type: "Receive Transaction",
      date: "27 Dec",
      amount: "320.50",
      unit: "USDC",
      icon: "ArrowDownLeft",
      address: "0x91fa...221",
      txHash: "0xdef456...aa92",
    },
 {
      id: 3,
      type: "Send Transaction",
      date: "26 Dec",
      amount: "75.00",
      unit: "USDC",
      icon: "ArrowUpRight",
      address: "0x44aa...772",
      txHash: "0x1122aa...bb33",
    },
    {
      id: 4,
      type: "Contract Deployment",
      date: "27 Dec",
      amount: "-",
      unit: "-",
      icon: "FileCode",
      address: "0xc0n7...b45",
      txHash: "0x789abc...ff10",
    },

   

    {
      id: 5,
      type: "Receive Transaction",
      date: "26 Dec",
      amount: "5000.00",
      unit: "USDC",
      icon: "ArrowDownLeft",
      address: "0xfed1...090",
      txHash: "0x9988cc...7711",
    },

    {
      id: 6,
      type: "Token Approval",
      date: "25 Dec",
      amount: "10000.00",
      unit: "USDC",
      icon: "CheckCircle",
      address: "0x5swap...001",
      txHash: "0xaa77dd...9900",
    },

    {
      id: 7,
      type: "Send Transaction",
      date: "24 Dec",
      amount: "2430.75",
      unit: "USDC",
      icon: "ArrowUpRight",
      address: "0x777b...abc",
      txHash: "0x4455ee...c002",
    },
  ],
  customNetworks: [], // Optional: track custom networks separately if needed, but for now we add to networks
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setupWallet: (state, action) => {
      state.seedPhrase = action.payload.seedPhrase;
      state.password = action.payload.password;
      state.isSetUp = true;
      state.isLoggedIn = true;
    },
    lockWallet: (state) => {
      state.isLoggedIn = false;
    },
    unlockWallet: (state, action) => {
      if (action.payload === state.password) {
        state.isLoggedIn = true;
      }
    },
    logoutWallet: (state) => {
      state.isLoggedIn = false;
      // In a real app, we might clear sensitive data or keep it encrypted
    },
    switchAccount: (state, action) => {
      state.currentAccountIndex = action.payload;
      state.currentView = "dashboard";
    },
    switchNetwork: (state, action) => {
      state.selectedNetwork = action.payload;
    },
    setView: (state, action) => {
      state.currentView = action.payload;
    },
    addAccount: (state, action) => {
      state.accounts.push({
        name: action.payload.name || `Account ${state.accounts.length + 1}`,
        address: "0x" + Math.random().toString(16).slice(2, 10) + "...",
        balance: "0.000",
        network: state.selectedNetwork,
      });
    },
    renameAccount: (state, action) => {
      const { index, newName } = action.payload;
      if (state.accounts[index]) {
        state.accounts[index].name = newName;
      }
    },
    addNetwork: (state, action) => {
      const { name, rpcUrl, chainId, symbol, explorerUrl } = action.payload;
      const newNetwork = {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        rpcUrl,
        chainId,
        symbol,
        explorerUrl,
        color:
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0"), // Random color
        isCustom: true,
      };
      state.networks.push(newNetwork);
      state.selectedNetwork = newNetwork.id; // Switch to the new network
    },
  },
});

export const {
  setupWallet,
  lockWallet,
  unlockWallet,
  logoutWallet,
  switchAccount,
  switchNetwork,
  setView,
  addAccount,
  renameAccount,
  addNetwork,
} = walletSlice.actions;

export default walletSlice.reducer;
