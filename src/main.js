import './style.css';
import { simularEDO } from './edo.js';
import { renderGraficoPoblacion, renderGraficoError } from './chart.js';
import {
  initDB,
  guardarSimulacion,
  listarSimulaciones,
  obtenerSimulacionPorId,
  eliminarSimulacion,
  vaciarHistorial
} from './db.js';
import { exportarCSV, imprimirReporte } from './export.js';

// Estado global de la aplicación
let simActual = null;
let tabActiva = 'poblacion'; // 'poblacion' | 'error'

// Elementos DOM
const form = document.getElementById('edoForm');
const rangeY0 = document.getElementById('rangeY0');
const inputY0 = document.getElementById('inputY0');
const valY0 = document.getElementById('valY0');

const rangeA = document.getElementById('rangeA');
const inputA = document.getElementById('inputA');
const valA = document.getElementById('valA');

const rangeB = document.getElementById('rangeB');
const inputB = document.getElementById('inputB');
const valB = document.getElementById('valB');

const rangeC = document.getElementById('rangeC');
const inputC = document.getElementById('inputC');
const valC = document.getElementById('valC');

const rangeT = document.getElementById('rangeT');
const inputT = document.getElementById('inputT');
const valT = document.getElementById('valT');

const selectH = document.getElementById('selectH');
const valH = document.getElementById('valH');

// KPIs
const kpiPobFinal = document.getElementById('kpiPobFinal');
const kpiEquilibrio = document.getElementById('kpiEquilibrio');
const kpiTiempoCruce = document.getElementById('kpiTiempoCruce');
const kpiEstadoCruce = document.getElementById('kpiEstadoCruce');
const kpiErrorHeun = document.getElementById('kpiErrorHeun');
const kpiRmseHeun = document.getElementById('kpiRmseHeun');
const kpiErrorRK4 = document.getElementById('kpiErrorRK4');
const kpiRmseRK4 = document.getElementById('kpiRmseRK4');

// Canvas y Gráficos
const chartCanvas = document.getElementById('chartCanvas');
const tabPoblacion = document.getElementById('tabPoblacion');
const tabError = document.getElementById('tabError');
const errorScaleToggle = document.getElementById('errorScaleToggle');
const checkEscalaLog = document.getElementById('checkEscalaLog');

// Tabla
const tablaBody = document.getElementById('tablaBody');
const tableTotalSteps = document.getElementById('tableTotalSteps');

// PGlite e Historial
const pgliteStatusBadge = document.getElementById('pgliteStatusBadge');
const pgliteStatusText = document.getElementById('pgliteStatusText');
const historialList = document.getElementById('historialList');
const btnGuardar = document.getElementById('btnGuardar');
const btnVaciarHistorial = document.getElementById('btnVaciarHistorial');

// Exportación
const btnExportarCSV = document.getElementById('btnExportarCSV');
const btnImprimir = document.getElementById('btnImprimir');

// Presets
const presetBase = document.getElementById('presetBase');
const presetSaturacion = document.getElementById('presetSaturacion');
const presetAdopcion = document.getElementById('presetAdopcion');
const presetPasoFino = document.getElementById('presetPasoFino');

// Toast
const appToast = document.getElementById('appToast');
const toastIcon = document.getElementById('toastIcon');
const toastMsg = document.getElementById('toastMsg');

/**
 * Muestra notificación toast temporal
 */
function showToast(mensaje, icon = 'ℹ️') {
  toastIcon.textContent = icon;
  toastMsg.textContent = mensaje;
  appToast.classList.add('show');
  setTimeout(() => {
    appToast.classList.remove('show');
  }, 3200);
}

/**
 * Sincroniza slider y campo numérico
 */
function bindRangeAndInput(range, input, display, callback) {
  const sync = (val) => {
    range.value = val;
    input.value = val;
    if (display) display.textContent = val;
    if (callback) callback();
  };

  range.addEventListener('input', (e) => sync(e.target.value));
  input.addEventListener('input', (e) => sync(e.target.value));
}

/**
 * Obtiene parámetros actuales del formulario
 */
function obtenerParametros() {
  return {
    y0: parseFloat(inputY0.value),
    a: parseFloat(inputA.value),
    b: parseFloat(inputB.value),
    C: parseFloat(inputC.value),
    T: parseFloat(inputT.value),
    h: parseFloat(selectH.value)
  };
}

/**
 * Establece valores en los controles del formulario
 */
function aplicarParametros({ y0, a, b, C, T, h }) {
  inputY0.value = y0;
  rangeY0.value = y0;
  valY0.textContent = y0;

  inputA.value = a;
  rangeA.value = a;
  valA.textContent = a;

  inputB.value = b;
  rangeB.value = b;
  valB.textContent = b;

  inputC.value = C;
  rangeC.value = C;
  valC.textContent = C;

  inputT.value = T;
  rangeT.value = T;
  valT.textContent = T;

  selectH.value = h.toString();
  valH.textContent = h;
}

