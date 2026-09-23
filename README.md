# 💵 Cotizador Dólar AR

Script en Python que consulta en tiempo real las cotizaciones del dólar en Argentina (oficial, blue, MEP, CCL, cripto, tarjeta y mayorista), guarda un histórico, y envía alertas automáticas por Telegram cuando algún valor supera un umbral definido.

## ✨ Funcionalidades

- 🔄 Consulta cotizaciones actualizadas usando la [API de DolarAPI](https://dolarapi.com)
- 📊 Guarda un registro histórico en `historico.csv` (fecha, tipo de dólar, compra, venta)
- 🚨 Envía alertas por Telegram cuando algún dólar supera un umbral configurable
- ⏰ Se ejecuta automáticamente cada hora mediante el Programador de tareas de Windows

## 🛠️ Tecnologías

- Python 3.14
- [Requests](https://docs.python-requests.org/) — para las consultas HTTP
- [DolarAPI](https://dolarapi.com) — fuente de datos de cotizaciones
- Telegram Bot API — para el sistema de alertas

## 🚀 Cómo usarlo

1. Cloná el repositorio: git clone https://github.com/AlexisRobledoo/cotizador-dolar-ar.git
2. Instalá las dependencias: pip install requests
3. Creá un archivo `config.py` en la raíz del proyecto con tus credenciales de Telegram:
```python
   TELEGRAM_TOKEN = "tu_token_de_botfather"
   TELEGRAM_CHAT_ID = "tu_chat_id"
```
4. Ejecutá el script: python cotizador.py

## 📌 Próximas mejoras

- [ ] Bot interactivo que responda preguntas en tiempo real
- [ ] Gráficos de la evolución histórica
- [ ] Interfaz web simple

## 👤 Autor

Alexis Robledo — Estudiante de Tecnicatura en Programación (UGR)  
[LinkedIn](https://linkedin.com/in/alexis-daniel-robledo)

## 📄 Licencia

Este proyecto está bajo la licencia MIT — ver el archivo [LICENSE](LICENSE) para más detalles.
