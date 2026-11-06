import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar componentes modulares de Chart.js
Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

let chartPoblacion = null;
let chartError = null;
let chartComparativa = null;

/**
 * Destruye todas las instancias activas para evitar fugas de memoria
 */
export function destruirGraficos() {
  if (chartPoblacion) { chartPoblacion.destroy(); chartPoblacion = null; }
  if (chartError) { chartError.destroy(); chartError = null; }
  if (chartComparativa) { chartComparativa.destroy(); chartComparativa = null; }
}

/**
 * Renderiza o actualiza la gráfica de Dinámica de Población
 */
export function renderGraficoPoblacion(canvasEl, datosSimulacion) {
  destruirGraficos();
  const { pasos, parametros } = datosSimulacion;
  const labels = pasos.map(p => p.t);
  const dataAnalitica = pasos.map(p => p.analitica);
  const dataHeun = pasos.map(p => p.heun);
  const dataRK4 = pasos.map(p => p.rk4);
  const dataCapacidad = pasos.map(() => parametros.C);

  const ctx = canvasEl.getContext('2d');

  chartPoblacion = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Límite Físico: Capacidad C = ${parametros.C}`,
          data: dataCapacidad,
          borderColor: '#ef4444',
          borderWidth: 2,
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
          tension: 0,
          order: 1
        },
        {
          label: 'Solución Exacta (Analítica)',
          data: dataAnalitica,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          borderWidth: 2.5,
          pointRadius: 0,
          fill: true,
          tension: 0.1,
          order: 2
        },
        {
          label: 'Método de Heun (RK2 - O(h²))',
          data: dataHeun,
          borderColor: '#10b981',
          borderWidth: 2,
          pointRadius: pasos.length > 50 ? 2 : 4,
          pointHoverRadius: 6,
          backgroundColor: '#10b981',
          fill: false,
          tension: 0,
          order: 3
        },
        {
          label: 'Runge-Kutta 4to Orden (RK4 - O(h⁴))',
          data: dataRK4,
          borderColor: '#c084fc',
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: pasos.length > 50 ? 2 : 4,
          pointHoverRadius: 6,
          backgroundColor: '#c084fc',
          fill: false,
          tension: 0,
          order: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 14,
            usePointStyle: true,
            color: '#e2e8f0',
            font: { family: 'system-ui', size: 12, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: (items) => `Tiempo t = ${items[0].label} meses`,
            label: (context) => {
              const val = context.parsed.y;
              return ` ${context.dataset.label}: ${val.toFixed(4)} mascotas`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Tiempo t (meses)',
            color: '#94a3b8',
            font: { weight: 'bold' }
          },
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          title: {
            display: true,
            text: 'Población de Mascotas y(t)',
            color: '#94a3b8',
            font: { weight: 'bold' }
          },
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          suggestedMin: Math.max(0, Math.floor(Math.min(...dataAnalitica) * 0.9)),
          suggestedMax: Math.ceil(Math.max(...dataAnalitica, parametros.C) * 1.08)
        }
      }
    }
  });
}

/**
 * Renderiza o actualiza la gráfica de Comparativa de Errores Absolutos
 */
export function renderGraficoError(canvasEl, datosSimulacion, escalaLog = false) {
  destruirGraficos();
  const { pasos } = datosSimulacion;
  const labels = pasos.map(p => p.t);
  const dataErrHeun = pasos.map(p => p.errorHeun);
  const dataErrRK4 = pasos.map(p => p.errorRK4);

  const ctx = canvasEl.getContext('2d');

  chartError = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Error Absoluto Heun (|y_exacta - y_heun|)',
          data: dataErrHeun,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          pointRadius: pasos.length > 50 ? 1 : 3,
          fill: true
        },
        {
          label: 'Error Absoluto RK4 (|y_exacta - y_rk4|)',
          data: dataErrRK4,
          borderColor: '#c084fc',
          backgroundColor: 'rgba(192, 132, 252, 0.1)',
          borderWidth: 2,
          pointRadius: pasos.length > 50 ? 1 : 3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 14,
            usePointStyle: true,
            color: '#e2e8f0',
            font: { family: 'system-ui', size: 12, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: '#334155',
          borderWidth: 1,
          callbacks: {
            title: (items) => `Tiempo t = ${items[0].label} meses`,
            label: (context) => {
              const val = context.parsed.y;
              return ` ${context.dataset.label}: ${val.toExponential(4)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Tiempo t (meses)',
            color: '#94a3b8',
            font: { weight: 'bold' }
          },
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          type: escalaLog ? 'logarithmic' : 'linear',
          title: {
            display: true,
            text: escalaLog ? 'Error Absoluto (Escala Logarítmica log₁₀)' : 'Error Absoluto |y - y_num|',
            color: '#94a3b8',
            font: { weight: 'bold' }
          },
          ticks: {
            color: '#94a3b8',
            callback: (v) => typeof v === 'number' ? v.toExponential(1) : v
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}

/**
 * Renderiza gráfico de barras de Comparativa de Precisión Heun vs RK4
 */
export function renderGraficoComparativa(canvasEl, datosSimulacion) {
  destruirGraficos();
  const { errorMaxHeun, errorMaxRK4, rmseHeun, rmseRK4, factorMejora } = datosSimulacion;

  const ctx = canvasEl.getContext('2d');

  chartComparativa = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Error Máximo Global', 'RMSE (Error Cuadrático Medio)'],
      datasets: [
        {
          label: 'Método de Heun (Orden O(h²))',
          data: [errorMaxHeun, rmseHeun],
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10b981',
          borderWidth: 1
        },
        {
          label: 'Runge-Kutta 4to Orden (Orden O(h⁴))',
          data: [errorMaxRK4, rmseRK4],
          backgroundColor: 'rgba(192, 132, 252, 0.7)',
          borderColor: '#c084fc',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#e2e8f0',
            font: { family: 'system-ui', size: 12, weight: '500' }
          }
        },
        title: {
          display: true,
          text: `Comparativa de Precisión: RK4 es ~${factorMejora < 1e6 ? factorMejora.toFixed(0) : factorMejora.toExponential(1)} veces más exacto`,
          color: '#f8fafc',
          font: { size: 14, weight: 'bold' }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          callbacks: {
            label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toExponential(4)}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { weight: 'bold' } },
          grid: { display: false }
        },
        y: {
          type: 'logarithmic',
          title: {
            display: true,
            text: 'Magnitud del Error (Escala Logarítmica)',
            color: '#94a3b8',
            font: { weight: 'bold' }
          },
          ticks: {
            color: '#94a3b8',
            callback: (v) => typeof v === 'number' ? v.toExponential(0) : v
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}
