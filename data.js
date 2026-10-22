/**
 * ====================================================================
 * PMO Control Center — Gestión de Datos y Persistencia Local
 * Infraestructuras Críticas — Caso N°6 (GPY1102)
 *
 * Repositorio centralizado de datos, configuración y estado dinámico.
 * Permite agregar, editar y eliminar eventos, riesgos, tareas,
 * informes manuales y métricas de telemetría/EVM en tiempo real.
 * ====================================================================
 */

const STORAGE_KEY = 'PMO_CONTROL_CENTER_DATA_V3';

// 1. DATOS INICIALES POR DEFECTO DEL CASO OFICIAL N°6
const DEFAULT_DATA = {
  evm: {
    BAC: 150000,
    PV: 85714,
    EV: 83670,
    AC: 80200,
    currentWeek: 8,
    totalWeeks: 14
  },
  telemetry: {
    uptime: 99.88,
    latency: 3.2,
    testCoverage: 92.4,
    activeSensors: 148,
    errorRate: 0.12,
    statusText: 'Proyecto Saludable',
    statusClass: 'green'
  },
  rfcs: [
    {
      id: 'RFC-001',
      badge: 'IMP-001',
      title: 'Inestabilidad y Cambios en la API del Proveedor IoT',
      type: 'Técnico / Integración Externa',
      accent: 'red-accent',
      detectionDate: 'Semana 4',
      responsible: 'Arquitecto Cloud & Ciberseguridad',
      impactLevel: 'ALTO',
      impactText: 'Paralización del desarrollo del dashboard y motor de umbrales',
      problemDescription: 'El proveedor modificó unilateralmente los esquemas JSON y endpoints, introduciendo latencias superiores a 6 segundos incompatibles con los SLA acordados.',
      alternatives: [
        { label: 'A) Esperar corrección del proveedor', status: 'Rechazada', reason: 'Paralizaría 12+ días-hombre' },
        { label: 'B) Cambiar de proveedor IoT', status: 'Rechazada', reason: 'Costo prohibitivo + retraso de 3 semanas' },
        { label: 'C) Adapter Pattern + Mock Server', status: 'Aprobada', reason: 'Desacopla desarrollo sin costo adicional' }
      ],
      solutionAdoptada: 'Implementación de Capa Adaptadora (Adapter Pattern) en NodeJS con Redis Cache y Mock Server basado en especificación OpenAPI.',
      technicalJustification: 'Se evitó la suspensión del equipo de frontend, ahorrando 12 días-hombre de improductividad. Continuidad del sprint asegurada sin costos adicionales al presupuesto.',
      resultText: 'RESUELTO — Sin impacto en costo ni cronograma',
      status: 'CERRADO',
      ccbDecision: 'Aprobado por Unanimidad'
    },
    {
      id: 'RFC-002',
      badge: 'IMP-002',
      title: 'Cierre Imprevisto del Túnel Secundario por Obras Viales',
      type: 'Operativo / Infraestructura Física',
      accent: 'amber-accent',
      detectionDate: 'Semana 6',
      responsible: 'Project Manager / Scrum Master',
      impactLevel: 'ALTO',
      impactText: 'Bloqueo de acceso físico al túnel por 10 días hábiles',
      problemDescription: 'La alcaldía decretó obras viales de emergencia por socavón en la calzada, suspendiendo todo acceso técnico al túnel secundario.',
      alternatives: [
        { label: 'A) Esperar reapertura del túnel', status: 'Rechazada', reason: 'Retraso directo de 10 días en hito H3' },
        { label: 'B) Solicitar excepción municipal', status: 'Rechazada', reason: 'Riesgo legal y de seguridad inaceptable' },
        { label: 'C) Fast-Tracking + Replanificación ágil', status: 'Aprobada', reason: 'Adelantar Sprint 4 mientras se resuelve el bloqueo' }
      ],
      solutionAdoptada: 'Se pospuso la calibración física y se adelantaron tareas del Sprint 4: Módulo de Mantenimiento y pruebas de estrés con 100.000 lecturas simuladas en la nube.',
      technicalJustification: 'Al finalizar la obra vial municipal, el software estaba completamente listo para integración directa, absorbiendo los 10 días de bloqueo sin desplazar la fecha de H3.',
      resultText: 'RESUELTO — Cronograma maestro preservado',
      status: 'CERRADO',
      ccbDecision: 'Aprobado por Unanimidad'
    },
    {
      id: 'RFC-003',
      badge: 'IMP-003',
      title: 'Cumplimiento Sobrevenido de Directiva de Ciberseguridad NIS2',
      type: 'Normativo / Gobernanza UE',
      accent: 'blue-accent',
      detectionDate: 'Semana 7',
      responsible: 'Comité de Control de Cambios (CCB)',
      impactLevel: 'ALTO',
      impactText: '+40 horas de desarrollo en robustecimiento criptográfico',
      problemDescription: 'Auditoría UE notificó obligatoriedad de certificar bajo Directiva NIS2: autenticación mTLS, cifrado AES-256 en tránsito y reposo, y trazabilidad criptográfica.',
      alternatives: [
        { label: 'A) Ampliar presupuesto y plazo', status: 'Rechazada', reason: 'BAC fijo en €150.000, plazo contractual vinculante' },
        { label: 'B) Implementación parcial de NIS2', status: 'Rechazada', reason: 'No cumple requisitos para liberación de fondos UE' },
        { label: 'C) MoSCoW: Reasignar horas y usar contingencia', status: 'Aprobada', reason: 'Cumplimiento 100% regulatorio sin alterar la fecha final' }
      ],
      solutionAdoptada: 'Asignación de 40 horas en ciberseguridad. Funcionalidad no crítica de exportación 3D CAD trasladada a fase post-proyecto mediante priorización MoSCoW. Costo de consultoría cubierto con reserva.',
      technicalJustification: 'Se garantizó el 100% del cumplimiento regulatorio vinculante para la liberación de los fondos europeos, preservando la línea base.',
      resultText: 'RESUELTO — Fondos UE asegurados',
      status: 'CERRADO',
      ccbDecision: 'Aprobado por Unanimidad'
    }
  ],
  risks: [
    {
      id: 'R1',
      title: 'Inestabilidad API del proveedor IoT',
      type: 'Técnico',
      typeClass: 'red-tag',
      prob: 'Alta',
      impact: 'Alto',
      criticality: 'ALTA',
      mitigationPlan: 'Contrato OpenAPI estricto, mock server permanente y capa adaptadora.',
      contingencyPlan: 'Conmutación automática a mock server + escalación a dirección del proveedor.',
      status: 'Mitigado',
      statusClass: 'green'
    },
    {
      id: 'R2',
      title: 'Bloqueo físico de acceso a túneles',
      type: 'Operativo',
      typeClass: 'amber-tag',
      prob: 'Media',
      impact: 'Alto',
      criticality: 'ALTA',
      mitigationPlan: 'Coordinación preventiva con obras públicas municipales.',
      contingencyPlan: 'Fast-Tracking + simulación en la nube + reordenamiento de backlog.',
      status: 'Mitigado',
      statusClass: 'green'
    },
    {
      id: 'R3',
      title: 'Regulaciones sobrevenidas (Directiva NIS2)',
      type: 'Normativo',
      typeClass: 'blue-tag',
      prob: 'Baja',
      impact: 'Alto',
      criticality: 'MEDIA',
      mitigationPlan: 'Arquitectura alineada preventivamente con estándares ISO 27001 / NIS2.',
      contingencyPlan: 'MoSCoW scope management + consumo de reserva de contingencia (€1.500).',
      status: 'Mitigado',
      statusClass: 'green'
    },
    {
      id: 'R4',
      title: 'Dependencia de autorizaciones municipales para H4',
      type: 'Externo',
      typeClass: 'amber-tag',
      prob: 'Media',
      impact: 'Medio',
      criticality: 'MEDIA',
      mitigationPlan: 'Ingreso anticipado de solicitudes de cierre nocturno con 3 semanas de holgura.',
      contingencyPlan: 'Pruebas concurrentes en túnel secundario sin corte de tránsito general.',
      status: 'En Curso',
      statusClass: 'amber'
    },
    {
      id: 'R5',
      title: 'Concentración de conocimiento NIS2 en un único especialista',
      type: 'Recursos',
      typeClass: 'purple-tag',
      prob: 'Media',
      impact: 'Alto',
      criticality: 'ALTA',
      mitigationPlan: 'Documentación técnica exhaustiva y sesiones de transferencia cruzada de conocimiento.',
      contingencyPlan: 'Contrato marco de respaldo con consultora externa de ciberseguridad.',
      status: 'En Curso',
      statusClass: 'amber'
    },
    {
      id: 'R6',
      title: 'Margen ajustado entre H4 y H5 (1 semana de holgura)',
      type: 'Cronograma',
      typeClass: 'red-tag',
      prob: 'Baja',
      impact: 'Crítico',
      criticality: 'ALTA',
      mitigationPlan: 'Inicio temprano de pruebas de estrés en paralelo con el despliegue del módulo ITIL.',
      contingencyPlan: 'Crashing controlado en turnos de fines de semana financiado con reserva.',
      status: 'Monitoreo',
      statusClass: 'amber'
    }
  ],
  tasks: [
    { name: 'Diseño Arquitectura Cloud', startWeek: 1, endWeek: 2, isCritical: true, milestone: 'H1' },
    { name: 'Integración API IoT', startWeek: 2, endWeek: 3, isCritical: true, milestone: 'H1' },
    { name: 'Motor de Umbrales y Reglas', startWeek: 3, endWeek: 5, isCritical: true, milestone: 'H2' },
    { name: 'Capa Adaptadora (RFC-001)', startWeek: 4, endWeek: 5, isCritical: false, milestone: 'RFC-001' },
    { name: 'Dashboard React + GIS WebGL', startWeek: 5, endWeek: 8, isCritical: true, milestone: 'H3' },
    { name: 'Fast-Tracking: Módulo ITIL (RFC-002)', startWeek: 6, endWeek: 7, isCritical: false, milestone: 'RFC-002' },
    { name: 'Calibración Física en Túnel Secundario', startWeek: 8, endWeek: 9, isCritical: true, milestone: 'H3' },
    { name: 'Módulo Mantenimiento y Cuadrillas', startWeek: 9, endWeek: 11, isCritical: true, milestone: 'H4' },
    { name: 'Escalado y Despliegue Túnel Principal', startWeek: 10, endWeek: 12, isCritical: true, milestone: 'H4' },
    { name: 'Pruebas de Estrés y Simulación de Carga', startWeek: 11, endWeek: 13, isCritical: false, milestone: 'H5' },
    { name: 'Auditoría y Certificación NIS2 (RFC-003)', startWeek: 12, endWeek: 13, isCritical: false, milestone: 'RFC-003' },
    { name: 'Aceptación Final y Cierre Contractual', startWeek: 13, endWeek: 14, isCritical: true, milestone: 'H5' }
  ],
  reports: [
    {
      id: 'INF-001',
      title: 'Informe Quincenal de Avance y Estado EVM — Cierre Semana 8',
      type: 'Ejecutivo',
      author: 'Ing. Salazar (Lead PMO)',
      date: '2026-10-20',
      week: 8,
      status: 'Aprobado',
      priority: 'Alta',
      summary: 'El proyecto de Monitoreo de Infraestructuras Críticas alcanza el 56.9% de avance físico real con un CPI de 1.046 y un SPI de 0.976. Se proyecta un superávit de €7.916 al cierre contractual.',
      findings: '1. Rendimiento financiero favorable (+€3.470 de variación de costo CV favorable).\n2. El leve desfase de cronograma (-€2.044 SV) se encuentra contenido y no compromete el hito crítico H4.\n3. Los tres imprevistos mayores (RFC-001, RFC-002, RFC-003) fueron absorbidos exitosamente sin costo presupuestario adicional.',
      agreements: '1. Autorizar el inicio de las pruebas de calibración en túnel secundario.\n2. Mantener la reserva de contingencia con saldo remanente de €10.950.\n3. Validar con la alcaldía el cronograma de corte nocturno para H4.',
      nextSteps: 'Despliegue de cuadrillas para pruebas de estrés de 100.000 lecturas/segundo y formalización del acta de mitigación de la directiva NIS2.'
    },
    {
      id: 'INF-002',
      title: 'Acta Extraordinaria CCB: Aprobación RFC-001/002/003',
      type: 'Acta CCB',
      author: 'Comité de Control de Cambios',
      date: '2026-10-15',
      week: 7,
      status: 'Aprobado',
      priority: 'Alta',
      summary: 'Dictamen formal y unánime del CCB respecto a las soluciones de contingencia aplicadas ante fallas de API externa, cierre de túnel secundario y normativa NIS2.',
      findings: 'La estrategia de Adapter Pattern en NodeJS y Mock Server desacopló el frontend sin coste adicional. La técnica de Fast-Tracking absorbió el cierre vial de 10 días.',
      agreements: 'Ratificar por unanimidad las resoluciones técnicas. El presupuesto BAC se mantiene inalterado en €150.000 y el plazo final en 14 semanas.',
      nextSteps: 'Cierre formal de los expedientes RFC en el repositorio de auditoría europea.'
    },
    {
      id: 'INF-003',
      title: 'Auditoría Técnica y Dictamen de Conformidad Directiva NIS2',
      type: 'Auditoría',
      author: 'Consultor Ciberseguridad & Arquitectura Cloud',
      date: '2026-10-18',
      week: 8,
      status: 'Publicado',
      priority: 'Alta',
      summary: 'Informe técnico de verificación criptográfica conforme a los requerimientos de la Directiva de Ciberseguridad de la Unión Europea (NIS2).',
      findings: 'Se verificó autenticación mutua mTLS en endpoints de telemetría, cifrado AES-256 en reposo para bases de datos PostgreSQL/TimescaleDB y trazabilidad en logs inmutables.',
      agreements: 'El sistema cumple con el 100% de los criterios exigidos para la liberación de los fondos europeos de infraestructura crítica.',
      nextSteps: 'Entrega del dossier técnico a la entidad auditora comunitaria para visto bueno formal.'
    }
  ],
  budgetDistribution: {
    labels: ['Personal y Equipo (71.4%)', 'Cloud e Infraestructura (15.3%)', 'Reserva de Contingencia (8.3%)', 'Licencias y Auditoría (5.0%)'],
    amounts: [107100, 22950, 12450, 7500]
  },
  resourceProfiles: {
    labels: ['Lead Developer Fullstack (35.8%)', 'Arquitecto Cloud & Ciber (26.9%)', 'Project Manager PMP (16.8%)', 'QA Automation (11.2%)', 'Consultor Ciberseguridad (9.2%)'],
    amounts: [38400, 28800, 18000, 12000, 9900]
  }
};

