import crypto from "crypto";
import bcrypt from "bcryptjs";
import * as bip39 from "bip39";

export interface IWalletType {
  encryptedSeed: string;
  salt: string;
  iv: string;
  authTag: string;
  passwordHash: string;
}

/**
 * Encrypt a seed phrase using AES-256-GCM with a key derived from password
 */
export async function encryptSeed(seed: string, password: string): Promise<IWalletType> {
  // 1️⃣ Generate random salt for key derivation
  const salt = crypto.randomBytes(16);

  // 2️⃣ Derive key using bcrypt hash (truncated to 32 bytes for AES-256)
  // bcrypt outputs 60 chars, we take a SHA256 hash of it for a 32-byte key
  const bcryptHash = bcrypt.hashSync(password, 10);
  const key = crypto.createHash('sha256').update(bcryptHash).digest(); // 32 bytes

  // 3️⃣ Generate random IV for AES-GCM
  const iv = crypto.randomBytes(12);

  // 4️⃣ Encrypt the seed
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encryptedBuffer = Buffer.concat([cipher.update(seed, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 5️⃣ Hash password for authentication (bcrypt)
  const passwordHash = bcrypt.hashSync(password, 10);

  return {
    encryptedSeed: encryptedBuffer.toString('hex'),
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    passwordHash
  };
}
export async function decryptSeed(
  decryptSeedParams:IDecryptSeedParamsType
): Promise<string> {

  // 1️⃣ Derive key (same as encryption)
  const bcryptHash = bcrypt.hashSync(decryptSeedParams.password, 10);
  const key = crypto.createHash('sha256').update(bcryptHash).digest(); // 32 bytes

  // 2️⃣ Decrypt AES-256-GCM
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(decryptSeedParams.ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(decryptSeedParams.authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(decryptSeedParams.encryptedSeed, 'hex')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}


export function verifyPassword(storedHash: string, password: string): void {
  const isValid = bcrypt.compareSync(password, storedHash);
  if (!isValid) {
    throw new Error("Invalid password");
  }
}
export function validateSeed(seed: string) {
  const normalized = seed.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!bip39.validateMnemonic(normalized)) {
    throw new Error("Invalid seed phrase");
  }
  return normalized;
}
