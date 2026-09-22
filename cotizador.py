import requests
import csv
from datetime import datetime
from config import TELEGRAM_TOKEN, TELEGRAM_CHAT_ID

# Acá definís el valor que querés vigilar del dólar blue
UMBRAL_BLUE = 1600 # cambiá este número al que quieras

def enviar_alerta_telegram(mensaje):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    resultado = requests.get(url, params={"chat_id": TELEGRAM_CHAT_ID, "text": mensaje})
    print(resultado.json())  # <-- esta línea nueva nos muestra qué contestó Telegram
respuesta = requests.get("https://dolarapi.com/v1/dolares")
cotizaciones = respuesta.json()

for dolar in cotizaciones:
    print(f"{dolar['nombre']}: compra ${dolar['compra']} - venta ${dolar['venta']}")

fecha_hora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

with open("historico.csv", "a", newline="", encoding="utf-8") as archivo:
    escritor = csv.writer(archivo)
    for dolar in cotizaciones:
        escritor.writerow([fecha_hora, dolar['nombre'], dolar['compra'], dolar['venta']])

print("\n✅ Cotizaciones guardadas en historico.csv")

# Buscamos el dólar blue específicamente y chequeamos el umbral
for dolar in cotizaciones:
    if dolar['nombre'] == 'Blue' and dolar['venta'] > UMBRAL_BLUE:
        enviar_alerta_telegram(f"🚨 Alerta: el dólar blue superó ${UMBRAL_BLUE}. Valor actual: ${dolar['venta']}")
        print(f"📲 Alerta enviada por Telegram (blue: ${dolar['venta']})") 
        