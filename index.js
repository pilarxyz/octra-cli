import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import nacl from "tweetnacl";

const MU = 1_000_000;
const FIX_OCT = 0.01;
const FIX_RAW = String(Math.floor(FIX_OCT * MU));

//--------------------------------------------------------------------
// Wallet load
//--------------------------------------------------------------------
const loadWallet = () => {
  const home = process.env.HOME || process.env.USERPROFILE || ".";
  const file = fs.existsSync(`${home}/.octra/wallet.json`)
    ? `${home}/.octra/wallet.json`
    : "./wallet.json";
  if (!fs.existsSync(file)) throw new Error("wallet.json not found");
  const { priv, addr, rpc } = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (!priv || !addr) throw new Error("wallet.json invalid");
  return { priv, addr, rpc: rpc || "https://octra.network" };
};

//--------------------------------------------------------------------
// Helpers
//--------------------------------------------------------------------
const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  const txt = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : {};
};

const getStatus = async (addr, rpc, quiet = false) => {
  const sp = quiet ? null : ora("Fetching balance").start();
  try {
    const j = await fetchJson(`${rpc}/balance/${addr}`);
    if (sp) sp.succeed();
    return { bal: +j.balance, nonce: +j.nonce };
  } catch (e) {
    if (sp) sp.fail("error");
    console.error(e.message);
    return null;
  }
};

const canon = (obj) =>
  JSON.stringify({
    from: obj.from,
    to_: obj.to_,
    amount: obj.amount,
    nonce: obj.nonce,
    ou: obj.ou,
    timestamp: obj.timestamp,
  });

const signTx = (payload, privB64) => {
  const seed = Buffer.from(privB64, "base64").subarray(0, 32);
  const kp = nacl.sign.keyPair.fromSeed(seed);
  const sig = nacl.sign.detached(Buffer.from(canon(payload)), kp.secretKey);
  return {
    ...payload,
    signature: Buffer.from(sig).toString("base64"),
    public_key: Buffer.from(kp.publicKey).toString("base64"),
  };
};

const sendTx = async (tx, rpc) => {
  const sp = ora("Sending 0.01 OCT...").start();
  try {
    const res = await fetchJson(`${rpc}/send-tx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
    if (res.status === "accepted") {
      sp.succeed(`TX accepted: ${res.tx_hash}`);
      await new Promise((r) => setTimeout(r, 1000)); // allow nonce update
    } else {
      sp.fail("rejected");
      console.log(res);
    }
  } catch (e) {
    sp.fail("error");
    console.error(e.message);
  }
};

//--------------------------------------------------------------------
// CLI
//--------------------------------------------------------------------
const main = async () => {
  const { priv, addr, rpc } = loadWallet();

  while (true) {
    const { act } = await inquirer.prompt({
      type: "list",
      name: "act",
      message: "Command",
      choices: ["Balance", "Send 0.01 OCT", "Exit"],
    });
    if (act === "Exit") break;

    if (act === "Balance") {
      const s = await getStatus(addr, rpc);
      if (s) {
        console.log(`Balance: ${s.bal} OCT`);
        console.log(`Nonce  : ${s.nonce}`);
      }
    }

    if (act === "Send 0.01 OCT") {
      const st = await getStatus(addr, rpc, true);
      if (!st) continue;
      if (st.bal < FIX_OCT) {
        console.log(chalk.red("Insufficient balance"));
        continue;
      }
      const confirmed = (
        await inquirer.prompt({
          name: "y",
          message: `Send ${FIX_OCT} OCT to which address?`,
          type: "input",
        })
      ).y.trim();
      if (!confirmed) continue;

      const latest = await getStatus(addr, rpc, true);
      if (!latest) continue;

      const txCore = {
        from: addr,
        to_: confirmed,
        amount: FIX_RAW,
        nonce: latest.nonce + 1,
        ou: "1",
        timestamp: Math.floor(Date.now() / 1000) + Math.random() * 0.01,
      };
      const signed = signTx(txCore, priv);
      await sendTx(signed, rpc);
    }
  }
};

main();
