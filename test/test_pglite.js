import { initDB, guardarSimulacion, listarSimulaciones, vaciarHistorial } from '../src/db.js';

console.log('🧪 Iniciando prueba de PGlite...');

async function testPGlite() {
  const res1 = await initDB();
  console.log('1. Primera llamada a initDB():', { hasDb: !!res1.db, isPersisted: res1.isPersisted });

  const res2 = await initDB();
  console.log('2. Segunda llamada a initDB() (cacheador):', { hasDb: !!res2.db, isPersisted: res2.isPersisted });

  if (!res1.db || !res2.db) {
    console.error('❌ Error: db es undefined en una de las llamadas');
    process.exit(1);
  }

  // Probar inserción
  const simPrueba = {
    parametros: { y0: 40, a: 20, b: 0.25, C: 60, T: 12, h: 0.5 },
    tCruce: 2.7726,
    errorMaxHeun: 0.042,
    errorMaxRK4: 0.000033,
    rmseHeun: 0.031,
    rmseRK4: 0.000024,
    pasos: [{ paso: 0, t: 0, analitica: 40, heun: 40, rk4: 40 }]
  };

  const guardado = await guardarSimulacion('Simulación Test', simPrueba);
  console.log('3. Guardado en PGlite exitoso:', guardado);

  const lista = await listarSimulaciones();
  console.log(`4. Listado de simulaciones: ${lista.length} registros encontrados.`);

  await vaciarHistorial();
  console.log('5. Historial vaciado.');

  console.log('\n🎉 ¡Pruebas de PGlite superadas exitosamente!');
}

testPGlite().catch((err) => {
  console.error('❌ Error en test de PGlite:', err);
  process.exit(1);
});
