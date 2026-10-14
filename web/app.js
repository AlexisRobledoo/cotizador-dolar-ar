// =========================================================
// Dashboard Dólar AR
// Lee historico.csv (generado por cotizador.py) y dibuja los gráficos.
// =========================================================

// 1) CONFIGURACIÓN -------------------------------------------------------

// Cada tipo de dólar: cómo se llama en el CSV, cómo lo mostramos y su color.
// El color es SIEMPRE el mismo para cada dólar (no cambia al filtrar).
const DOLARES = [
  { csv: "Blue", nombre: "Blue", color: "--s-blue" },
  { csv: "Oficial", nombre: "Oficial", color: "--s-oficial" },
  { csv: "Bolsa", nombre: "MEP", color: "--s-bolsa" },
  { csv: "Contado con liquidación", nombre: "CCL", color: "--s-ccl" },
  { csv: "Mayorista", nombre: "Mayorista", color: "--s-mayorista" },
  { csv: "Cripto", nombre: "Cripto", color: "--s-cripto" },
  { csv: "Tarjeta", nombre: "Tarjeta", color: "--s-tarjeta" },
];

// Los que se ven al abrir la página en el gráfico principal
const visibles = new Set(["Blue", "Oficial", "Bolsa"]);

let datos = [];      // todas las filas del CSV
let diasFiltro = 0;  // 0 = todo el historial
const graficos = {}; // acá guardamos los gráficos para poder actualizarlos

// Formatos de números y fechas en español de Argentina
const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const pesosDec = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
const fechaCorta = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" });
const fechaLarga = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

// Lee una variable de color del CSS (cambia entre modo claro y oscuro)
const css = (nombre) => getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();

// 2) CARGAR Y LEER EL CSV ------------------------------------------------

async function cargarDatos() {
  // "?v=..." evita que el navegador use una copia vieja guardada
  const respuesta = await fetch("historico.csv?v=" + Date.now());
  if (!respuesta.ok) throw new Error("No se pudo leer historico.csv");
  const texto = await respuesta.text();

  // Cada línea: fecha,tipo,compra,venta
  return texto
    .trim()
    .split(/\r?\n/)
    .map((linea) => {
      const [fecha, tipo, compra, venta] = linea.split(",");
      return {
        t: new Date(fecha.replace(" ", "T")).getTime(), // fecha en milisegundos
        tipo,
        compra: Number(compra),
        venta: Number(venta),
      };
    })
    .filter((fila) => !Number.isNaN(fila.t) && !Number.isNaN(fila.venta))
    .sort((a, b) => a.t - b.t);
}

// Devuelve solo las filas dentro del período elegido
function filtrar() {
  if (diasFiltro === 0) return datos;
  const ultimo = datos[datos.length - 1].t;
  const desde = ultimo - diasFiltro * 24 * 60 * 60 * 1000;
  return datos.filter((fila) => fila.t >= desde);
}

// Filas de un tipo de dólar
const serie = (filas, tipo) => filas.filter((fila) => fila.tipo === tipo);

// 3) TARJETAS (KPIs) -----------------------------------------------------

function dibujarKpis(filas) {
  const contenedor = document.getElementById("kpis");
  contenedor.replaceChildren();

  for (const d of DOLARES) {
    const s = serie(filas, d.csv);
    if (s.length === 0) continue;
    const primero = s[0].venta;
    const ultimo = s[s.length - 1].venta;
    const variacion = ((ultimo - primero) / primero) * 100;

    const tarjeta = document.createElement("article");
    tarjeta.className = "kpi";
    tarjeta.style.setProperty("--c", `var(${d.color})`);

    const nombre = document.createElement("p");
    nombre.className = "kpi__name";
    nombre.textContent = d.nombre;

    const valor = document.createElement("p");
    valor.className = "kpi__value";
    valor.textContent = pesos.format(ultimo);

    const delta = document.createElement("p");
    const clase = variacion > 0.05 ? "sube" : variacion < -0.05 ? "baja" : "igual";
    const flecha = clase === "sube" ? "▲" : clase === "baja" ? "▼" : "●";
    delta.className = "kpi__delta " + clase;
    delta.textContent = `${flecha} ${variacion > 0 ? "+" : ""}${variacion.toFixed(1)}%`;
    delta.title = "Variación en el período elegido";

    tarjeta.append(nombre, valor, delta);
    contenedor.append(tarjeta);
  }
}

