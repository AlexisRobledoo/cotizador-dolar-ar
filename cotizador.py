import requests
import csv
from datetime import datetime
from config import TELEGRAM_TOKEN, TELEGRAM_CHAT_ID

# Un umbral distinto para cada tipo de dólar que querés vigilar
UMBRALES = {
    "Oficial": 1600,
    "Blue": 1600,
    "Bolsa": 1600,
    "Contado con liquidación": 1600,
    "Mayorista": 1550,
    "Cripto": 1600,
    "Tarjeta": 2000,
}

def enviar_alerta_telegram(mensaje):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    resultado = requests.get(url, params={"chat_id": TELEGRAM_CHAT_ID, "text": mensaje})
    print(resultado.json())

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

# Revisamos cada dólar contra su umbral correspondiente
for dolar in cotizaciones:
    nombre = dolar['nombre']
    if nombre in UMBRALES and dolar['venta'] > UMBRALES[nombre]:
        enviar_alerta_telegram(f"🚨 {nombre} superó ${UMBRALES[nombre]}. Valor actual: ${dolar['venta']}")
        print(f"📲 Alerta enviada: {nombre} (${dolar['venta']})")