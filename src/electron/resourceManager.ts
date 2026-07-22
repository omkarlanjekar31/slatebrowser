import { BrowserWindow } from "electron";
import { ipcWebContentsSend } from "./util.js";

const POLLING_INTERVAL = 1000;
let cpuUsageCount = 4;
let ramUsageCount = 56;
let storageDataUsageCount = 435;

export function pollResources(mainWindow: BrowserWindow) {
  setInterval(async () => {
    const cpuUsage = cpuUsageCount++;
    const ramUsage = ramUsageCount++;
    const storageDataUsage = storageDataUsageCount++;

    ipcWebContentsSend("statistics", mainWindow.webContents, {
      cpuUsage,
      ramUsage,
      storageDataUsage,
    });
  }, POLLING_INTERVAL);
}

export function getStaticData() {
  return {
    model: "Acer 5",
    ssdMemory: "500GB",
    totalMemory: "8GB DDR4 memory",
  };
}
