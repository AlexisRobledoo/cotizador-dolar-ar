import requests

respuesta = requests.get("https://dolarapi.com/v1/dolares")
cotizaciones = respuesta.json()

for dolar in cotizaciones:
    print(f"{dolar['nombre']}: compra ${dolar['compra']} - venta ${dolar['venta']}")