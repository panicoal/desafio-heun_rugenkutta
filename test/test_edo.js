import { simularEDO, solAnalitica, calcularTiempoCruce } from '../src/edo.js';

console.log('🧪 Iniciando verificación de cálculos matemáticos EDO...\n');

// Parámetros de control
const params = {
  y0: 40,
  a: 20,
  b: 0.25,
  C: 60,
  T: 12,
  h: 0.5
};

// 1. Verificar Solución Analítica en t = 1
const y1 = solAnalitica(1, params.y0, params.a, params.b);
console.log(`1. Solución Analítica en t = 1: ${y1.toFixed(4)} (Esperado: 48.8480 ~ 48.85)`);
if (Math.abs(y1 - 48.84797) > 0.001) {
  console.error('❌ Error en solución analítica en t = 1');
  process.exit(1);
} else {
  console.log('   ✅ Verificación analítica superada');
}

// 2. Verificar Tiempo de Cruce de Capacidad (C = 60)
const tCruce = calcularTiempoCruce(params.y0, params.a, params.b, params.C);
console.log(`2. Tiempo analítico de cruce de capacidad: ${tCruce.toFixed(4)} meses (Esperado: ~2.7726)`);
if (Math.abs(tCruce - 2.772588) > 0.001) {
  console.error('❌ Error en cálculo de tiempo de cruce');
  process.exit(1);
} else {
  console.log('   ✅ Verificación de cruce de capacidad superada');
}

// 3. Ejecutar Simulación Numérica (Heun vs RK4)
const sim = simularEDO(params);
console.log('\n3. Métricas de Simulación Numérica:');
console.log(`   - Total de pasos calculados: ${sim.pasos.length}`);
console.log(`   - Población final analítica t=12: ${sim.poblacionFinalAnalitica.toFixed(4)}`);
console.log(`   - Población final Heun t=12:      ${sim.poblacionFinalHeun.toFixed(4)}`);
console.log(`   - Población final RK4 t=12:       ${sim.poblacionFinalRK4.toFixed(4)}`);
console.log(`   - Error máximo Heun:              ${sim.errorMaxHeun.toExponential(4)}`);
console.log(`   - Error máximo RK4:               ${sim.errorMaxRK4.toExponential(4)}`);
console.log(`   - RMSE Heun:                      ${sim.rmseHeun.toExponential(4)}`);
console.log(`   - RMSE RK4:                       ${sim.rmseRK4.toExponential(4)}`);

// Validar que RK4 tiene mucho menor error que Heun
if (sim.errorMaxRK4 >= sim.errorMaxHeun) {
  console.error('❌ El error de RK4 debería ser menor al de Heun (RK4 es orden 4 vs Heun orden 2)');
  process.exit(1);
} else {
  console.log('   ✅ RK4 presenta un orden de convergencia y precisión superior a Heun, como se esperaba.');
}

console.log('\n🎉 ¡Todos los tests matemáticos pasaron exitosamente!');

