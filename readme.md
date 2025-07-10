# 🪙 Octra Wallet CLI

A lightweight CLI tool for generating and managing **Octra blockchain wallets**, checking balances, and sending basic transactions.

## 📦 Features

- Generate new wallets with mnemonic phrases
- Save wallet data securely to a local JSON file
- View wallet balance and nonce
- Send fixed 0.01 OCT transfers via RPC
- Simple interactive CLI with menu prompts

---

## 📁 Project Structure

```bash
.
├── generate.js   # Wallet generator script
├── index.js      # CLI interface for balance & send
├── wallets/      # Folder where generated wallets are saved
````

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/octra-wallet-cli.git
cd octra-wallet-cli
```

### 2. Install dependencies

```bash
npm install
```

Dependencies used:

* `bip39` – mnemonic generation
* `tweetnacl` – cryptographic signing
* `inquirer` – CLI prompts
* `ora` – loading spinners
* `chalk` – colored output

### 3. Generate a wallet

```bash
node generate.js
```

This will print the wallet info and optionally save it to `wallets/wallet-XXXXXX.json`.

### 4. Use the CLI

Make sure you have a wallet JSON file saved as:

* `~/.octra/wallet.json` (preferred), or
* `./wallet.json` (fallback)

Then run:

```bash
node index.js
```

Use the menu to:

* View wallet balance and nonce
* Send 0.01 OCT to another address

---

## 🔐 Security

* Private keys are stored in Base64 format within JSON files.
* Ensure you handle your mnemonic and private key **confidentially**.
* Avoid committing any wallet files to GitHub!

---

## 📡 RPC

The CLI uses the following Octra RPC endpoint by default:

```
https://octra.network
```

You can change this in your `wallet.json` under the `rpc` field.

---

## 🛠 Example `wallet.json`

```json
{
  "priv": "base64-private-key",
  "addr": "oct...",
  "rpc": "https://octra.network"
}
```

---

## ✅ License

MIT – use freely, no guarantees. Contributions welcome!