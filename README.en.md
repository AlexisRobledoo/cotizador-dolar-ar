# 💵 Argentine Dollar Rate Tracker

🌎 **English** | [Español](README.md)

Python script that fetches real-time exchange rates for the US dollar in Argentina (official, blue/parallel, MEP, CCL, crypto, card, and wholesale rates), keeps a historical log, and sends automatic Telegram alerts when any rate crosses a defined threshold.

![Python](https://img.shields.io/badge/Python-3.14-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔄 Fetches up-to-date exchange rates using the [DolarAPI](https://dolarapi.com)
- 📊 Logs a historical record to `historico.csv` (date, rate type, buy, sell)
- 🚨 Sends Telegram alerts when any rate crosses a configurable threshold, set individually per rate type
- ⏰ Runs automatically every hour via Windows Task Scheduler
- 🤖 Interactive Telegram bot that responds to natural-language questions about specific rates

## 📸 Example output

Oficial: compra $1485 - venta $1535
Blue: compra $1535 - venta $1555
Bolsa: compra $1530.4 - venta $1536.6
...

✅ Cotizaciones guardadas en historico.csv
🚨 Alerta enviada: Blue superó $1650


## 🛠️ Built with

- Python 3.14
- [Requests](https://docs.python-requests.org/) — for HTTP requests
- [DolarAPI](https://dolarapi.com) — exchange rate data source
- [python-telegram-bot](https://python-telegram-bot.org/) — for the interactive bot
- Telegram Bot API — for the alert system
- `csv` and `datetime` modules — for the historical log

## 🚀 Getting started

**1. Clone the repository**
```bash
git clone https://github.com/AlexisRobledoo/cotizador-dolar-ar.git
cd cotizador-dolar-ar
```

**2. Install dependencies**
```bash
pip install requests python-telegram-bot
```

**3. Set up your Telegram credentials**

Create a `config.py` file in the project root (this file is excluded from the repo, see `.gitignore`):
```python
TELEGRAM_TOKEN = "your_botfather_token"
TELEGRAM_CHAT_ID = "your_chat_id"
```

**4. Run the scripts**
```bash
python cotizador.py          # one-shot: fetch, log, and alert if needed
python bot_interactivo.py    # interactive bot, runs continuously
```

## ⚙️ Customization

Adjust alert thresholds by editing the `UMBRALES` dictionary in `cotizador.py`:

```python
UMBRALES = {
    "Blue": 1650,
    "Oficial": 1600,
    # add or remove the rate types you want to track
}
```

## 📌 Roadmap

- [x] Interactive bot that responds to questions in real time
- [ ] Historical evolution charts
- [ ] Simple web interface

## 👤 Author

Alexis Robledo — Programming student at Universidad del Gran Rosario (UGR)
[LinkedIn](https://linkedin.com/in/alexis-daniel-robledo)

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.