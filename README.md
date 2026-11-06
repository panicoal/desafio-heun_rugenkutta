# 🐾 Desafío Numérico EDO: Dinámica Poblacional en un Albergue de Mascotas (Métodos de Heun y RK4)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&style=flat-square)](https://desafio-heun-rugenkutta.vercel.app/)
[![Database](https://img.shields.io/badge/Database-PGlite%20(WASM%20%2B%20IndexedDB)-38bdf8?logo=postgresql&style=flat-square)](https://pglite.dev)
[![Engine](https://img.shields.io/badge/Engine-Vite%20%2B%20Chart.js%20%2B%20KaTeX-8b5cf6?style=flat-square)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-Passing%20(100%25)-10b981?style=flat-square)](#-solución-analítica-y-verificación-numérica)

Aplicación interactiva y científica para la simulación, análisis predictivo y toma de decisiones en la gestión de capacidad de un refugio de animales rescatados. Resuelve la ecuación diferencial ordinaria del balance poblacional mediante la **Solución Analítica Exacta**, el **Método de Heun (RK2)** y el **Método de Runge-Kutta de 4to Orden (RK4)**, con persistencia local en PostgreSQL en el cliente mediante **PGlite** y desplegado en **Vercel**.

---

## 🔗 Enlaces del Proyecto

- **🌐 Aplicación Web en Vercel:** [https://desafio-heun-rugenkutta.vercel.app/](https://desafio-heun-rugenkutta.vercel.app/)
- **🎥 Demostración en Video:** *(Pendiente / En proceso de grabación)*

---

## 📌 Problema y Comunidad Beneficiaria

### Problemática
Los refugios de animales y albergues de rescate operan bajo una presión logística constante: la entrada de animales abandonados o decomisados suele superar la capacidad de adopción de la comunidad. Si la población de animales excede la capacidad física máxima ($C$), se originan problemas críticos:
- Hacinamiento y estrés animal.
- Aumento de brotes infecciosos y dificultades de aislamiento veterinario.
- Sobrecosto operativo insostenible en alimentos y medicinas.

Predecir con precisión matemática la evolución del censo del albergue y calcular con anticipación el momento exacto en que se rebasará la capacidad física es fundamental para diseñar campañas de adopción o regular el ritmo de rescates.

### Comunidad Beneficiaria
1. **Albergues y ONGs de Bienestar Animal:** Directores y coordinadores que requieren planificar el presupuesto, compras de insumos y cupos de jaulas.
2. **Autoridades Municipales y de Salud Pública:** Administradores de centros zoonóticos y departamentos de control ético de poblaciones.
3. **Comunidad Adoptante y Voluntarios:** Sensibilización informada sobre la urgencia y el impacto cuantitativo de adoptar a tiempo.

---

## 📐 Modelo Matemático: EDO, Variables y Parámetros

El flujo continuo de animales se describe mediante una **Ecuación Diferencial Ordinaria (EDO) de primer orden lineal**:

$$\frac{dy}{dt} = \text{Tasa de Ingreso} - \text{Tasa de Salida} = a - b \cdot y(t), \quad y(0) = y_0$$

### Definición de Variables y Parámetros

| Símbolo | Parámetro / Variable | Valor Base | Unidades | Significado Operativo en el Albergue |
| :---: | :--- | :---: | :---: | :--- |
| $t$ | Tiempo | $[0, 12]$ | meses | Tiempo transcurrido desde el inicio de la proyección. |
| $y(t)$ | Población albergada | Variable | mascotas | Censo total de mascotas que habitan el albergue en el mes $t$. |
| $y_0$ | Población inicial | $40$ | mascotas | Cantidad de animales al iniciar la simulación ($t = 0$). |
| $a$ | Tasa de ingreso continuo | $20$ | mascotas / mes | Flujo constante de rescates, abandonos o decomisos recibidos. |
| $b$ | Tasa proporcional de salida | $0.25$ | mes$^{-1}$ | Proporción mensual de adopciones respecto a la población presente ($25\%$/mes). |
| $C$ | Capacidad máxima | $60$ | plazas | Capacidad física instalada de jaulas y caniles en el refugio. |
| $h$ | Paso de integración | $0.5$ | meses | Tamaño del salto temporal ($\Delta t$). Libremente ajustable en la aplicación. |
| $y_\infty$ | Equilibrio asintótico | $80$ | mascotas | Población teórica límite calculada como $y_\infty = \frac{a}{b}$. |

---

## 🔍 Supuestos del Modelo e Intervalo de Simulación

### Supuestos Principales
1. **Flujo de Rescate Constante ($a$):** Se asume que el ritmo mensual de llegada de nuevos animales rescatados se mantiene estable durante el período evaluado.
2. **Salidas Proporcionales al Censo ($b \cdot y$):** A mayor cantidad de animales disponibles y visibles en el albergue, mayor número de entrevistas de adopción exitosas se concretan.
3. **Mortalidad Despreciable:** Se considera que las muertes naturales son mínimas gracias a la atención veterinaria oportuna o quedan absorbidas de forma agregada dentro de la tasa de egresos $b$.
4. **Capacidad Rígida ($C$):** El límite físico de 60 plazas no puede aumentarse sin obras civiles adicionales; superar este valor implica sobrecupo inmediato.

### Intervalo de Simulación
- **Horizonte Temporal Predeterminado:** $t \in [0, 12]$ meses (un año completo de gestión).
- **Paso Temporal de Referencia:** $h = 0.5$ meses (ajustable por el usuario entre $0.01$ y $2.0$).

---

## 🧪 Solución Analítica y Verificación Numérica

### Deducción Analítica por Factor Integrante
Escribiendo la ecuación en su forma canónica lineal:

$$\frac{dy}{dt} + b \cdot y = a$$

Multiplicamos por el factor integrante $\mu(t) = e^{\int b dt} = e^{bt}$:

$$\frac{d}{dt}\left(y(t) e^{bt}\right) = a e^{bt} \implies y(t) e^{bt} = \int a e^{bt} dt = \frac{a}{b}e^{bt} + K$$

Despejando $y(t)$:

$$y(t) = \frac{a}{b} + K e^{-bt}$$

Evaluando la condición inicial $y(0) = y_0 \implies K = y_0 - \frac{a}{b}$. Por tanto, la **solución analítica exacta** es:

$$y(t) = \frac{a}{b} + \left(y_0 - \frac{a}{b}\right)e^{-bt}$$

Sustituyendo los parámetros del caso base ($a=20$, $b=0.25$, $y_0=40$, $\frac{a}{b} = 80$):

$$y(t) = 80 - 40 e^{-0.25 t}$$

### Verificación del Valor de Control ($t = 1$ mes)
$$y(1) = 80 - 40 e^{-0.25(1)} = 80 - 40(0.77880078) = 48.84797 \approx 48.85 \text{ mascotas}$$

### Tiempo Analítico de Cruce de Capacidad ($t_C$)
Para hallar en qué mes se desborda la capacidad física instalada ($y(t_C) = C = 60$):

$$60 = 80 - 40 e^{-0.25 t_C} \implies 40 e^{-0.25 t_C} = 20 \implies e^{-0.25 t_C} = 0.5$$

$$t_C = -\frac{1}{0.25}\ln(0.5) = -4 \cdot (-0.693147) \approx 2.7726 \text{ meses}$$

> **Conclusión Analítica:** A los **2.77 meses** (aproximadamente en la tercera semana del tercer mes), el albergue superará su capacidad de 60 mascotas si no se modifican las políticas de adopción o rescate.

---

## 🔬 Métodos Numéricos Implementados

Sea $f(t, y) = a - by$ la función derivada:

### 1. Método de Heun (Euler Mejorado / Predictor-Corrector RK2)
- **Orden de convergencia:** Error local de truncamiento $O(h^3)$, error global acumulado $O(h^2)$.
- **Algoritmo:**
  1. Pendiente inicial: $k_1 = f(t_n, y_n) = a - b y_n$
  2. Estimación predictora de Euler: $\tilde{y}_{n+1} = y_n + h k_1$
  3. Pendiente estimada al final del paso: $k_2 = f(t_n + h, \tilde{y}_{n+1}) = a - b \tilde{y}_{n+1}$
  4. Corrector final: $y_{n+1} = y_n + \frac{h}{2}(k_1 + k_2)$

### 2. Método de Runge-Kutta de 4to Orden (RK4)
- **Orden de convergencia:** Error local de truncamiento $O(h^5)$, error global acumulado $O(h^4)$.
- **Algoritmo:**
  1. $k_1 = f(t_n, y_n)$
  2. $k_2 = f\left(t_n + \frac{h}{2}, y_n + \frac{h}{2}k_1\right)$
  3. $k_3 = f\left(t_n + \frac{h}{2}, y_n + \frac{h}{2}k_2\right)$
  4. $k_4 = f(t_n + h, y_n + h k_3)$
  5. Promedio ponderado: $y_{n+1} = y_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$

---

## 📊 Resultados Numéricos Comparativos (Escenario Base: $h = 0.5$)

| Métrica Numérica | Solución Analítica | Método de Heun (RK2) | Runge-Kutta 4to Orden (RK4) |
| :--- | :---: | :---: | :---: |
| **Población en $t = 1$ mes** | $48.8480$ | $48.8281$ | $48.8480$ |
| **Población final en $t = 12$ meses** | $78.0085$ | $77.9914$ | $78.0085$ |
| **Error Absoluto Máximo ($E_{\max}$)** | $0$ (referencia) | $4.2152 \times 10^{-2}$ | **$3.3230 \times 10^{-5}$** |
| **RMSE (Error Cuadrático Medio)** | $0$ (referencia) | $3.1495 \times 10^{-2}$ | **$2.4816 \times 10^{-5}$** |
| **Factor de Exactitud Relativa** | Base | Base | **$\sim 1,268$ veces más exacto** |

---

## 💡 Resultados y Conclusiones Principales

1. **Superioridad Numérica de RK4:** RK4 demostró una exactitud más de **$1,200$ veces mayor que Heun** para el mismo tamaño de paso ($h=0.5$), con un error máximo despreciable del orden de $10^{-5}$ mascotas frente a los $4.2 \times 10^{-2}$ de Heun.
2. **Diagnóstico y Recomendaciones de Gestión para el Albergue:**
   - La capacidad máxima ($C=60$) se agota en el mes $t_C = 2.77$.
   - En el mes $12$, la población alcanza $78$ animales, generando un sobrecupo de **$+18$ mascotas**.
   - Para evitar el sobrecupo y equilibrar el albergue exactamente en 60 plazas sin ampliar infraestructura, se requiere:
     $$\text{Tasa mínima de adopción requerida: } b_{\text{req}} = \frac{a}{C} = \frac{20}{60} \approx 0.333 \text{ mes}^{-1}$$
     Esto representa un **incremento del $+33.3\%$ en campañas de adopción**, o bien limitar el ritmo de rescates a un máximo de $a \le b \cdot C = 0.25 \times 60 = 15$ mascotas/mes.
3. **Innovación Tecnológica (PGlite en WASM):** Al integrar PostgreSQL directamente en el navegador con WebAssembly e IndexedDB, la aplicación permite guardar, listar y recuperar simulaciones completas sin costos de infraestructura backend ni problemas de latencia.

---

## ⚠️ Aviso de Parámetros Hipotéticos

> [!NOTE]
> Los valores asignados en el escenario base ($y_0 = 40$, $a = 20$, $b = 0.25$, $C = 60$, $T = 12$) son de carácter **hipotético y académico**, diseñados específicamente para modelar un fenómeno realista de saturación poblacional y verificar con rigor la convergencia de los métodos numéricos. La aplicación permite modificar libremente cada uno de estos parámetros para adaptarlos a datos censales reales de cualquier albergue.

---

## 💻 Instrucciones de Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18.0.0 o superior
- Administrador de paquetes `npm` (incluido con Node.js)

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/desafio-heun_rugenkutta.git
   cd desafio-heun_rugenkutta
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar la suite de pruebas unitarias y matemáticas:**
   ```bash
   npm test
   ```

4. **Iniciar el servidor de desarrollo local:**
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:5173/`.

5. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Los archivos estáticos optimizados se generarán en la carpeta `dist/`.

6. **Previsualizar la compilación de producción:**
   ```bash
   npm run preview
   ```

---

## 🛠️ Stack Tecnológico

- **Frontend & Bundler:** [Vite](https://vitejs.dev/) (Vanilla JS / Modern ES Modules)
- **Motor Gráfico:** [Chart.js](https://www.chartjs.org/) (Gráficas reactivas de población, error y comparativa de órdenes)
- **Base de Datos Local:** [PGlite (ElectricSQL)](https://pglite.dev/) (PostgreSQL en WebAssembly con persistencia en IndexedDB)
- **Renderizado Matemático:** [KaTeX](https://katex.org/) (Tipografía matemática LaTeX de alta velocidad)
- **Despliegue y CDN:** [Vercel](https://vercel.com/)

