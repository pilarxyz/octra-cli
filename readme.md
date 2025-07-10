# 🪙 Octra Wallet CLI

A simple CLI tool for generating and managing Octra blockchain wallets. Create wallets with mnemonic phrases, check balances, and send 0.01 OCT transactions directly from the terminal.

---

## 📦 Features

- Generate new wallets with mnemonic seed phrases
- Save wallet data securely as `.json` files
- Check wallet balance and nonce via RPC
- Send fixed 0.01 OCT transactions
- Interactive terminal menu

---

## 📁 Project Structure

```

.
├── generate.js            # Wallet generator
├── index.js               # CLI wallet interface
├── wallet.json.example    # Sample wallet file
├── wallets/               # Folder for generated wallets

````

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/pilarxyz/octra-cli.git
cd octra-cli
````

### 2. Install dependencies

```bash
npm install
```

---

## 🔐 Setup Wallet File

Before using the CLI, you need to set up a wallet file.

### Step 1: Copy the example

```bash
cp wallet.json.example wallet.json
```

### Step 2: Fill in the details

Open `wallet.json` and update the values:

```json
{
  "priv": "your-private-key-in-base64",
  "addr": "your-wallet-address",
  "rpc": "https://octra.network"
}
```

You can get these values by running the wallet generator:

```bash
node generate.js
```

Then copy the generated private key and address into `wallet.json`.

### Step 3 (Optional): Move wallet file to home directory

To make the CLI detect the wallet globally:

```bash
mkdir -p ~/.octra
mv wallet.json ~/.octra/wallet.json
```

The CLI will look for the wallet in `~/.octra/wallet.json` first, and fall back to `./wallet.json`.

---

## 🧪 How to Use

### Generate a Wallet

```bash
node generate.js
```

This prints wallet information and optionally saves it to the `wallets/` folder.

### Start the CLI

```bash
node index.js
```

You’ll see an interactive menu with options:

* **Balance**: Check current balance and nonce
* **Send 0.01 OCT**: Enter recipient address to send a fixed amount
* **Exit**: Quit the CLI

---

## 📡 RPC Endpoint

By default, the CLI uses the following RPC:

```
https://octra.network
```

You can change this in your `wallet.json` file under the `rpc` field.

---

## 🛡️ Security

* Private keys are stored locally in Base64 format.
* Never share your `wallet.json` or mnemonic with anyone.
* Do **not** commit real wallet files to GitHub.
* Consider encrypting or storing them in secure locations.

---

## 📄 License

MIT – free to use, modify, and distribute. No warranties included.
