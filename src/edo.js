/**
 * Módulo Matemático: Dinámica de Población del Albergue
 * EDO: dy/dt = a - b*y, y(0) = y0
 */

/**
 * Función derivada f(t, y) = a - b * y
 */
export function f(t, y, a, b) {
  return a - b * y;
}

/**
 * Solución analítica exacta:
 * y(t) = a/b + (y0 - a/b) * exp(-b * t)
 */
export function solAnalitica(t, y0, a, b) {
  if (b === 0) {
    return y0 + a * t;
  }
  const yInf = a / b;
  return yInf + (y0 - yInf) * Math.exp(-b * t);
}

/**
 * Cálculo analítico del tiempo de cruce de la capacidad C:
 * C = a/b + (y0 - a/b)*exp(-b * tC)
 * exp(-b*tC) = (a/b - C) / (a/b - y0)
 * tC = - (1/b) * ln((a/b - C) / (a/b - y0))
 */
export function calcularTiempoCruce(y0, a, b, C) {
  if (b <= 0) return null;
  const yInf = a / b;

  if (Math.abs(y0 - C) < 1e-9) {
    return 0; // Ya inicia en la capacidad
  }

  const numerador = yInf - C;
  const denominador = yInf - y0;

  // Si la fracción es <= 0, nunca cruza en t real
  if (denominador === 0) return null;
  const ratio = numerador / denominador;
  if (ratio <= 0) return null;

  const tC = -(1 / b) * Math.log(ratio);
  return tC >= 0 ? tC : null;
}

/**
 * Genera un diagnóstico operativo comprensivo para la gestión del albergue
 */
export function generarDiagnostico(params, sim) {
  const { y0, a, b, C, T } = params;
  const { tCruce, equilibrio, poblacionFinalAnalitica } = sim;

  const bRequerido = a / C;
  const aMaxSostenible = b * C;

  if (tCruce !== null && tCruce <= T) {
    const sobrecupo = poblacionFinalAnalitica - C;
    return {
      estado: 'alerta',
      titulo: '⚠️ Alerta de Sobrecupo Crítico',
      color: '#ef4444',
      badge: 'Capacidad Superada',
      resumen: `El albergue sobrepasa su límite físico de ${C} mascotas en el mes ${tCruce.toFixed(2)}.`,
      detalle: `Al final del período (mes ${T}), la población proyectada es de ${poblacionFinalAnalitica.toFixed(1)} mascotas, lo que representa un sobrecupo de +${sobrecupo.toFixed(1)} animales respecto a la infraestructura disponible. La población tiende asintóticamente a ${equilibrio.toFixed(1)} mascotas.`,
      recomendaciones: [
        `Aumentar la tasa de adopción de b = ${b} a b ≥ ${bRequerido.toFixed(3)} mes⁻¹ (incremento del ${(((bRequerido - b) / b) * 100).toFixed(1)}% en adopciones) para estabilizar la población dentro de la capacidad.`,
        `O bien, limitar la tasa de nuevos rescates de a = ${a} a un máximo de a ≤ ${aMaxSostenible.toFixed(1)} animales/mes.`,
        `Ampliar instalaciones en al menos +${Math.ceil(sobrecupo)} plazas si se desea mantener los ritmos actuales de rescate y adopción.`
      ]
    };
  } else if (tCruce !== null && tCruce > T) {
    return {
      estado: 'advertencia',
      titulo: '🟡 Capacidad Estable en el Horizonte Actual',
      color: '#f59e0b',
      badge: 'Alerta Futura',
      resumen: `La capacidad se respeta durante los ${T} meses evaluados, pero se cruzará en t = ${tCruce.toFixed(2)} meses.`,
      detalle: `La población final en el mes ${T} es de ${poblacionFinalAnalitica.toFixed(1)} mascotas (inferior a ${C}). Sin embargo, la tendencia a largo plazo asintótica (${equilibrio.toFixed(1)}) excede la capacidad máxima.`,
      recomendaciones: [
        `Planificar a mediano plazo un aumento en campañas de adopción antes del mes ${Math.floor(tCruce)}.`,
        `Monitorear periódicamente los ingresos para evitar sobrepasar el límite de ${C} mascotas.`
      ]
    };
  } else {
    return {
      estado: 'seguro',
      titulo: '🟢 Operación Sostenible y Segura',
      color: '#10b981',
      badge: 'Capacidad Segura',
      resumen: `El albergue opera con capacidad holgada durante todo el tiempo y a largo plazo.`,
      detalle: `La población converge asintóticamente a un equilibrio estable de ${equilibrio.toFixed(1)} mascotas, manteniéndose por debajo de la capacidad de ${C} animales. La población al mes ${T} es de ${poblacionFinalAnalitica.toFixed(1)} mascotas.`,
      recomendaciones: [
        `El sistema está en equilibrio sostenible. El albergue dispone de margen para absorber emergencias o incrementos temporales de rescate.`,
        `Margen de seguridad disponible: ${(C - poblacionFinalAnalitica).toFixed(1)} plazas libres estimadas al mes ${T}.`
      ]
    };
  }
}

