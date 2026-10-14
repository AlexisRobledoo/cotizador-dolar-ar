import csv
import os
from datetime import datetime, timedelta, timezone

import requests

# Credenciales de Telegram:
# - En GitHub Actions vienen de los "Secrets" del repo (variables de entorno).
# - En tu compu, si no hay variables de entorno, se leen de config.py (que no se sube).
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
if not TELEGRAM_TOKEN:
    try:
        from config import TELEGRAM_TOKEN, TELEGRAM_CHAT_ID
    except ImportError:
        print("⚠️ Sin credenciales de Telegram: se guardan los datos pero no se envían alertas.")

# Hora de Argentina (UTC-3). Los servidores de GitHub usan otra zona horaria.
HORA_ARGENTINA = timezone(timedelta(hours=-3))

# Un umbral distinto para cada tipo de dólar que querés vigilar
UMBRALES = {
    "Oficial": 1600,
    "Blue": 1600,
    "Bolsa": 1600,
    "Contado con liquidación": 2000,
    "Mayorista": 1800,
    "Cripto": 2000,
    "Tarjeta": 3000,
}

def enviar_alerta_telegram(mensaje):
    if not TELEGRAM_TOKEN:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    resultado = requests.get(url, params={"chat_id": TELEGRAM_CHAT_ID, "text": mensaje})
    print("Telegram:", "ok" if resultado.ok else resultado.status_code)

respuesta = requests.get("https://dolarapi.com/v1/dolares", timeout=30)
respuesta.raise_for_status()  # si la API falla, cortamos acá y no guardamos datos vacíos
cotizaciones = respuesta.json()

for dolar in cotizaciones:
    print(f"{dolar['nombre']}: compra ${dolar['compra']} - venta ${dolar['venta']}")

fecha_hora = datetime.now(HORA_ARGENTINA).strftime("%Y-%m-%d %H:%M:%S")

with open("historico.csv", "a", newline="", encoding="utf-8") as archivo:
    escritor = csv.writer(archivo)
    for dolar in cotizaciones:
        escritor.writerow([fecha_hora, dolar['nombre'], dolar['compra'], dolar['venta']])

print("\n✅ Cotizaciones guardadas en historico.csv")

# Revisamos cada dólar contra su umbral correspondiente
for dolar in cotizaciones:
    nombre = dolar['nombre']
    if nombre in UMBRALES and dolar['venta'] > UMBRALES[nombre]:
        enviar_alerta_telegram(f"🚨 {nombre} superó ${UMBRALES[nombre]}. Valor actual: ${dolar['venta']}")
        print(f"📲 Alerta enviada: {nombre} (${dolar['venta']})")