// 4) BOTONES PARA ELEGIR DÓLARES -----------------------------------------

function dibujarChips() {
  const contenedor = document.getElementById("chips");
  contenedor.replaceChildren();
  for (const d of DOLARES) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "chip";
    boton.textContent = d.nombre;
    boton.style.setProperty("--c", `var(${d.color})`);
    boton.setAttribute("aria-pressed", visibles.has(d.csv));
    boton.addEventListener("click", () => {
      if (visibles.has(d.csv)) {
        if (visibles.size === 1) return; // siempre dejamos al menos uno
        visibles.delete(d.csv);
      } else {
        visibles.add(d.csv);
      }
      boton.setAttribute("aria-pressed", visibles.has(d.csv));
      actualizar();
    });
    contenedor.append(boton);
  }
}

// 5) GRÁFICOS ------------------------------------------------------------

// Plugin chiquito: dibuja una línea vertical donde está el mouse
const lineaVertical = {
  id: "lineaVertical",
  afterDatasetsDraw(chart) {
    const activo = chart.tooltip?.getActiveElements?.();
    if (!activo || activo.length === 0) return;
    const x = activo[0].element.x;
    const { top, bottom } = chart.chartArea;
    const ctx = chart.ctx;
    ctx.save();
    ctx.strokeStyle = css("--axis");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  },
};

// Opciones comunes para los gráficos de línea
function opcionesLinea(formatoY, filas) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false }, // usamos los botones de arriba como leyenda
      tooltip: {
        backgroundColor: css("--surface"),
        titleColor: css("--ink-2"),
        bodyColor: css("--ink"),
        borderColor: css("--axis"),
        borderWidth: 1,
        padding: 10,
        boxWidth: 14,
        boxHeight: 3,
        callbacks: {
          title: (items) => fechaLarga.format(items[0].parsed.x),
          label: (item) => ` ${formatoY(item.parsed.y)}  ${item.dataset.label}`,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        // el eje X arranca y termina justo donde hay datos
        min: filas[0]?.t,
        max: filas[filas.length - 1]?.t,
        grid: { display: false },
        border: { color: css("--axis") },
        ticks: { color: css("--muted"), maxTicksLimit: 7, callback: (v) => fechaCorta.format(v) },
      },
      y: {
        grid: { color: css("--grid") },
        border: { display: false },
        ticks: { color: css("--muted"), callback: formatoY },
      },
    },
  };
}

function dibujarEvolucion(filas) {
  const datasets = DOLARES.filter((d) => visibles.has(d.csv)).map((d) => ({
    label: d.nombre,
    data: serie(filas, d.csv).map((f) => ({ x: f.t, y: f.venta })),
    borderColor: css(d.color),
    backgroundColor: css(d.color),
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBorderWidth: 2,
    pointHoverBorderColor: css("--surface"),
    tension: 0.2,
  }));

  graficos.evolucion?.destroy();
  graficos.evolucion = new Chart(document.getElementById("graficoEvolucion"), {
    type: "line",
    data: { datasets },
    options: opcionesLinea((v) => pesos.format(v), filas),
    plugins: [lineaVertical],
  });
}

function dibujarBrecha(filas) {
  const blue = serie(filas, "Blue");
  const oficial = new Map(serie(filas, "Oficial").map((f) => [f.t, f.venta]));

  // Brecha = (blue / oficial - 1) * 100, para cada medición
  const puntos = blue
    .filter((f) => oficial.has(f.t))
    .map((f) => ({ x: f.t, y: (f.venta / oficial.get(f.t) - 1) * 100 }));

  const actual = puntos.length ? puntos[puntos.length - 1].y : 0;
  document.getElementById("brechaActual").textContent = `${actual.toFixed(1)}%`;

  const color = css("--accent");
  graficos.brecha?.destroy();
  graficos.brecha = new Chart(document.getElementById("graficoBrecha"), {
    type: "line",
    data: {
      datasets: [{
        label: "Brecha",
        data: puntos,
        borderColor: color,
        backgroundColor: color + "22",
        fill: true,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.2,
      }],
    },
    options: opcionesLinea((v) => `${Number(v).toFixed(1)}%`, filas),
    plugins: [lineaVertical],
  });
}

