# 💵 Cotizador Dólar AR
🌎 [English](README.en.md) | **Español**

Script en Python que consulta en tiempo real las cotizaciones del dólar en Argentina (oficial, blue, MEP, CCL, cripto, tarjeta y mayorista), guarda un histórico, y envía alertas automáticas por Telegram cuando algún valor supera un umbral definido.

![Python](https://img.shields.io/badge/Python-3.14-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Funcionalidades

- 🔄 Consulta cotizaciones actualizadas usando la [API de DolarAPI](https://dolarapi.com)
- 📊 Guarda un registro histórico en `historico.csv` (fecha, tipo de dólar, compra, venta)
- 🚨 Envía alertas por Telegram cuando algún dólar supera un umbral configurable, definido individualmente para cada tipo
- ⏰ Se ejecuta automáticamente cada hora mediante el Programador de tareas de Windows

## 📸 Ejemplo de uso

Oficial: compra $1485 - venta $1535
Blue: compra $1535 - venta $1555
Bolsa: compra $1530.4 - venta $1536.6
...

✅ Cotizaciones guardadas en historico.csv
🚨 Alerta enviada: Blue superó $1650


## 📈 Dashboard

🔗 **Ver online:** https://alexisrobledoo.github.io/cotizador-dolar-ar/

Página web que lee `historico.csv` y muestra:

- Valor actual de cada dólar y su variación en el período
- Gráfico interactivo de la evolución (elegís qué dólares comparar)
- Brecha cambiaria entre el blue y el oficial
- Ranking de cuál está más caro hoy
- Tabla con compra, venta, mínimo y máximo
- Filtros de 7 días, 14 días o todo el historial, y modo oscuro

Hecho con HTML, CSS, JavaScript y [Chart.js](https://www.chartjs.org/). Para verlo en tu compu, abrí `index.html` con la extensión Live Server de VS Code.

## 🛠️ Tecnologías

- Python 3.14
- [Requests](https://docs.python-requests.org/) — para las consultas HTTP
- [DolarAPI](https://dolarapi.com) — fuente de datos de cotizaciones
- Telegram Bot API — para el sistema de alertas
- Módulo `csv` y `datetime` — para el registro histórico

## 🚀 Cómo usarlo

**1. Cloná el repositorio**
```bash
git clone https://github.com/AlexisRobledoo/cotizador-dolar-ar.git
cd cotizador-dolar-ar
```

**2. Instalá las dependencias**
```bash
pip install requests
```

**3. Configurá tus credenciales de Telegram**

Creá un archivo `config.py` en la raíz del proyecto (este archivo no se sube al repo, ver `.gitignore`):
```python
TELEGRAM_TOKEN = "tu_token_de_botfather"
TELEGRAM_CHAT_ID = "tu_chat_id"
```

**4. Ejecutá el script**
```bash
python cotizador.py
```

## ⚙️ Personalización

Podés ajustar los umbrales de alerta editando el diccionario `UMBRALES` en `cotizador.py`:

```python
UMBRALES = {
    "Blue": 1650,
    "Oficial": 1600,
    # agregá o quitá los tipos de dólar que te interesen
}
```

## 📌 Próximas mejoras

- [x] Bot interactivo que responda preguntas en tiempo real
- [x] Gráficos de la evolución histórica
- [x] Interfaz web simple (dashboard)

## 👤 Autor

Alexis Robledo — Estudiante de Tecnicatura en Programación (UGR)
[LinkedIn](https://linkedin.com/in/alexis-daniel-robledo)

## 📄 Licencia

Este proyecto está bajo la licencia MIT — ver el archivo [LICENSE](LICENSE) para más detalles.