// 2. GESTIÓN DEL ESTADO CON LOCALSTORAGE
class PMODataManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Garantizar retrocompatibilidad con esquemas anteriores
        if (!parsed.reports) parsed.reports = JSON.parse(JSON.stringify(DEFAULT_DATA.reports));
        if (!parsed.telemetry) parsed.telemetry = JSON.parse(JSON.stringify(DEFAULT_DATA.telemetry));
        return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo localStorage, usando valores predeterminados:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.saveData();
  }

  // Cálculos EVM reactivos
  getCalculatedEVM() {
    const { BAC, PV, EV, AC, currentWeek, totalWeeks } = this.data.evm;
    const CV = EV - AC;
    const SV = EV - PV;
    const CPI = AC > 0 ? Number((EV / AC).toFixed(3)) : 1.0;
    const SPI = PV > 0 ? Number((EV / PV).toFixed(3)) : 1.0;
    const EAC = CPI > 0 ? Math.round(BAC / CPI) : BAC;
    const VAC = BAC - EAC;
    const workRemaining = BAC - EV;
    const fundsRemaining = BAC - AC;
    const TCPI = fundsRemaining > 0 ? Number((workRemaining / fundsRemaining).toFixed(3)) : 1.0;

    return {
      BAC, PV, EV, AC, currentWeek, totalWeeks,
      CV, SV, CPI, SPI, EAC, VAC, TCPI
    };
  }

  // Operaciones de RFC
  addRFC(rfc) {
    this.data.rfcs.unshift(rfc);
    this.saveData();
  }

  updateRFC(id, updatedRfc) {
    const idx = this.data.rfcs.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.rfcs[idx] = { ...this.data.rfcs[idx], ...updatedRfc };
      this.saveData();
      return true;
    }
    return false;
  }

  deleteRFC(id) {
    this.data.rfcs = this.data.rfcs.filter(r => r.id !== id);
    this.saveData();
  }

  getRFC(id) {
    return this.data.rfcs.find(r => r.id === id);
  }

  // Operaciones de Riesgos
  addRisk(risk) {
    this.data.risks.unshift(risk);
    this.saveData();
  }

  updateRisk(id, updatedRisk) {
    const idx = this.data.risks.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.risks[idx] = { ...this.data.risks[idx], ...updatedRisk };
      this.saveData();
      return true;
    }
    return false;
  }

  deleteRisk(id) {
    this.data.risks = this.data.risks.filter(r => r.id !== id);
    this.saveData();
  }

  getRisk(id) {
    return this.data.risks.find(r => r.id === id);
  }

  // Operaciones de Tareas de Cronograma
  addTask(task) {
    this.data.tasks.push(task);
    this.saveData();
  }

  updateTask(index, updatedTask) {
    if (index >= 0 && index < this.data.tasks.length) {
      this.data.tasks[index] = { ...this.data.tasks[index], ...updatedTask };
      this.saveData();
      return true;
    }
    return false;
  }

  deleteTask(index) {
    if (index >= 0 && index < this.data.tasks.length) {
      this.data.tasks.splice(index, 1);
      this.saveData();
    }
  }

  // Operaciones de Informes / Reportes Manuales
  addReport(report) {
    if (!this.data.reports) this.data.reports = [];
    this.data.reports.unshift(report);
    this.saveData();
  }

  updateReport(id, updatedReport) {
    if (!this.data.reports) this.data.reports = [];
    const idx = this.data.reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.reports[idx] = { ...this.data.reports[idx], ...updatedReport };
      this.saveData();
      return true;
    }
    return false;
  }

  deleteReport(id) {
    if (!this.data.reports) return;
    this.data.reports = this.data.reports.filter(r => r.id !== id);
    this.saveData();
  }

  getReport(id) {
    if (!this.data.reports) return null;
    return this.data.reports.find(r => r.id === id);
  }

  // Actualización de Telemetría Técnica
  updateTelemetry(metrics) {
    this.data.telemetry = { ...this.data.telemetry, ...metrics };
    this.saveData();
  }

  // Actualización de Métricas EVM
  updateEVM(metrics) {
    this.data.evm = { ...this.data.evm, ...metrics };
    this.saveData();
  }

  // Exportar / Importar JSON
  exportDataJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importDataJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.evm && parsed.rfcs) {
        this.data = parsed;
        if (!this.data.reports) this.data.reports = JSON.parse(JSON.stringify(DEFAULT_DATA.reports));
        if (!this.data.telemetry) this.data.telemetry = JSON.parse(JSON.stringify(DEFAULT_DATA.telemetry));
        this.saveData();
        return true;
      }
    } catch (e) {
      console.error('Error importando JSON:', e);
    }
    return false;
  }
}

// Instancia global
window.PMO_DATA_STORE = new PMODataManager();
