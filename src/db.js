import { PGlite } from '@electric-sql/pglite';

let dbInstance = null;
let isIndexedDBSupported = true;

/**
 * Inicializa la base de datos PGlite con almacenamiento IndexedDB.
 * Fallback a memoria si IndexedDB no está disponible (ej. entornos aislados).
 */
export async function initDB() {
  if (dbInstance) return dbInstance;

  try {
    // Intentar con persistencia IndexedDB
    dbInstance = new PGlite('idb://albergue-edo-db');
    await dbInstance.waitReady;
    isIndexedDBSupported = true;
  } catch (err) {
    console.warn('No se pudo inicializar IndexedDB para PGlite. Usando memoria:', err);
    dbInstance = new PGlite();
    await dbInstance.waitReady;
    isIndexedDBSupported = false;
  }

  // Crear la tabla de simulaciones si no existe
  await dbInstance.query(`
    CREATE TABLE IF NOT EXISTS simulaciones (
      id SERIAL PRIMARY KEY,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      nombre VARCHAR(120) NOT NULL,
      y0 REAL NOT NULL,
      a REAL NOT NULL,
      b REAL NOT NULL,
      c REAL NOT NULL,
      h REAL NOT NULL,
      t_max REAL NOT NULL,
      t_cruce REAL,
      error_max_heun REAL NOT NULL,
      error_max_rk4 REAL NOT NULL,
      rmse_heun REAL NOT NULL,
      rmse_rk4 REAL NOT NULL,
      json_resultados TEXT NOT NULL
    );
  `);

  return {
    db: dbInstance,
    isPersisted: isIndexedDBSupported,
  };
}

/**
 * Guarda una nueva simulación en la base de datos
 */
export async function guardarSimulacion(nombre, datosSimulacion) {
  const { db } = await initDB();
  const { parametros, tCruce, errorMaxHeun, errorMaxRK4, rmseHeun, rmseRK4, pasos } = datosSimulacion;

  const result = await db.query(
    `INSERT INTO simulaciones (
      nombre, y0, a, b, c, h, t_max, t_cruce,
      error_max_heun, error_max_rk4, rmse_heun, rmse_rk4, json_resultados
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id, fecha, nombre;`,
    [
      nombre || `Simulación ${new Date().toLocaleTimeString()}`,
      parametros.y0,
      parametros.a,
      parametros.b,
      parametros.C,
      parametros.h,
      parametros.T,
      tCruce !== null ? tCruce : null,
      errorMaxHeun,
      errorMaxRK4,
      rmseHeun,
      rmseRK4,
      JSON.stringify(pasos),
    ]
  );

  return result.rows[0];
}

/**
 * Obtiene el listado de todas las simulaciones ordenadas por fecha reciente
 */
export async function listarSimulaciones() {
  const { db } = await initDB();
  const result = await db.query(`
    SELECT
      id,
      fecha,
      nombre,
      y0,
      a,
      b,
      c,
      h,
      t_max,
      t_cruce,
      error_max_heun,
      error_max_rk4,
      rmse_heun,
      rmse_rk4
    FROM simulaciones
    ORDER BY id DESC;
  `);

  return result.rows;
}

/**
 * Obtiene una simulación completa por su ID incluyendo el JSON de pasos
 */
export async function obtenerSimulacionPorId(id) {
  const { db } = await initDB();
  const result = await db.query(
    `SELECT * FROM simulaciones WHERE id = $1 LIMIT 1;`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    ...row,
    pasos: JSON.parse(row.json_resultados),
  };
}

/**
 * Elimina una simulación por ID
 */
export async function eliminarSimulacion(id) {
  const { db } = await initDB();
  await db.query(`DELETE FROM simulaciones WHERE id = $1;`, [id]);
}

/**
 * Limpia todas las simulaciones guardadas
 */
export async function vaciarHistorial() {
  const { db } = await initDB();
  await db.query(`TRUNCATE TABLE simulaciones;`);
}

