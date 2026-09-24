import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from config import TELEGRAM_TOKEN

# Esta función se ejecuta cuando alguien escribe /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "¡Hola! Soy tu bot del dólar. Escribí /cotizacion para ver los valores actuales."
    )

# Esta función se ejecuta cuando alguien escribe /cotizacion
async def cotizacion(update: Update, context: ContextTypes.DEFAULT_TYPE):
    respuesta = requests.get("https://dolarapi.com/v1/dolares")
    cotizaciones = respuesta.json()

    mensaje = "💵 Cotizaciones actuales:\n\n"
    for dolar in cotizaciones:
        mensaje += f"{dolar['nombre']}: compra ${dolar['compra']} - venta ${dolar['venta']}\n"

    await update.message.reply_text(mensaje)

# Armamos la aplicación del bot
app = Application.builder().token(TELEGRAM_TOKEN).build()

# Le decimos qué función usar para cada comando
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("cotizacion", cotizacion))

print("🤖 Bot escuchando... (Ctrl+C para detener)")
app.run_polling()
