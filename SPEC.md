# ESPECIFICACIÓN TÉCNICA DEL PROYECTO (SPEC.md)

## 1. Contexto del Problema y Modelo Matemático
El proyecto modela la dinámica poblacional de un albergue de rescate de mascotas mediante una Ecuación Diferencial Ordinaria (EDO) de primer orden lineal:

$$\frac{dy}{dt} = a - b y, \quad y(0) = y_0$$

Donde:
- $y(t)$: Cantidad de mascotas en el albergue en el tiempo $t$ (por ejemplo, meses o semanas).
- $a$: Tasa constante de ingreso/rescate de animales ($a > 0$).
- $b$: Tasa proporcional de salida por adopciones o traslados ($b > 0$).
- $C$: Capacidad física máxima del albergue ($C > 0$).
- $T$: Tiempo total de la simulación temporal ($t \in [0, T]$).
- $h$: Tamaño del paso de integración temporal ($\Delta t = h$).

### Parámetros de Control (Escenario Base)
- $y_0 = 40$ mascotas
- $a = 20$ mascotas/mes
- $b = 0.25$ mes$^{-1}$
- $C = 60$ mascotas (capacidad)
- $T = 12$ meses
- $h = 0.5$ meses (o seleccionable entre 1.0, 0.5, 0.25, 0.1)

---

## 2. Solución Analítica Exacta
Resolviendo mediante factor integrante $\mu(t) = e^{\int b dt} = e^{bt}$:

$$\frac{d}{dt}\left(y e^{bt}\right) = a e^{bt} \implies y(t) e^{bt} = \frac{a}{b}e^{bt} + K$$

Aplicando $y(0) = y_0$:

$$y(t) = \frac{a}{b} + \left(y_0 - \frac{a}{b}\right)e^{-bt}$$

- **Población en equilibrio asintótico:** $y_\infty = \lim_{t \to \infty} y(t) = \frac{a}{b} = \frac{20}{0.25} = 80$ mascotas.
- **Valor de control en $t = 1$:**
  $$y(1) = 80 + (40 - 80)e^{-0.25} = 80 - 40(0.77880078) \approx 48.85 \text{ mascotas}$$
- **Tiempo de cruce de capacidad $t_C$ ($y(t_C) = C$):**
  $$C = \frac{a}{b} + \left(y_0 - \frac{a}{b}\right)e^{-bt_C} \implies t_C = -\frac{1}{b}\ln\left(\frac{\frac{a}{b} - C}{\frac{a}{b} - y_0}\right)$$
  Para los valores de control ($y_0=40, a=20, b=0.25, C=60$):
  $$t_C = -\frac{1}{0.25}\ln\left(\frac{80 - 60}{80 - 40}\right) = -4 \ln(0.5) \approx 2.7726 \text{ meses}$$

---

## 3. Métodos Numéricos

Definiendo la función derivada $f(t, y) = a - by$:

### A. Método de Heun (Runge-Kutta de 2do Orden / Euler Mejorado)
Para cada paso $n = 0, 1, \dots, N-1$:
1. Pendiente inicial: $k_1 = f(t_n, y_n) = a - b y_n$
2. Estimador predictor de Euler: $\tilde{y}_{n+1} = y_n + h k_1$
3. Pendiente estimada al final del intervalo: $k_2 = f(t_n + h, \tilde{y}_{n+1}) = a - b \tilde{y}_{n+1}$
4. Corrector final:
   $$y_{n+1} = y_n + \frac{h}{2}(k_1 + k_2)$$

### B. Método de Runge-Kutta de 4to Orden (RK4)
Para cada paso $n = 0, 1, \dots, N-1$:
1. $k_1 = f(t_n, y_n)$
2. $k_2 = f\left(t_n + \frac{h}{2}, y_n + \frac{h}{2} k_1\right)$
3. $k_3 = f\left(t_n + \frac{h}{2}, y_n + \frac{h}{2} k_2\right)$
4. $k_4 = f(t_n + h, y_n + h k_3)$
5. Promedio ponderado RK4:
   $$y_{n+1} = y_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$

### C. Métricas de Error y Comparación
- Error Absoluto puntual: $E_n = |y_{\text{exacto}}(t_n) - y_{\text{num}}(t_n)|$
- Error Relativo Porcentual: $\epsilon_n = \frac{|y_{\text{exacto}}(t_n) - y_{\text{num}}(t_n)|}{|y_{\text{exacto}}(t_n)|} \times 100\%$
- Error Máximo Global: $E_{\max} = \max_n E_n$
- Raíz del Error Cuadrático Medio (RMSE): $\text{RMSE} = \sqrt{\frac{1}{N+1}\sum_{n=0}^N (y_{\text{exacto}}(t_n) - y_{\text{num}}(t_n))^2}$

---

## 4. Persistencia Local con PGlite (PostgreSQL en el Navegador)
- Biblioteca: `@electric-sql/pglite`
- Almacenamiento: `idb://albergue_simulaciones_db` (persistencia en IndexedDB)
- Esquema de la tabla:
```sql
CREATE TABLE IF NOT EXISTS simulaciones (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nombre VARCHAR(100) NOT NULL,
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
```

---

## 5. Arquitectura de la Interfaz de Usuario (UI/UX)
1. **Header / Hero:** Título con branding claro ("Simulador Numérico EDO: Albergue de Mascotas"), indicador de estado de conexión PGlite.
2. **Panel de Parámetros:**
   - Sliders y entradas numéricas para $y_0, a, b, C, T, h$.
   - Botones de presets ("Caso Base", "Saturación Rápida", "Alta Adopción").
   - Botón de ejecución y botón de guardado en base de datos.
3. **Panel de Métricas / KPI Cards:**
   - Capacidad vs Población final.
   - Tiempo estimado de cruce de capacidad $t_C$.
   - Comparativa de precisión Heun vs RK4 ($E_{\max}$ y RMSE).
4. **Visualizaciones Gráficas (Chart.js):**
   - Curva de Población $y(t)$: Analítica, Heun, RK4 y umbral de Capacidad $C$.
   - Curva de Error Absoluto en el tiempo $E(t)$ para comparar convergencia.
5. **Tabla Paso a Paso:**
   - Columnas: $t_n$, Solución Analítica, Heun, Error Heun, RK4, Error RK4.
   - Buscador / paginador / scroll estilizado.
6. **Historial de Simulaciones (PGlite):**
   - Lista interactiva de simulaciones guardadas con fecha, parámetros y errores.
   - Acciones: Cargar simulación, Ver métricas, Eliminar.
7. **Exportación de Reportes:**
   - Exportar a CSV (datos tabulares).
   - Generar / Imprimir Reporte PDF para presentación técnica.

---

## 6. Requisitos de Build y Despliegue en Vercel
- Herramienta de compilación: **Vite**
- Configuración crítica `vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite'

  export default defineConfig({
    optimizeDeps: {
      exclude: ['@electric-sql/pglite']
    },
    worker: {
      format: 'es'
    }
  })
  ```
- Salida de producción estática en `dist/` compatible 100% con Vercel.
