import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from config import TELEGRAM_TOKEN

# Mapeamos distintas formas de escribir cada dólar a su nombre real en la API
ALIAS_DOLARES = {
    "oficial": "Oficial",
    "blue": "Blue",
    "bolsa": "Bolsa",
    "mep": "Bolsa",
    "ccl": "Contado con liquidación",
    "contado con liqui": "Contado con liquidación",
    "mayorista": "Mayorista",
    "cripto": "Cripto",
    "tarjeta": "Tarjeta",
}

def obtener_cotizaciones():
    respuesta = requests.get("https://dolarapi.com/v1/dolares")
    return respuesta.json()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "¡Hola! Soy tu bot del dólar. Escribí /cotizacion para ver todos los valores."
    )

async def cotizacion(update: Update, context: ContextTypes.DEFAULT_TYPE):
    cotizaciones = obtener_cotizaciones()
    mensaje = "💵 Cotizaciones actuales:\n\n"
    for dolar in cotizaciones:
        mensaje += f"{dolar['nombre']}: compra ${dolar['compra']} - venta ${dolar['venta']}\n"
    await update.message.reply_text(mensaje)

async def responder_mensaje(update: Update, context: ContextTypes.DEFAULT_TYPE):
    texto = update.message.text.lower().strip()

    # Buscamos si el mensaje menciona algún tipo de dólar conocido
    dolar_pedido = None
    for alias, nombre_real in ALIAS_DOLARES.items():
        if alias in texto:
            dolar_pedido = nombre_real
            break

    if dolar_pedido:
        cotizaciones = obtener_cotizaciones()
        for dolar in cotizaciones:
            if dolar['nombre'] == dolar_pedido:
                await update.message.reply_text(
                    f"💵 {dolar['nombre']}: compra ${dolar['compra']} - venta ${dolar['venta']}"
                )
                return
    else:
        await update.message.reply_text(
            "¿Querés saber la cotización de un dólar específico? Indicame cuál "
            "(oficial, blue, bolsa/mep, ccl, mayorista, cripto o tarjeta)."
        )

app = Application.builder().token(TELEGRAM_TOKEN).build()

app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("cotizacion", cotizacion))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, responder_mensaje))

print("🤖 Bot escuchando... (Ctrl+C para detener)")
app.run_polling()