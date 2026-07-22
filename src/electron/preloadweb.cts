const electron = require("electron");

interface IWalletRequestParams {
  method: string;
  params?: any[];
}


electron.contextBridge.exposeInMainWorld("ethereum", {
  chainId: () => "",
  isMetaMask: () => false,
  selectedAddress: () => "",
  isSlate: () => false,
  on: (event: string, callback: (...args: any[]) => void) => {
    listeners.set(event, callback);
  },
  removeListener: (event: string) => {
    listeners.delete(event);
  },
  request:async (args:{ method: string; params?: any[] }) => {
   switch (args.method) {
      // === CONNECT / ACCOUNTS
      case "eth_requestAccounts":
        return ""
    }
  },
} satisfies Window["ethereum"]);

// --------------------------------------------------
// === PROVIDER STATE + EVENTS
// --------------------------------------------------

const listeners = new Map<string, (...args: any[]) => void>();

function emit(event: string, ...args: any[]) {
  const cb = listeners.get(event);
  if (cb) cb(...args);
}
