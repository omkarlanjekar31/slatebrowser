
// global.d.ts
export {}; // ensures this is treated as a module

declare global {
  var walletUnlockedSeed: string | undefined;
}
