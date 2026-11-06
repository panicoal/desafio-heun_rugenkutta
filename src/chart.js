import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
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
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

let chartPoblacion = null;
let chartError = null;

/**
 * Renderiza o actualiza la gráfica de Dinámica de Población
 */
export function renderGraficoPoblacion(canvasEl, datosSimulacion) {
  const { pasos, parametros } = datosSimulacion;
  const labels = pasos.map(p => p.t);
  const dataAnalitica = pasos.map(p => p.analitica);
  const dataHeun = pasos.map(p => p.heun);
  const dataRK4 = pasos.map(p => p.rk4);
  const dataCapacidad = pasos.map(() => parametros.C);

  if (chartPoblacion) {
    chartPoblacion.destroy();
  }

  const ctx = canvasEl.getContext('2d');

  chartPoblacion = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Capacidad Máxima (C)',
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
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 2.5,
          pointRadius: 0,
          fill: true,
          tension: 0.1,
          order: 2
        },
        {
          label: 'Método de Heun (RK2)',
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
          label: 'Runge-Kutta 4to Orden (RK4)',
          data: dataRK4,
          borderColor: '#8b5cf6',
          borderWidth: 2,
          borderDash: [3, 3],
          pointRadius: pasos.length > 50 ? 2 : 4,
          pointHoverRadius: 6,
          backgroundColor: '#8b5cf6',
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
            font: { family: 'system-ui', size: 12, weight: '500' }
          }
        },
        tooltip: {
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
            font: { weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        y: {
          title: {
            display: true,
            text: 'Población y(t) (mascotas)',
            font: { weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          suggestedMin: Math.max(0, Math.floor(Math.min(...dataAnalitica) * 0.9)),
          suggestedMax: Math.ceil(Math.max(...dataAnalitica, parametros.C) * 1.05)
        }
      }
    }
  });
}

/**
 * Renderiza o actualiza la gráfica de Comparativa de Errores Absolutos
 */
export function renderGraficoError(canvasEl, datosSimulacion, escalaLog = false) {
  const { pasos } = datosSimulacion;
  const labels = pasos.map(p => p.t);
  const dataErrHeun = pasos.map(p => p.errorHeun);
  const dataErrRK4 = pasos.map(p => p.errorRK4);

  if (chartError) {
    chartError.destroy();
  }

  const ctx = canvasEl.getContext('2d');

  chartError = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Error Absoluto Heun (|y - y_heun|)',
          data: dataErrHeun,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          pointRadius: pasos.length > 50 ? 1 : 3,
          fill: true
        },
        {
          label: 'Error Absoluto RK4 (|y - y_rk4|)',
          data: dataErrRK4,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
            font: { family: 'system-ui', size: 12, weight: '500' }
          }
        },
        tooltip: {
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
            font: { weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        y: {
          type: escalaLog ? 'logarithmic' : 'linear',
          title: {
            display: true,
            text: escalaLog ? 'Error Absoluto (Escala Logarítmica)' : 'Error Absoluto',
            font: { weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          suggestedMin: 0
        }
      }
    }
  });
}
