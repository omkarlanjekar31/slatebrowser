import { ipcMain, WebContents, WebFrameMain } from "electron";
import { ipcMainHandle, validateEventFrame } from "../util.js";
import WalletAppDatabase from "../db/wallet.db.js";
import {
  decryptSeed,
  encryptSeed,
  validateSeed,
  verifyPassword,
} from "../db/wallet.helper.js";

export default function setUpIPCHandlersWalletDBAPI(db: WalletAppDatabase) {
  // Unlock wallet
  ipcMain.handle("wallet_unlock", async (_, password) => {
    const wallet: any = await db.getWallet();
    if (!wallet) throw new Error("Wallet not found");

    // Verify password first
    await verifyPassword(wallet.passwordHash, password);
    const decryptSeedBody: IDecryptSeedParamsType = {
      encryptedSeed: wallet.encryptedSeed,
      password,
      saltHex: wallet.salt,
      ivHex: wallet.iv,
      authTagHex: wallet.authTag,
    };
    // Decrypt seed only if password is correct
    const seed = await decryptSeed(
      decryptSeedBody
    );

    // Temporarily store seed in memory (main process only)
    globalThis.walletUnlockedSeed = seed;

    return true; // Renderer gets only success/failure
  });

  // Import seed
  ipcMain.handle("wallet_import-seed", async (_, seed, password) => {
    const validatedSeed = validateSeed(seed);
    const encrypted = await encryptSeed(validatedSeed, password);

    const res = db.createWallet(encrypted);

    // wipe sensitive memory
    seed = "";
    return true;
  });
}