/**
 * Actualiza la vista gráfica según la pestaña activa
 */
function actualizarGrafica() {
  if (!simActual) return;

  if (tabActiva === 'poblacion') {
    errorScaleToggle.style.display = 'none';
    renderGraficoPoblacion(chartCanvas, simActual);
  } else {
    errorScaleToggle.style.display = 'flex';
    renderGraficoError(chartCanvas, simActual, checkEscalaLog.checked);
  }
}

/**
 * Actualiza la tabla paso a paso
 */
function actualizarTabla(pasos) {
  tableTotalSteps.textContent = `${pasos.length} pasos calculados`;
  tablaBody.innerHTML = '';

  const fragment = document.createDocumentFragment();
  pasos.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.paso}</td>
      <td><strong>${p.t}</strong></td>
      <td class="col-exact">${p.analitica.toFixed(4)}</td>
      <td class="col-heun">${p.heun.toFixed(4)}</td>
      <td class="col-err">${p.errorHeun.toExponential(3)}</td>
      <td class="col-rk4">${p.rk4.toFixed(4)}</td>
      <td class="col-err">${p.errorRK4.toExponential(3)}</td>
    `;
    fragment.appendChild(tr);
  });
  tablaBody.appendChild(fragment);
}

/**
 * Actualiza tarjetas de KPIs
 */
function actualizarKPIs(sim) {
  const { poblacionFinalAnalitica, equilibrio, tCruce, parametros, errorMaxHeun, rmseHeun, errorMaxRK4, rmseRK4 } = sim;

  kpiPobFinal.textContent = `${poblacionFinalAnalitica.toFixed(2)} mascotas`;
  kpiEquilibrio.textContent = `Equilibrio a/b: ${equilibrio !== Infinity ? equilibrio.toFixed(1) : '∞'} mascotas`;

  if (tCruce !== null && tCruce <= parametros.T) {
    kpiTiempoCruce.textContent = `t = ${tCruce.toFixed(2)} meses`;
    kpiEstadoCruce.innerHTML = `<span style="color: #ef4444; font-weight: 600;">⚠️ Capacidad (${parametros.C}) superada</span>`;
  } else if (tCruce !== null) {
    kpiTiempoCruce.textContent = `t = ${tCruce.toFixed(2)} meses`;
    kpiEstadoCruce.innerHTML = `<span style="color: #10b981;">Seguro en T=${parametros.T} (supera en t>${tCruce.toFixed(1)})</span>`;
  } else {
    kpiTiempoCruce.textContent = 'No cruza';
    kpiEstadoCruce.innerHTML = `<span style="color: #10b981;">✅ Por debajo del límite</span>`;
  }

  kpiErrorHeun.textContent = errorMaxHeun.toExponential(3);
  kpiRmseHeun.textContent = `RMSE: ${rmseHeun.toExponential(3)}`;

  kpiErrorRK4.textContent = errorMaxRK4.toExponential(3);
  kpiRmseRK4.textContent = `RMSE: ${rmseRK4.toExponential(3)}`;
}

/**
 * Ejecuta simulación y refresca toda la interfaz
 */
function ejecutarSimulacion() {
  const params = obtenerParametros();
  simActual = simularEDO(params);

  actualizarKPIs(simActual);
  actualizarGrafica();
  actualizarTabla(simActual.pasos);
}

/**
 * Recarga y renderiza el historial de PGlite
 */
async function refrescarHistorial() {
  try {
    const list = await listarSimulaciones();
    if (list.length === 0) {
      historialList.innerHTML = `
        <div style="font-size: 0.825rem; color: var(--text-dim); padding: 0.75rem 0; text-align: center;">
          No hay simulaciones guardadas aún. Haz clic en "Guardar en PGlite" para persistir el escenario actual.
        </div>
      `;
      return;
    }

    historialList.innerHTML = '';
    list.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'history-item';
      const fechaStr = new Date(item.fecha).toLocaleString();

      el.innerHTML = `
        <div>
          <div class="history-meta-title">${item.nombre}</div>
          <div class="history-meta-sub">
            y₀=${item.y0}, a=${item.a}, b=${item.b}, C=${item.c}, h=${item.h} | Err RK4: ${Number(item.error_max_rk4).toExponential(2)}
          </div>
          <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.15rem;">${fechaStr}</div>
        </div>
        <div class="history-actions">
          <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" data-action="cargar" data-id="${item.id}">
            📂 Cargar
          </button>
          <button class="btn-danger-sm" data-action="eliminar" data-id="${item.id}">
            🗑️
          </button>
        </div>
      `;
      historialList.appendChild(el);
    });
  } catch (err) {
    console.error('Error al consultar historial PGlite:', err);
    historialList.innerHTML = `<div style="color: #ef4444; font-size: 0.8rem;">Error al cargar historial: ${err.message}</div>`;
  }
}

/**
 * Inicialización de la aplicación
 */
async function bootstrap() {
  // 1. Conectar inputs sincronizados
  bindRangeAndInput(rangeY0, inputY0, valY0, ejecutarSimulacion);
  bindRangeAndInput(rangeA, inputA, valA, ejecutarSimulacion);
  bindRangeAndInput(rangeB, inputB, valB, ejecutarSimulacion);
  bindRangeAndInput(rangeC, inputC, valC, ejecutarSimulacion);
  bindRangeAndInput(rangeT, inputT, valT, ejecutarSimulacion);

  selectH.addEventListener('change', (e) => {
    valH.textContent = e.target.value;
    ejecutarSimulacion();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ejecutarSimulacion();
    showToast('Simulación ejecutada con éxito', '⚡');
  });

  // 2. Configurar pestañas de gráfico
  tabPoblacion.addEventListener('click', () => {
    tabActiva = 'poblacion';
    tabPoblacion.classList.add('active');
    tabError.classList.remove('active');
    actualizarGrafica();
  });

  tabError.addEventListener('click', () => {
    tabActiva = 'error';
    tabError.classList.add('active');
    tabPoblacion.classList.remove('active');
    actualizarGrafica();
  });

  checkEscalaLog.addEventListener('change', () => {
    if (tabActiva === 'error') {
      actualizarGrafica();
    }
  });

  // 3. Presets
  const presets = [
    { btn: presetBase, params: { y0: 40, a: 20, b: 0.25, C: 60, T: 12, h: 0.5 } },
    { btn: presetSaturacion, params: { y0: 20, a: 35, b: 0.2, C: 60, T: 12, h: 0.5 } },
    { btn: presetAdopcion, params: { y0: 55, a: 10, b: 0.4, C: 60, T: 12, h: 0.5 } },
    { btn: presetPasoFino, params: { y0: 40, a: 20, b: 0.25, C: 60, T: 12, h: 0.1 } }
  ];

  presets.forEach(({ btn, params }) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarParametros(params);
      ejecutarSimulacion();
      showToast('Escenario aplicado', '🎯');
    });
  });

  // 4. Exportaciones
  btnExportarCSV.addEventListener('click', () => {
    if (!simActual) return;
    const nombre = `simulacion_edo_y0-${simActual.parametros.y0}_a-${simActual.parametros.a}_h-${simActual.parametros.h}.csv`;
    exportarCSV(simActual, nombre);
    showToast('Archivo CSV descargado', '📥');
  });

  btnImprimir.addEventListener('click', () => {
    imprimirReporte();
  });

  // 5. Historial PGlite: Acciones
  btnGuardar.addEventListener('click', async () => {
    if (!simActual) return;
    try {
      const nombre = prompt('Nombre para identificar esta simulación:', `Simulación ${new Date().toLocaleTimeString()}`);
      if (nombre === null) return; // Cancelado

      await guardarSimulacion(nombre, simActual);
      showToast('Simulación guardada en PostgreSQL (PGlite)', '💾');
      await refrescarHistorial();
    } catch (err) {
      console.error(err);
      showToast('Error al guardar en base de datos', '❌');
    }
  });

  btnVaciarHistorial.addEventListener('click', async () => {
    if (confirm('¿Deseas eliminar todo el historial de simulaciones en PGlite?')) {
      await vaciarHistorial();
      await refrescarHistorial();
      showToast('Historial vaciado', '🗑️');
    }
  });

  historialList.addEventListener('click', async (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = parseInt(target.getAttribute('data-id'), 10);

    if (action === 'cargar') {
      const simDB = await obtenerSimulacionPorId(id);
      if (simDB) {
        aplicarParametros({
          y0: simDB.y0,
          a: simDB.a,
          b: simDB.b,
          C: simDB.c,
          T: simDB.t_max,
          h: simDB.h
        });
        ejecutarSimulacion();
        showToast(`Cargada simulación "${simDB.nombre}"`, '📂');
      }
    } else if (action === 'eliminar') {
      if (confirm('¿Eliminar esta simulación?')) {
        await eliminarSimulacion(id);
        await refrescarHistorial();
        showToast('Simulación eliminada', '🗑️');
      }
    }
  });

  // 6. Inicializar PGlite
  try {
    const { isPersisted } = await initDB();
    if (isPersisted) {
      pgliteStatusText.textContent = 'PGlite (IndexedDB) Activo';
    } else {
      pgliteStatusText.textContent = 'PGlite (Memoria) Activo';
    }
    await refrescarHistorial();
  } catch (err) {
    console.error('Error al inicializar PGlite:', err);
    pgliteStatusText.textContent = 'PGlite Error';
    pgliteStatusBadge.style.borderColor = '#ef4444';
  }

  // 7. Simulación inicial automática
  ejecutarSimulacion();
}

// Iniciar aplicación al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