/**
 * Ejecuta simulación comparativa completa con Heun y RK4
 * @param {Object} params - { y0, a, b, C, T, h }
 */
export function simularEDO({ y0, a, b, C, T, h }) {
  const steps = Math.round(T / h);
  const precisionDecimales = Math.min(6, Math.max(2, Math.ceil(-Math.log10(h)) + 2));

  let t = 0;
  let yHeun = y0;
  let yRK4 = y0;

  const resultados = [];
  let sumaCuadHeun = 0;
  let sumaCuadRK4 = 0;
  let errorMaxHeun = 0;
  let errorMaxRK4 = 0;

  for (let n = 0; n <= steps; n++) {
    // Redondeo de t para evitar ruido de punto flotante en JS
    const tActual = Number(t.toFixed(precisionDecimales));
    const yExacta = solAnalitica(tActual, y0, a, b);

    const errHeun = Math.abs(yExacta - yHeun);
    const errRK4 = Math.abs(yExacta - yRK4);

    const relErrHeun = yExacta !== 0 ? (errHeun / Math.abs(yExacta)) * 100 : 0;
    const relErrRK4 = yExacta !== 0 ? (errRK4 / Math.abs(yExacta)) * 100 : 0;

    if (errHeun > errorMaxHeun) errorMaxHeun = errHeun;
    if (errRK4 > errorMaxRK4) errorMaxRK4 = errRK4;

    sumaCuadHeun += errHeun * errHeun;
    sumaCuadRK4 += errRK4 * errRK4;

    // Calcular pendientes intermedias para trazabilidad paso a paso
    let infoHeun = null;
    let infoRK4 = null;

    if (n < steps) {
      // --- Heun (Euler mejorado / RK2) ---
      const k1_h = f(tActual, yHeun, a, b);
      const yPred = yHeun + h * k1_h;
      const k2_h = f(tActual + h, yPred, a, b);
      const yHeunSiguiente = yHeun + (h / 2) * (k1_h + k2_h);

      infoHeun = {
        k1: k1_h,
        yPred,
        k2: k2_h,
        ySiguiente: yHeunSiguiente
      };

      // --- Runge-Kutta de 4to Orden (RK4) ---
      const k1 = f(tActual, yRK4, a, b);
      const k2 = f(tActual + h / 2, yRK4 + (h / 2) * k1, a, b);
      const k3 = f(tActual + h / 2, yRK4 + (h / 2) * k2, a, b);
      const k4 = f(tActual + h, yRK4 + h * k3, a, b);
      const yRK4Siguiente = yRK4 + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);

      infoRK4 = {
        k1,
        k2,
        k3,
        k4,
        ySiguiente: yRK4Siguiente
      };

      resultados.push({
        paso: n,
        t: tActual,
        analitica: yExacta,
        heun: yHeun,
        rk4: yRK4,
        errorHeun: errHeun,
        errorRK4: errRK4,
        relErrorHeun: relErrHeun,
        relErrorRK4: relErrRK4,
        capacidad: C,
        infoHeun,
        infoRK4
      });

      yHeun = yHeunSiguiente;
      yRK4 = yRK4Siguiente;
      t += h;
    } else {
      resultados.push({
        paso: n,
        t: tActual,
        analitica: yExacta,
        heun: yHeun,
        rk4: yRK4,
        errorHeun: errHeun,
        errorRK4: errRK4,
        relErrorHeun: relErrHeun,
        relErrorRK4: relErrRK4,
        capacidad: C,
        infoHeun: null,
        infoRK4: null
      });
    }
  }

  const rmseHeun = Math.sqrt(sumaCuadHeun / (steps + 1));
  const rmseRK4 = Math.sqrt(sumaCuadRK4 / (steps + 1));
  const tCruce = calcularTiempoCruce(y0, a, b, C);
  const equilibrio = b !== 0 ? a / b : Infinity;
  const factorMejora = errorMaxRK4 > 0 ? (errorMaxHeun / errorMaxRK4) : Infinity;

  const resultadoSim = {
    parametros: { y0, a, b, C, T, h },
    tCruce,
    equilibrio,
    errorMaxHeun,
    errorMaxRK4,
    rmseHeun,
    rmseRK4,
    factorMejora,
    poblacionFinalAnalitica: resultados[resultados.length - 1].analitica,
    poblacionFinalHeun: resultados[resultados.length - 1].heun,
    poblacionFinalRK4: resultados[resultados.length - 1].rk4,
    capacidadSuperada: resultados.some((r) => r.analitica >= C || r.heun >= C || r.rk4 >= C),
    pasos: resultados,
  };

  resultadoSim.diagnostico = generarDiagnostico({ y0, a, b, C, T }, resultadoSim);

  return resultadoSim;
}
