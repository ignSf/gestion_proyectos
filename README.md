# PMO Control Center – Gestión Inteligente de Infraestructuras Críticas

Plataforma interactiva de monitoreo, telemetría y control para dos túneles urbanos, desarrollada para la asignatura **Gestión de Proyectos de Software (GPY1102)** - Evaluación Parcial N°2.

---

## 👥 Equipo de Proyecto
* **Ignacio Salazar**
* **Dylan Carroza**
* **Tomás Torres**

---

## 🚀 Características Principales
* **Panel de Control en Tiempo Real:** Visualización continua de telemetría IoT (vibración estructural, niveles de CO, humedad, deformación y tráfico).
* **Gestión de Umbrales y Alertas:** Clasificación automatizada en bandas Normal (Verde), Advertencia (Amarillo) y Crítico (Rojo) con tiempos de respuesta bajo SLA (< 5 minutos en alertas críticas).
* **Módulo de Ticketing de Mantenimiento:** Generación y seguimiento trazable de órdenes de trabajo vinculadas a sensores específicos.
* **Seguimiento de Hitos y Triple Restricción:** Monitoreo del estado a Semana 6 con métricas de avance físico, calidad de datos y análisis de variaciones.
* **Simulador de Eventos e Imprevistos:** Incorporación interactiva de protocolos de gestión del cambio (falsos positivos, cortes de conectividad con buffer local, obras imprevistas).

---

## 🛠️ Tecnologías Utilizadas
* **HTML5 Semántico**
* **CSS3 Moderno** (Diseño responsivo, estética Dark Glassmorphism, variables CSS, microanimaciones)
* **JavaScript Vanilla (ES6+)** (Arquitectura orientada a componentes modulares, gestión de estado reactivo local)

---

## 💻 Ejecución Local
Para ejecutar la plataforma localmente:

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/ignSf/gestion_proyectos.git
   cd gestion_proyectos
   ```
2. Abrir `index.html` en cualquier navegador web moderno, o iniciar un servidor local:
   ```bash
   # Utilizando Python:
   python -m http.server 8080

   # O con Node.js:
   npx serve .
   ```
3. Acceder en el navegador a `http://localhost:8080`.
