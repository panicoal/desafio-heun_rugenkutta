/**
 * Módulo de Exportación de Datos y Reportes
 */

/**
 * Exporta los resultados de la simulación a formato CSV compatible con Excel
 */
export function exportarCSV(simulacion, nombreArchivo = 'simulacion_edo_albergue.csv') {
  const { parametros, pasos, tCruce, errorMaxHeun, errorMaxRK4, rmseHeun, rmseRK4 } = simulacion;

  let csvContent = '\uFEFF'; // UTF-8 BOM para soporte de caracteres en Excel

  // Metadatos
  csvContent += '# REPORTE DE SIMULACION NUMERICA EDO - ALBERGUE DE MASCOTAS\r\n';
  csvContent += `# Ecuacion: dy/dt = a - b*y, y(0) = ${parametros.y0}\r\n`;
  csvContent += `# Parametros: y0=${parametros.y0}, a=${parametros.a}, b=${parametros.b}, Capacidad(C)=${parametros.C}, Paso(h)=${parametros.h}, T_max=${parametros.T}\r\n`;
  csvContent += `# Tiempo analitico de cruce de capacidad: ${tCruce !== null ? tCruce.toFixed(4) + ' meses' : 'No cruza'}\r\n`;
  csvContent += `# Error Max Heun: ${errorMaxHeun.toExponential(4)}, RMSE Heun: ${rmseHeun.toExponential(4)}\r\n`;
  csvContent += `# Error Max RK4: ${errorMaxRK4.toExponential(4)}, RMSE RK4: ${rmseRK4.toExponential(4)}\r\n`;
  csvContent += '\r\n';

  // Encabezados
  csvContent += 'Paso,Tiempo_t,Solucion_Analitica,Metodo_Heun,Error_Abs_Heun,Error_Rel_Heun_Pct,Metodo_RK4,Error_Abs_RK4,Error_Rel_RK4_Pct,Capacidad_C\r\n';

  // Filas
  pasos.forEach(p => {
    const row = [
      p.paso,
      p.t,
      p.analitica.toFixed(6),
      p.heun.toFixed(6),
      p.errorHeun.toExponential(6),
      p.relErrorHeun.toFixed(4),
      p.rk4.toFixed(6),
      p.errorRK4.toExponential(6),
      p.relErrorRK4.toFixed(4),
      p.capacidad
    ];
    csvContent += row.join(',') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Prepara e invoca la impresión / exportación a PDF del navegador
 */
export function imprimirReporte() {
  window.print();
}
