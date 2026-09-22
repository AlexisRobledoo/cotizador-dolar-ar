import requests
import csv
from datetime import datetime

respuesta = requests.get("https://dolarapi.com/v1/dolares")
cotizaciones = respuesta.json()

# Mostramos las cotizaciones en pantalla, como antes
for dolar in cotizaciones:
    print(f"{dolar['nombre']}: compra ${dolar['compra']} - venta ${dolar['venta']}")

# Guardamos un registro en el archivo historico.csv
fecha_hora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

with open("historico.csv", "a", newline="", encoding="utf-8") as archivo:
    escritor = csv.writer(archivo)
    for dolar in cotizaciones:
        escritor.writerow([fecha_hora, dolar['nombre'], dolar['compra'], dolar['venta']])

print("\n✅ Cotizaciones guardadas en historico.csv") 