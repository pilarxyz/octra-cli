import crypto from "crypto";
import fs from "fs";
import path from "path";
import bip39 from "bip39";
import nacl from "tweetnacl";
import readline from "readline";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const base58Encode = (buffer) => {
  let num = BigInt("0x" + buffer.toString("hex"));
  let encoded = "";
  while (num > 0n) {
    const rem = num % 58n;
    num = num / 58n;
    encoded = BASE58_ALPHABET[Number(rem)] + encoded;
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    encoded = "1" + encoded;
  }
  return encoded;
};

const createAddress = (publicKey) => {
  const hash = crypto.createHash("sha256").update(publicKey).digest();
  return "oct" + base58Encode(hash);
};

const ask = (q) =>
  new Promise((res) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(q, (a) => {
      rl.close();
      res(a);
    });
  });

const generateWallet = async () => {
  const entropy = crypto.randomBytes(16);
  const mnemonic = bip39.entropyToMnemonic(entropy.toString("hex"));
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hmac = crypto.createHmac("sha512", "Octra seed").update(seed).digest();
  const privateKey = hmac.slice(0, 32);
  const keypair = nacl.sign.keyPair.fromSeed(privateKey);

  const addr = createAddress(Buffer.from(keypair.publicKey));

  const wallet = {
    mnemonic,
    private_key_b64: Buffer.from(privateKey).toString("base64"),
    public_key_b64: Buffer.from(keypair.publicKey).toString("base64"),
    address: addr,
  };

  console.log("\nGenerated Wallet:");
  console.log("==============================");
  console.log(`Address        : ${wallet.address}`);
  console.log(`Mnemonic       : ${wallet.mnemonic}`);
  console.log(`Private Key B64: ${wallet.private_key_b64}`);
  console.log(`Public Key B64 : ${wallet.public_key_b64}`);

  const save = await ask("\nSave to file? (y/N): ");
  if (save.toLowerCase() === "y") {
    const dir = path.join(__dirname, "wallets");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = path.join(dir, `wallet-${wallet.address.slice(-6)}.json`);
    fs.writeFileSync(file, JSON.stringify(wallet, null, 2));
    console.log(`Saved to ${file}`);
  }
};

await generateWallet();