function dibujarRanking(filas) {
  // Último valor de cada dólar, ordenado de más caro a más barato
  const ultimos = DOLARES
    .map((d) => {
      const s = serie(filas, d.csv);
      return s.length ? { nombre: d.nombre, venta: s[s.length - 1].venta } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.venta - a.venta);

  const color = css("--accent");
  graficos.ranking?.destroy();
  graficos.ranking = new Chart(document.getElementById("graficoRanking"), {
    type: "bar",
    data: {
      labels: ultimos.map((u) => u.nombre),
      datasets: [{
        label: "Venta",
        data: ultimos.map((u) => u.venta),
        backgroundColor: color,
        hoverBackgroundColor: color + "cc",
        borderRadius: 4,
        borderSkipped: "start",
        barThickness: 18,
      }],
    },
    options: {
      indexAxis: "y", // barras horizontales
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: css("--surface"),
          titleColor: css("--ink-2"),
          bodyColor: css("--ink"),
          borderColor: css("--axis"),
          borderWidth: 1,
          displayColors: false,
          callbacks: { label: (item) => pesos.format(item.parsed.x) },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: css("--grid") },
          border: { display: false },
          ticks: { color: css("--muted"), maxTicksLimit: 5, callback: (v) => pesos.format(v) },
        },
        y: {
          grid: { display: false },
          border: { color: css("--axis") },
          ticks: { color: css("--ink-2") },
        },
      },
    },
  });
}

// 6) TABLA ---------------------------------------------------------------

function dibujarTabla(filas) {
  const cuerpo = document.getElementById("tabla");
  cuerpo.replaceChildren();
  for (const d of DOLARES) {
    const s = serie(filas, d.csv);
    if (!s.length) continue;
    const ventas = s.map((f) => f.venta);
    const ultimo = s[s.length - 1];
    const variacion = ((ultimo.venta - s[0].venta) / s[0].venta) * 100;
    const celdas = [
      d.nombre,
      pesosDec.format(ultimo.compra),
      pesosDec.format(ultimo.venta),
      pesosDec.format(Math.min(...ventas)),
      pesosDec.format(Math.max(...ventas)),
      `${variacion > 0 ? "+" : ""}${variacion.toFixed(1)}%`,
    ];
    const fila = document.createElement("tr");
    for (const texto of celdas) {
      const td = document.createElement("td");
      td.textContent = texto;
      fila.append(td);
    }
    cuerpo.append(fila);
  }
}

// 7) ACTUALIZAR TODO -----------------------------------------------------

function actualizar() {
  const filas = filtrar();
  dibujarKpis(filas);
  dibujarEvolucion(filas);
  dibujarBrecha(filas);
  dibujarRanking(filas);
  dibujarTabla(filas);
}

// Botones de período (7 días / 14 días / Todo)
document.querySelectorAll("#periodos button").forEach((boton) => {
  boton.addEventListener("click", () => {
    document.querySelectorAll("#periodos button").forEach((b) => b.classList.remove("activo"));
    boton.classList.add("activo");
    diasFiltro = Number(boton.dataset.dias);
    actualizar();
  });
});

// Botón de modo claro / oscuro
document.getElementById("tema").addEventListener("click", () => {
  const raiz = document.documentElement;
  const oscuroAhora = getComputedStyle(raiz).colorScheme === "dark";
  raiz.dataset.theme = oscuroAhora ? "light" : "dark";
  try { localStorage.setItem("tema", raiz.dataset.theme); } catch (e) { /* sin problema */ }
  actualizar(); // redibuja con los colores nuevos
});

try {
  const guardado = localStorage.getItem("tema");
  if (guardado) document.documentElement.dataset.theme = guardado;
} catch (e) { /* sin problema */ }

// Si cambia el tema del sistema, redibujamos
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", actualizar);

// 8) ARRANQUE ------------------------------------------------------------

cargarDatos()
  .then((filas) => {
    datos = filas;
    const primera = fechaLarga.format(datos[0].t);
    const ultima = fechaLarga.format(datos[datos.length - 1].t);
    const mediciones = new Set(datos.map((f) => f.t)).size;
    document.getElementById("subtitulo").textContent =
      `${mediciones} mediciones desde el ${primera} · última actualización: ${ultima}`;
    dibujarChips();
    actualizar();
  })
  .catch((error) => {
    document.getElementById("subtitulo").textContent =
      "No se pudieron cargar los datos. Si lo abrís en tu compu, usá Live Server.";
    console.error(error);
  });
