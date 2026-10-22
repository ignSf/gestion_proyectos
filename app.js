/**
 * ====================================================================
 * PMO Control Center — Lógica de Interacción, Simulación y CRUD Dinámico
 * Infraestructuras Críticas — Caso N°6 (GPY1102)
 *
 * Arquitectura 100% interactiva: permite agregar, editar y eliminar
 * eventos, riesgos, tareas, informes manuales y telemetría en tiempo real.
 * ====================================================================
 */

// ESTADO DE NAVEGACIÓN Y REPORTES
const PMO_APP = {
  activeSection: 'dashboard',
  sidebarOpen: false,
  charts: {},
  currentReportType: 'ejecutivo',
  reportsSubTab: 'manual', // 'manual' | 'auto'
  isEditingReportPreview: false,
  currentPreviewReportId: null
};

// ====================================================================
// 1. INICIALIZACIÓN
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderAllDynamicComponents();
  initCharts();
  runSimulation();
  setupKeyboardShortcuts();
  setupTelemetryHeartbeat();
});

/**
 * Renderiza todos los componentes dependientes de datos
 */
function renderAllDynamicComponents() {
  renderEVMMetrics();
  renderRFCCards();
  renderRFCTraceabilityTable();
  renderRiskTable();
  renderRiskMatrix();
  renderGanttTasks();
  renderManualReports();
  renderTelemetryMetrics();
}

// ====================================================================
// 2. NAVEGACIÓN
// ====================================================================

function navigateTo(sectionId, element) {
  PMO_APP.activeSection = sectionId;

  // Menú lateral
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  } else {
    const targetLink = document.querySelector(`.sidebar-nav .nav-item[data-section="${sectionId}"]`);
    if (targetLink) targetLink.classList.add('active');
  }

  // Activar sección
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.classList.remove('active'));

  const targetSection = document.getElementById(`section-${sectionId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Título superior
  const titles = {
    'dashboard': 'Dashboard Ejecutivo',
    'monitoreo': 'Monitoreo & Control del Sistema',
    'cambios': 'Gestión del Cambio & RFCs',
    'recursos': 'Gestión de Recursos & Productividad',
    'eventualidades': 'Gestión de Riesgos & Eventualidades',
    'financiero': 'Control Financiero & EVM',
    'rutacritica': 'Ruta Crítica & Carta Gantt',
    'estado': 'Estado General del Proyecto',
    'reportes': 'Centro de Reportes & Gestión Documental',
    'alertas': 'Sistema de Alertas & Gobernanza'
  };

  const titleEl = document.getElementById('pageTitle');
  if (titleEl && titles[sectionId]) {
    titleEl.textContent = titles[sectionId];
  }

  // Cerrar sidebar en móvil
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    PMO_APP.sidebarOpen = false;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    resizeAllCharts();
  }, 100);
}

function initNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(`section-${hash}`)) {
    navigateTo(hash);
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  if (!sidebar) return;

  PMO_APP.sidebarOpen = !PMO_APP.sidebarOpen;
  sidebar.classList.toggle('open');
  if (mainContent) {
    mainContent.classList.toggle('sidebar-closed');
  }
}

// ====================================================================
// 3. RENDERIZADO DINÁMICO DE MÉTRICAS EVM
// ====================================================================

function renderEVMMetrics() {
  const store = window.PMO_DATA_STORE;
  if (!store) return;
  const evm = store.getCalculatedEVM();

  // 1. Dashboard KPI Cards
  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setEl('kpiCpiVal', evm.CPI.toFixed(3));
  setEl('kpiSpiVal', evm.SPI.toFixed(3));
  setEl('kpiBacVal', `€${evm.BAC.toLocaleString('es-ES')}`);
  setEl('kpiAcVal', `€${evm.AC.toLocaleString('es-ES')}`);
  
  const progressPercent = evm.BAC > 0 ? ((evm.EV / evm.BAC) * 100).toFixed(1) : 0;
  setEl('kpiProgressVal', `${progressPercent}%`);

  const kpiVac = document.getElementById('kpiVacVal');
  if (kpiVac) {
    const prefix = evm.VAC >= 0 ? '+€' : '-€';
    kpiVac.textContent = `${prefix}${Math.abs(evm.VAC).toLocaleString('es-ES')}`;
    kpiVac.style.color = evm.VAC >= 0 ? '#10b981' : '#ef4444';
  }

  // 2. Financial EVM Table Elements
  setEl('evmTableBAC', `€${evm.BAC.toLocaleString('es-ES')}`);
  setEl('evmTablePV', `€${evm.PV.toLocaleString('es-ES')}`);
  setEl('evmTableEV', `€${evm.EV.toLocaleString('es-ES')}`);
  setEl('evmTableAC', `€${evm.AC.toLocaleString('es-ES')}`);
  setEl('evmTableCV', `${evm.CV >= 0 ? '+' : ''}€${evm.CV.toLocaleString('es-ES')}`);
  setEl('evmTableSV', `${evm.SV >= 0 ? '+' : ''}€${evm.SV.toLocaleString('es-ES')}`);
  setEl('evmTableCPI', evm.CPI.toFixed(3));
  setEl('evmTableSPI', evm.SPI.toFixed(3));
  setEl('evmTableEAC', `€${evm.EAC.toLocaleString('es-ES')}`);
  setEl('evmTableVAC', `${evm.VAC >= 0 ? '+' : ''}€${evm.VAC.toLocaleString('es-ES')}`);
  setEl('evmTableTCPI', evm.TCPI.toFixed(3));

  // 3. Topbar week display
  const weekDisplay = document.getElementById('topbarWeekDisplay');
  if (weekDisplay) {
    weekDisplay.textContent = `Semana ${evm.currentWeek} de ${evm.totalWeeks} — Corte de Gestión`;
  }
}

// ====================================================================
// 4. TELEMETRÍA TÉCNICA Y MONITOREO
// ====================================================================

function renderTelemetryMetrics() {
  const store = window.PMO_DATA_STORE;
  if (!store || !store.data.telemetry) return;
  const t = store.data.telemetry;

  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setEl('telemetryUptime', `${t.uptime}%`);
  setEl('telemetryLatency', `${t.latency}s`);
  setEl('telemetryTestCoverage', `${t.testCoverage}%`);
  setEl('telemetrySensors', `${t.activeSensors}`);
  setEl('telemetryErrorRate', `${t.errorRate}%`);
  setEl('globalStatusText', t.statusText || 'Proyecto Saludable');

  const dot = document.getElementById('globalStatusDot');
  if (dot) {
    dot.className = `status-dot ${t.statusClass || 'green'}`;
  }
}

// ====================================================================
// 5. SOLICITUDES DE CAMBIO (RFC) — CRUD COMPLETO
// ====================================================================

function renderRFCCards() {
  const container = document.getElementById('rfcCardsContainer');
  if (!container) return;
  const store = window.PMO_DATA_STORE;
  const rfcs = store.data.rfcs;

  if (rfcs.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px; color: var(--text-muted);">
        <p>No hay solicitudes de cambio registradas en el sistema.</p>
        <button class="btn btn-primary btn-sm" onclick="openNewRfcModal()">+ Registrar Primera Solicitud (RFC)</button>
      </div>
    `;
    return;
  }

  container.innerHTML = rfcs.map(rfc => `
    <div class="incident-card">
      <div class="inc-header ${rfc.accent || 'blue-accent'}" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="inc-badge">${rfc.badge || rfc.id}</div>
          <h4 style="margin:0;">${rfc.title}</h4>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="inc-type">${rfc.type}</span>
          <button class="edit-action-btn" onclick="openEditRfcModal('${rfc.id}')" title="Editar este evento">Editar</button>
          <button class="delete-action-btn" onclick="confirmDeleteRFC('${rfc.id}')" title="Eliminar este evento">Eliminar</button>
        </div>
      </div>
      <div class="inc-body">
        <div class="inc-grid">
          <div class="inc-field">
            <label>Fecha de Detección</label>
            <span>${rfc.detectionDate}</span>
          </div>
          <div class="inc-field">
            <label>Responsable</label>
            <span>${rfc.responsible}</span>
          </div>
          <div class="inc-field">
            <label>Nivel de Impacto</label>
            <span class="impact-high">${rfc.impactLevel} — ${rfc.impactText}</span>
          </div>
          <div class="inc-field full">
            <label>Problema Detectado / Causa Raíz</label>
            <span>${rfc.problemDescription}</span>
          </div>
          ${rfc.alternatives && rfc.alternatives.length ? `
          <div class="inc-field full">
            <label>Alternativas Evaluadas</label>
            <div class="alternatives">
              ${rfc.alternatives.map(alt => `
                <div class="alt-option ${alt.status === 'Aprobada' ? 'approved' : 'rejected'}">
                  <span class="alt-label">${alt.label}</span>
                  <span class="alt-result">[${alt.status}] — ${alt.reason}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          <div class="inc-field full">
            <label>Solución Adoptada</label>
            <span>${rfc.solutionAdoptada}</span>
          </div>
          <div class="inc-field full">
            <label>Justificación Técnica y Dictamen CCB</label>
            <span>${rfc.technicalJustification}</span>
          </div>
          <div class="inc-field">
            <label>Resultado</label>
            <span class="result-success">${rfc.resultText}</span>
          </div>
          <div class="inc-field">
            <label>Estado Oficial</label>
            <span class="status-resolved">${rfc.status}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderRFCTraceabilityTable() {
  const tbody = document.getElementById('rfcTraceabilityBody');
  if (!tbody) return;
  const store = window.PMO_DATA_STORE;
  const rfcs = store.data.rfcs;

  tbody.innerHTML = rfcs.map(rfc => `
    <tr>
      <td><strong>${rfc.id}</strong></td>
      <td><span class="tag ${rfc.type.includes('Técnico') ? 'red-tag' : rfc.type.includes('Operativo') ? 'amber-tag' : 'blue-tag'}">${rfc.type.split('/')[0].trim()}</span></td>
      <td>${rfc.title}</td>
      <td>${rfc.detectionDate}</td>
      <td>${rfc.impactLevel}</td>
      <td>${rfc.ccbDecision || 'Aprobado'}</td>
      <td><span class="status-pill ${rfc.status === 'CERRADO' ? 'green' : 'amber'}">${rfc.status}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="edit-action-btn" onclick="openEditRfcModal('${rfc.id}')">Editar</button>
          <button class="delete-action-btn" onclick="confirmDeleteRFC('${rfc.id}')">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openNewRfcModal() {
  const modal = document.getElementById('modalRfc');
  if (modal) {
    document.getElementById('rfcEditingId').value = '';
    document.getElementById('rfcModalTitle').textContent = 'Registrar Nueva Solicitud de Cambio (RFC)';
    const nextNum = window.PMO_DATA_STORE.data.rfcs.length + 1;
    document.getElementById('rfcCode').value = `RFC-00${nextNum}`;
    document.getElementById('rfcBadge').value = `IMP-00${nextNum}`;
    document.getElementById('rfcTitle').value = '';
    document.getElementById('rfcType').value = 'Técnico / Integración Externa';
    document.getElementById('rfcResponsible').value = '';
    document.getElementById('rfcImpact').value = 'ALTO';
    document.getElementById('rfcImpactText').value = '';
    document.getElementById('rfcProblem').value = '';
    document.getElementById('rfcSolution').value = '';
    document.getElementById('rfcJustification').value = '';
    document.getElementById('rfcStatus').value = 'EN EVALUACIÓN';
    modal.classList.add('active');
  }
}

function openEditRfcModal(id) {
  const rfc = window.PMO_DATA_STORE.getRFC(id);
  if (!rfc) return;
  const modal = document.getElementById('modalRfc');
  if (modal) {
    document.getElementById('rfcEditingId').value = id;
    document.getElementById('rfcModalTitle').textContent = `Editar Solicitud ${id}`;
    document.getElementById('rfcCode').value = rfc.id;
    document.getElementById('rfcBadge').value = rfc.badge || rfc.id;
    document.getElementById('rfcTitle').value = rfc.title;
    document.getElementById('rfcType').value = rfc.type;
    document.getElementById('rfcResponsible').value = rfc.responsible;
    document.getElementById('rfcImpact').value = rfc.impactLevel;
    document.getElementById('rfcImpactText').value = rfc.impactText || '';
    document.getElementById('rfcProblem').value = rfc.problemDescription || '';
    document.getElementById('rfcSolution').value = rfc.solutionAdoptada || '';
    document.getElementById('rfcJustification').value = rfc.technicalJustification || '';
    document.getElementById('rfcStatus').value = rfc.status;
    modal.classList.add('active');
  }
}

function closeNewRfcModal() {
  document.getElementById('modalRfc')?.classList.remove('active');
}

function submitNewRfc(e) {
  if (e) e.preventDefault();

  const editingId = document.getElementById('rfcEditingId').value.trim();
  const id = document.getElementById('rfcCode').value.trim();
  const badge = document.getElementById('rfcBadge').value.trim() || id;
  const title = document.getElementById('rfcTitle').value.trim();
  const type = document.getElementById('rfcType').value;
  const responsible = document.getElementById('rfcResponsible').value.trim();
  const impactLevel = document.getElementById('rfcImpact').value;
  const impactText = document.getElementById('rfcImpactText').value.trim();
  const problemDescription = document.getElementById('rfcProblem').value.trim();
  const solutionAdoptada = document.getElementById('rfcSolution').value.trim();
  const technicalJustification = document.getElementById('rfcJustification').value.trim();
  const status = document.getElementById('rfcStatus').value;

  if (!title || !problemDescription || !solutionAdoptada) {
    showToast('Por favor complete los campos obligatorios del RFC.', 'error');
    return;
  }

  const rfcPayload = {
    id, badge, title, type,
    accent: impactLevel === 'CRÍTICO' || impactLevel === 'ALTO' ? 'red-accent' : 'blue-accent',
    detectionDate: editingId ? (window.PMO_DATA_STORE.getRFC(editingId)?.detectionDate || 'Semana 8') : `Semana ${window.PMO_DATA_STORE.data.evm.currentWeek}`,
    responsible, impactLevel, impactText,
    problemDescription,
    alternatives: [
      { label: 'A) Opción inicial analizada', status: 'Rechazada', reason: 'Impacto desfavorable en plazo' },
      { label: 'B) Solución consensuada con CCB', status: 'Aprobada', reason: 'Alineada con la triple restricción' }
    ],
    solutionAdoptada, technicalJustification,
    resultText: `${status === 'CERRADO' ? 'RESUELTO' : 'EN IMPLEMENTACIÓN'} — Dictamen formal CCB`,
    status,
    ccbDecision: 'Aprobado por Comité'
  };

  if (editingId) {
    window.PMO_DATA_STORE.updateRFC(editingId, rfcPayload);
    showToast(`Solicitud ${id} actualizada satisfactoriamente.`, 'success');
  } else {
    window.PMO_DATA_STORE.addRFC(rfcPayload);
    showToast(`Solicitud ${id} registrada satisfactoriamente.`, 'success');
  }

  renderRFCCards();
  renderRFCTraceabilityTable();
  closeNewRfcModal();
}

function confirmDeleteRFC(id) {
  if (confirm(`¿Confirma que desea eliminar la solicitud ${id}?`)) {
    window.PMO_DATA_STORE.deleteRFC(id);
    renderRFCCards();
    renderRFCTraceabilityTable();
    showToast(`Solicitud ${id} eliminada.`, 'info');
  }
}

// ====================================================================
// 6. GESTIÓN DE RIESGOS — CRUD COMPLETO
// ====================================================================

function renderRiskTable() {
  const tbody = document.getElementById('riskTableBody');
  if (!tbody) return;
  const store = window.PMO_DATA_STORE;
  const risks = store.data.risks;

  tbody.innerHTML = risks.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>${r.title}</td>
      <td><span class="tag ${r.typeClass || 'blue-tag'}">${r.type}</span></td>
      <td>${r.prob}</td>
      <td>${r.impact}</td>
      <td><span class="criticality ${r.criticality === 'ALTA' ? 'high' : 'medium'}">${r.criticality}</span></td>
      <td>${r.mitigationPlan}</td>
      <td>${r.contingencyPlan}</td>
      <td><span class="status-pill ${r.statusClass || 'green'}">${r.status}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="edit-action-btn" onclick="openEditRiskModal('${r.id}')">Editar</button>
          <button class="delete-action-btn" onclick="confirmDeleteRisk('${r.id}')">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderRiskMatrix() {
  const store = window.PMO_DATA_STORE;
  const risks = store.data.risks;

  // Limpiar celdas de matriz
  document.querySelectorAll('.rm-cell').forEach(cell => {
    cell.innerHTML = '';
  });

  const rowMap = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
  const colMap = { 'Bajo': 1, 'Medio': 2, 'Alto': 3, 'Crítico': 4 };

  risks.forEach(r => {
    const rIdx = rowMap[r.prob] || 2;
    const cIdx = colMap[r.impact] || 2;
    const rowEl = document.querySelectorAll('.risk-matrix .rm-row')[rIdx - 1];
    if (rowEl) {
      const cellEl = rowEl.querySelectorAll('.rm-cell')[cIdx - 1];
      if (cellEl) {
        const item = document.createElement('div');
        item.className = 'rm-risk';
        item.title = `${r.id}: ${r.title} [${r.status}] — Haga clic para editar`;
        item.textContent = r.id;
        item.onclick = () => {
          openEditRiskModal(r.id);
        };
        cellEl.appendChild(item);
      }
    }
  });
}

function openNewRiskModal() {
  const modal = document.getElementById('modalRisk');
  if (modal) {
    document.getElementById('riskEditingId').value = '';
    document.getElementById('riskModalTitle').textContent = 'Registrar Nuevo Riesgo en la Matriz';
    const nextNum = window.PMO_DATA_STORE.data.risks.length + 1;
    document.getElementById('riskId').value = `R${nextNum}`;
    document.getElementById('riskTitle').value = '';
    document.getElementById('riskType').value = 'Técnico';
    document.getElementById('riskProb').value = 'Media';
    document.getElementById('riskImpact').value = 'Alto';
    document.getElementById('riskMitigation').value = '';
    document.getElementById('riskContingency').value = '';
    document.getElementById('riskStatus').value = 'En Curso';
    modal.classList.add('active');
  }
}

function openEditRiskModal(id) {
  const risk = window.PMO_DATA_STORE.getRisk(id);
  if (!risk) return;
  const modal = document.getElementById('modalRisk');
  if (modal) {
    document.getElementById('riskEditingId').value = id;
    document.getElementById('riskModalTitle').textContent = `Editar Riesgo ${id}`;
    document.getElementById('riskId').value = risk.id;
    document.getElementById('riskTitle').value = risk.title;
    document.getElementById('riskType').value = risk.type;
    document.getElementById('riskProb').value = risk.prob;
    document.getElementById('riskImpact').value = risk.impact;
    document.getElementById('riskMitigation').value = risk.mitigationPlan;
    document.getElementById('riskContingency').value = risk.contingencyPlan;
    document.getElementById('riskStatus').value = risk.status;
    modal.classList.add('active');
  }
}

function closeNewRiskModal() {
  document.getElementById('modalRisk')?.classList.remove('active');
}

function submitNewRisk(e) {
  if (e) e.preventDefault();

  const editingId = document.getElementById('riskEditingId').value.trim();
  const id = document.getElementById('riskId').value.trim();
  const title = document.getElementById('riskTitle').value.trim();
  const type = document.getElementById('riskType').value;
  const prob = document.getElementById('riskProb').value;
  const impact = document.getElementById('riskImpact').value;
  const mitigationPlan = document.getElementById('riskMitigation').value.trim();
  const contingencyPlan = document.getElementById('riskContingency').value.trim();
  const status = document.getElementById('riskStatus').value;

  if (!title || !mitigationPlan) {
    showToast('Por favor ingrese el título y plan de mitigación del riesgo.', 'error');
    return;
  }

  const criticality = (prob === 'Alta' && (impact === 'Alto' || impact === 'Crítico')) ? 'ALTA' : (prob === 'Baja' && impact === 'Bajo') ? 'BAJA' : 'MEDIA';
  const typeClass = type === 'Técnico' ? 'red-tag' : type === 'Operativo' ? 'amber-tag' : 'blue-tag';
  const statusClass = status === 'Mitigado' ? 'green' : status === 'En Curso' ? 'amber' : 'red';

  const riskPayload = {
    id, title, type, typeClass, prob, impact, criticality,
    mitigationPlan, contingencyPlan, status, statusClass
  };

  if (editingId) {
    window.PMO_DATA_STORE.updateRisk(editingId, riskPayload);
    showToast(`Riesgo ${id} actualizado.`, 'success');
  } else {
    window.PMO_DATA_STORE.addRisk(riskPayload);
    showToast(`Riesgo ${id} añadido al registro y matriz.`, 'success');
  }

  renderRiskTable();
  renderRiskMatrix();
  closeNewRiskModal();
}

function confirmDeleteRisk(id) {
  if (confirm(`¿Confirma que desea eliminar el riesgo ${id}?`)) {
    window.PMO_DATA_STORE.deleteRisk(id);
    renderRiskTable();
    renderRiskMatrix();
    showToast(`Riesgo ${id} eliminado.`, 'info');
  }
}

// ====================================================================
// 7. CARTA GANTT & CRONOGRAMA — CRUD COMPLETO
// ====================================================================

function renderGanttTasks() {
  const container = document.getElementById('ganttTasksContainer');
  if (!container) return;
  const store = window.PMO_DATA_STORE;
  const tasks = store.data.tasks;

  container.innerHTML = tasks.map((t, idx) => `
    <div class="gantt-row ${t.isCritical ? 'critical' : ''}">
      <div class="gantt-task-name" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          ${t.isCritical ? '<span class="gantt-marker">[RC]</span>' : '<span style="color:var(--text-muted); margin-right:4px;">·</span>'}
          ${t.name}
        </div>
        <div style="display:flex; gap:4px;">
          <button class="edit-action-btn" style="padding:1px 5px; font-size:10px;" onclick="openEditTaskModal(${idx})" title="Editar actividad">✏️</button>
          <button class="delete-action-btn" style="padding:1px 5px; font-size:10px;" onclick="confirmDeleteTask(${idx})" title="Eliminar actividad">×</button>
        </div>
      </div>
      <div class="gantt-bars">
        <div class="gantt-bar ${t.isCritical ? 'critical-bar' : ''}" style="grid-column: ${t.startWeek} / ${t.endWeek + 1};">
          ${t.milestone || `S${t.startWeek}-S${t.endWeek}`}
        </div>
      </div>
    </div>
  `).join('');
}

function openNewTaskModal() {
  const modal = document.getElementById('modalTask');
  if (modal) {
    document.getElementById('taskEditingIndex').value = '-1';
    document.getElementById('taskModalTitle').textContent = 'Agregar Actividad al Cronograma Gantt';
    document.getElementById('taskName').value = '';
    document.getElementById('taskStart').value = 8;
    document.getElementById('taskEnd').value = 10;
    document.getElementById('taskMilestone').value = 'H4';
    document.getElementById('taskCritical').checked = false;
    modal.classList.add('active');
  }
}

function openEditTaskModal(index) {
  const task = window.PMO_DATA_STORE.data.tasks[index];
  if (!task) return;
  const modal = document.getElementById('modalTask');
  if (modal) {
    document.getElementById('taskEditingIndex').value = index;
    document.getElementById('taskModalTitle').textContent = `Editar Actividad: ${task.name}`;
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskStart').value = task.startWeek;
    document.getElementById('taskEnd').value = task.endWeek;
    document.getElementById('taskMilestone').value = task.milestone || '';
    document.getElementById('taskCritical').checked = !!task.isCritical;
    modal.classList.add('active');
  }
}

function closeNewTaskModal() {
  document.getElementById('modalTask')?.classList.remove('active');
}

function submitNewTask(e) {
  if (e) e.preventDefault();

  const editIndex = parseInt(document.getElementById('taskEditingIndex').value, 10);
  const name = document.getElementById('taskName').value.trim();
  const startWeek = parseInt(document.getElementById('taskStart').value, 10);
  const endWeek = parseInt(document.getElementById('taskEnd').value, 10);
  const isCritical = document.getElementById('taskCritical').checked;
  const milestone = document.getElementById('taskMilestone').value.trim() || `S${startWeek}-S${endWeek}`;

  if (!name || isNaN(startWeek) || isNaN(endWeek) || startWeek > endWeek) {
    showToast('Por favor valide el nombre y el rango de semanas de la actividad.', 'error');
    return;
  }

  const taskPayload = { name, startWeek, endWeek, isCritical, milestone };

  if (editIndex >= 0) {
    window.PMO_DATA_STORE.updateTask(editIndex, taskPayload);
    showToast(`Actividad "${name}" actualizada.`, 'success');
  } else {
    window.PMO_DATA_STORE.addTask(taskPayload);
    showToast(`Actividad "${name}" añadida al cronograma.`, 'success');
  }

  renderGanttTasks();
  closeNewTaskModal();
}

function confirmDeleteTask(index) {
  if (confirm('¿Desea eliminar esta actividad del cronograma maestro?')) {
    window.PMO_DATA_STORE.deleteTask(index);
    renderGanttTasks();
    showToast('Actividad eliminada del cronograma.', 'info');
  }
}

// ====================================================================
// 8. INFORMES Y REPORTES MANUALES — CRUD COMPLETO
// ====================================================================

function switchReportsTab(tabName) {
  PMO_APP.reportsSubTab = tabName;
  const btnManual = document.getElementById('tabBtnManualReports');
  const btnAuto = document.getElementById('tabBtnAutoReports');
  const viewManual = document.getElementById('viewManualReports');
  const viewAuto = document.getElementById('viewAutoReports');

  if (tabName === 'manual') {
    btnManual?.classList.add('active');
    btnAuto?.classList.remove('active');
    if (viewManual) viewManual.style.display = 'block';
    if (viewAuto) viewAuto.style.display = 'none';
  } else {
    btnManual?.classList.remove('active');
    btnAuto?.classList.add('active');
    if (viewManual) viewManual.style.display = 'none';
    if (viewAuto) viewAuto.style.display = 'block';
  }
}

function renderManualReports(filterType = 'all', searchQuery = '') {
  const container = document.getElementById('manualReportsGrid');
  if (!container) return;

  const store = window.PMO_DATA_STORE;
  let reports = store.data.reports || [];

  if (filterType !== 'all') {
    reports = reports.filter(r => r.type === filterType);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    reports = reports.filter(r => r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q));
  }

  if (reports.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p>No se encontraron informes que coincidan con el criterio.</p>
        <button class="btn btn-primary btn-sm" onclick="openNewReportModal()">+ Redactar Nuevo Informe</button>
      </div>
    `;
    return;
  }

  container.innerHTML = reports.map(rep => {
    const statusBadgeClass = rep.status === 'Aprobado' ? 'badge-approved' :
                             rep.status === 'Publicado' ? 'badge-published' :
                             rep.status === 'En Revisión' ? 'badge-review' : 'badge-draft';

    return `
      <div class="manual-report-card">
        <div>
          <div class="report-card-top">
            <span class="report-card-id">${rep.id}</span>
            <span class="status-pill ${statusBadgeClass}">${rep.status}</span>
          </div>
          <h4 class="report-card-title">${rep.title}</h4>
          <div class="report-card-meta">
            <span>👤 ${rep.author}</span>
            <span>📅 ${rep.date || `Semana ${rep.week || 8}`}</span>
            <span>🏷️ ${rep.type}</span>
          </div>
          <p class="report-card-summary" style="margin-top:10px;">${rep.summary}</p>
        </div>
        <div class="report-card-actions">
          <button class="btn btn-primary btn-sm" onclick="viewManualReport('${rep.id}')">👁️ Ver Informe</button>
          <div style="display:flex; gap:6px;">
            <button class="edit-action-btn" onclick="openEditReportModal('${rep.id}')">✏️ Editar</button>
            <button class="delete-action-btn" onclick="confirmDeleteReport('${rep.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openNewReportModal() {
  const modal = document.getElementById('modalReport');
  if (modal) {
    document.getElementById('reportEditingId').value = '';
    document.getElementById('reportModalTitle').textContent = 'Redactar Nuevo Informe de Gestión / Acta';
    const nextNum = (window.PMO_DATA_STORE.data.reports?.length || 0) + 1;
    document.getElementById('reportId').value = `INF-00${nextNum}`;
    document.getElementById('reportInputTitle').value = '';
    document.getElementById('reportType').value = 'Ejecutivo';
    document.getElementById('reportAuthor').value = 'Ing. Salazar (Lead PMO)';
    document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('reportWeek').value = window.PMO_DATA_STORE.data.evm.currentWeek || 8;
    document.getElementById('reportStatus').value = 'Borrador';
    document.getElementById('reportPriority').value = 'Alta';
    document.getElementById('reportSummary').value = '';
    document.getElementById('reportFindings').value = '';
    document.getElementById('reportAgreements').value = '';
    document.getElementById('reportNextSteps').value = '';
    modal.classList.add('active');
  }
}

function openEditReportModal(id) {
  const rep = window.PMO_DATA_STORE.getReport(id);
  if (!rep) return;
  const modal = document.getElementById('modalReport');
  if (modal) {
    document.getElementById('reportEditingId').value = id;
    document.getElementById('reportModalTitle').textContent = `Editar Informe: ${rep.id}`;
    document.getElementById('reportId').value = rep.id;
    document.getElementById('reportInputTitle').value = rep.title;
    document.getElementById('reportType').value = rep.type;
    document.getElementById('reportAuthor').value = rep.author;
    document.getElementById('reportDate').value = rep.date || '';
    document.getElementById('reportWeek').value = rep.week || 8;
    document.getElementById('reportStatus').value = rep.status;
    document.getElementById('reportPriority').value = rep.priority || 'Normal';
    document.getElementById('reportSummary').value = rep.summary || '';
    document.getElementById('reportFindings').value = rep.findings || '';
    document.getElementById('reportAgreements').value = rep.agreements || '';
    document.getElementById('reportNextSteps').value = rep.nextSteps || '';
    modal.classList.add('active');
  }
}

function closeReportModal() {
  document.getElementById('modalReport')?.classList.remove('active');
}

function submitReport(e) {
  if (e) e.preventDefault();

  const editingId = document.getElementById('reportEditingId').value.trim();
  const id = document.getElementById('reportId').value.trim();
  const title = document.getElementById('reportInputTitle').value.trim();
  const type = document.getElementById('reportType').value;
  const author = document.getElementById('reportAuthor').value.trim();
  const date = document.getElementById('reportDate').value;
  const week = parseInt(document.getElementById('reportWeek').value, 10);
  const status = document.getElementById('reportStatus').value;
  const priority = document.getElementById('reportPriority').value;
  const summary = document.getElementById('reportSummary').value.trim();
  const findings = document.getElementById('reportFindings').value.trim();
  const agreements = document.getElementById('reportAgreements').value.trim();
  const nextSteps = document.getElementById('reportNextSteps').value.trim();

  if (!title || !summary) {
    showToast('Por favor ingrese el título y resumen ejecutivo del informe.', 'error');
    return;
  }

  const reportPayload = {
    id, title, type, author, date, week,
    status, priority, summary, findings, agreements, nextSteps
  };

  if (editingId) {
    window.PMO_DATA_STORE.updateReport(editingId, reportPayload);
    showToast(`Informe ${id} actualizado correctamente.`, 'success');
  } else {
    window.PMO_DATA_STORE.addReport(reportPayload);
    showToast(`Informe ${id} guardado y registrado.`, 'success');
  }

  renderManualReports();
  closeReportModal();
}

function confirmDeleteReport(id) {
  if (confirm(`¿Confirma que desea eliminar el informe ${id}?`)) {
    window.PMO_DATA_STORE.deleteReport(id);
    renderManualReports();
    showToast(`Informe ${id} eliminado.`, 'info');
  }
}

function viewManualReport(id) {
  const rep = window.PMO_DATA_STORE.getReport(id);
  if (!rep) return;

  PMO_APP.currentPreviewReportId = id;
  PMO_APP.isEditingReportPreview = false;

  const modal = document.getElementById('reportPreview');
  const titleEl = document.getElementById('reportTitle');
  const bodyEl = document.getElementById('reportBody');

  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = `${rep.id} — ${rep.title}`;

  bodyEl.innerHTML = `
    <div style="font-family: inherit; line-height: 1.6;">
      <div style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 14px 18px; margin-bottom: 20px; border-radius: 4px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="margin:0 0 4px 0; color:#93c5fd;">${rep.type.toUpperCase()} · ${rep.title}</h4>
          <span style="font-size:12.5px; color:#94a3b8;">Autor: <strong>${rep.author}</strong> | Fecha: <strong>${rep.date}</strong> | Semana: <strong>S${rep.week || 8}</strong></span>
        </div>
        <div>
          <span class="status-pill green">${rep.status}</span>
        </div>
      </div>

      <h4 style="color:#f8fafc; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">1. Resumen Ejecutivo</h4>
      <p style="font-size:13.5px; color:#cbd5e1; margin-bottom:18px;">${rep.summary}</p>

      ${rep.findings ? `
      <h4 style="color:#f8fafc; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">2. Diagnóstico & Hallazgos Principales</h4>
      <div style="font-size:13px; color:#cbd5e1; white-space:pre-line; margin-bottom:18px;">${rep.findings}</div>
      ` : ''}

      ${rep.agreements ? `
      <h4 style="color:#f8fafc; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">3. Acuerdos y Decisiones Adoptadas</h4>
      <div style="font-size:13px; color:#cbd5e1; white-space:pre-line; margin-bottom:18px;">${rep.agreements}</div>
      ` : ''}

      ${rep.nextSteps ? `
      <h4 style="color:#f8fafc; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">4. Próximos Pasos & Acciones de Seguimiento</h4>
      <div style="font-size:13px; color:#cbd5e1; white-space:pre-line; margin-bottom:18px;">${rep.nextSteps}</div>
      ` : ''}
    </div>
  `;

  modal.style.display = 'flex';
}

function toggleEditReportPreview() {
  const bodyEl = document.getElementById('reportBody');
  const btn = document.getElementById('btnEditReportPreview');
  if (!bodyEl || !btn) return;

  PMO_APP.isEditingReportPreview = !PMO_APP.isEditingReportPreview;

  if (PMO_APP.isEditingReportPreview) {
    bodyEl.contentEditable = 'true';
    bodyEl.classList.add('report-editable-area');
    btn.textContent = '💾 Guardar Edición';
    btn.style.background = '#10b981';
    showToast('Modo edición en pantalla activado. Escriba o modifique cualquier texto libremente.', 'info');
  } else {
    bodyEl.contentEditable = 'false';
    bodyEl.classList.remove('report-editable-area');
    btn.textContent = '✏️ Editar Contenido en Pantalla';
    btn.style.background = '';
    showToast('Cambios guardados en la vista previa del reporte.', 'success');
  }
}

function exportReportMarkdown() {
  const titleEl = document.getElementById('reportTitle');
  const bodyEl = document.getElementById('reportBody');
  if (!bodyEl) return;

  const content = `# ${titleEl?.textContent || 'Informe'}\n\n${bodyEl.innerText}`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PMO_Informe_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Informe descargado en formato Markdown (.md).', 'success');
}

// ====================================================================
// 9. EDICIÓN DE MÉTRICAS EVM & SIMULACIÓN
// ====================================================================

function openEditMetricsModal() {
  const modal = document.getElementById('modalMetrics');
  if (!modal) return;
  const evm = window.PMO_DATA_STORE.data.evm;

  document.getElementById('inputBAC').value = evm.BAC;
  document.getElementById('inputPV').value = evm.PV;
  document.getElementById('inputEV').value = evm.EV;
  document.getElementById('inputAC').value = evm.AC;
  document.getElementById('inputWeek').value = evm.currentWeek;
  document.getElementById('inputTotalWeeks').value = evm.totalWeeks;

  modal.classList.add('active');
}

function closeEditMetricsModal() {
  document.getElementById('modalMetrics')?.classList.remove('active');
}

function submitEditMetrics(e) {
  if (e) e.preventDefault();

  const BAC = parseFloat(document.getElementById('inputBAC').value);
  const PV = parseFloat(document.getElementById('inputPV').value);
  const EV = parseFloat(document.getElementById('inputEV').value);
  const AC = parseFloat(document.getElementById('inputAC').value);
  const currentWeek = parseInt(document.getElementById('inputWeek').value, 10);
  const totalWeeks = parseInt(document.getElementById('inputTotalWeeks').value, 10);

  if (isNaN(BAC) || isNaN(PV) || isNaN(EV) || isNaN(AC)) {
    showToast('Por favor ingrese valores numéricos válidos en las métricas.', 'error');
    return;
  }

  window.PMO_DATA_STORE.updateEVM({ BAC, PV, EV, AC, currentWeek, totalWeeks });
  renderEVMMetrics();
  updateAllCharts();
  runSimulation();
  closeEditMetricsModal();
  showToast('Métricas EVM, gráficos y proyecciones recalculadas al instante.', 'success');
}

// ====================================================================
// 10. EDICIÓN DE TELEMETRÍA TÉCNICA
// ====================================================================

function openTelemetryModal() {
  const modal = document.getElementById('modalTelemetry');
  if (!modal) return;
  const t = window.PMO_DATA_STORE.data.telemetry;

  document.getElementById('inputUptime').value = t.uptime;
  document.getElementById('inputLatency').value = t.latency;
  document.getElementById('inputTestCoverage').value = t.testCoverage;
  document.getElementById('inputSensors').value = t.activeSensors;
  document.getElementById('inputErrorRate').value = t.errorRate;
  document.getElementById('inputStatusText').value = t.statusText || 'Proyecto Saludable';

  modal.classList.add('active');
}

function closeTelemetryModal() {
  document.getElementById('modalTelemetry')?.classList.remove('active');
}

function submitTelemetry(e) {
  if (e) e.preventDefault();

  const uptime = parseFloat(document.getElementById('inputUptime').value);
  const latency = parseFloat(document.getElementById('inputLatency').value);
  const testCoverage = parseFloat(document.getElementById('inputTestCoverage').value);
  const activeSensors = parseInt(document.getElementById('inputSensors').value, 10);
  const errorRate = parseFloat(document.getElementById('inputErrorRate').value);
  const statusText = document.getElementById('inputStatusText').value.trim();

  if (isNaN(uptime) || isNaN(latency) || isNaN(testCoverage)) {
    showToast('Valores de telemetría numéricos inválidos.', 'error');
    return;
  }

  const statusClass = uptime >= 99.5 && latency <= 5 ? 'green' : uptime >= 98.0 ? 'amber' : 'red';

  window.PMO_DATA_STORE.updateTelemetry({
    uptime, latency, testCoverage, activeSensors, errorRate, statusText, statusClass
  });

  renderTelemetryMetrics();
  closeTelemetryModal();
  showToast('Parámetros de telemetría y monitoreo actualizados.', 'success');
}

// ====================================================================
// 11. RESPALDO Y RESTAURACIÓN DE DATOS (JSON)
// ====================================================================

function exportDataBackup() {
  const dataStr = window.PMO_DATA_STORE.exportDataJSON();
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PMO_Control_Center_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Respaldo de base de datos descargado en JSON.', 'success');
}

function openImportDataModal() {
  const modal = document.getElementById('modalImportData');
  if (modal) {
    document.getElementById('importJsonText').value = '';
    modal.classList.add('active');
  }
}

function closeImportDataModal() {
  document.getElementById('modalImportData')?.classList.remove('active');
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('importJsonText').value = e.target.result;
  };
  reader.readAsText(file);
}

function submitImportData(e) {
  if (e) e.preventDefault();
  const jsonStr = document.getElementById('importJsonText').value.trim();
  if (!jsonStr) {
    showToast('Por favor ingrese o cargue un archivo JSON válido.', 'error');
    return;
  }

  const success = window.PMO_DATA_STORE.importDataJSON(jsonStr);
  if (success) {
    renderAllDynamicComponents();
    updateAllCharts();
    runSimulation();
    closeImportDataModal();
    showToast('Datos importados y aplicados con éxito.', 'success');
  } else {
    showToast('El formato del JSON no es válido para PMO Control Center.', 'error');
  }
}

function resetAllData() {
  if (confirm('¿Desea restablecer todos los datos, eventos, riesgos y métricas al estado oficial del Caso N°6?')) {
    window.PMO_DATA_STORE.resetToDefaults();
    renderAllDynamicComponents();
    updateAllCharts();
    runSimulation();
    showToast('Datos restablecidos al estado inicial del caso.', 'info');
  }
}

// ====================================================================
// 12. GENERADOR DE REPORTES AUTOMÁTICOS
// ====================================================================

function generateReport(reportType) {
  PMO_APP.currentReportType = reportType;
  PMO_APP.currentPreviewReportId = null;
  PMO_APP.isEditingReportPreview = false;

  const modal = document.getElementById('reportPreview');
  const titleEl = document.getElementById('reportTitle');
  const bodyEl = document.getElementById('reportBody');
  const btn = document.getElementById('btnEditReportPreview');
  if (btn) {
    btn.textContent = '✏️ Editar Contenido en Pantalla';
    btn.style.background = '';
  }

  if (!modal || !titleEl || !bodyEl) return;

  bodyEl.contentEditable = 'false';
  bodyEl.classList.remove('report-editable-area');

  let reportHtml = '';
  let titleText = '';

  switch (reportType) {
    case 'ejecutivo':
      titleText = 'Informe Ejecutivo Consolidado — Dirección PMO';
      reportHtml = buildExecutiveReport();
      break;
    case 'financiero':
      titleText = 'Auditoría Financiera y Gestión del Valor Ganado (EVM)';
      reportHtml = buildFinancialReport();
      break;
    case 'tecnico':
      titleText = 'Dossier Técnico, Arquitectura y Calidad de Software';
      reportHtml = buildTechnicalReport();
      break;
    case 'riesgos':
      titleText = 'Matriz Integral de Riesgos y Eventualidades';
      reportHtml = buildRiskReport();
      break;
    case 'cambios':
      titleText = 'Libro Oficial de Control de Cambios (RFCs) & CCB';
      reportHtml = buildChangeReport();
      break;
    case 'avance':
      titleText = 'Acta de Avance de Hitos y Entregables del Proyecto';
      reportHtml = buildProgressReport();
      break;
    default:
      titleText = 'Reporte del Proyecto';
      reportHtml = '<p>Reporte generado automáticamente por la plataforma PMO.</p>';
  }

  titleEl.textContent = titleText;
  bodyEl.innerHTML = reportHtml;
  modal.style.display = 'flex';

  showToast(`Reporte "${titleText}" compilado con éxito.`, 'info');
}

function closeReport() {
  const modal = document.getElementById('reportPreview');
  if (modal) modal.style.display = 'none';
}

function printReport() {
  window.print();
}

function copyReportText() {
  const bodyEl = document.getElementById('reportBody');
  if (!bodyEl) return;
  navigator.clipboard.writeText(bodyEl.innerText).then(() => {
    showToast('Informe copiado al portapapeles.', 'success');
  }).catch(() => {
    showToast('No se pudo acceder al portapapeles.', 'error');
  });
}

function exportReportCSV() {
  const evm = window.PMO_DATA_STORE.getCalculatedEVM();
  const csvContent = "data:text/csv;charset=utf-8,"
    + "Metrica,Valor,Unidad,Estado\n"
    + `Presupuesto Base (BAC),${evm.BAC},EUR,Aprobado\n`
    + `Valor Planificado (PV),${evm.PV},EUR,Semana ${evm.currentWeek}\n`
    + `Valor Ganado (EV),${evm.EV},EUR,Semana ${evm.currentWeek}\n`
    + `Costo Actual (AC),${evm.AC},EUR,Semana ${evm.currentWeek}\n`
    + `Variacion de Costo (CV),${evm.CV},EUR,Superavit\n`
    + `Variacion de Cronograma (SV),${evm.SV},EUR,Desfase controlado\n`
    + `Indice de Eficiencia Costo (CPI),${evm.CPI},Ratio,Favorable\n`
    + `Indice de Cronograma (SPI),${evm.SPI},Ratio,En recuperacion\n`
    + `Estimacion a la Conclusion (EAC),${evm.EAC},EUR,Proyectado\n`
    + `Variacion a la Conclusion (VAC),${evm.VAC},EUR,Superavit Proyectado\n`
    + `Indice de Rendimiento por Cumplir (TCPI),${evm.TCPI},Ratio,Factible`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `PMO_Reporte_${PMO_APP.currentReportType}_S${evm.currentWeek}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Archivo CSV generado y descargado.', 'info');
}

// Constructores de reportes automáticos
function buildExecutiveReport() {
  const evm = window.PMO_DATA_STORE.getCalculatedEVM();
  return `
    <div style="font-family: inherit; line-height: 1.6;">
      <div style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
        <h4 style="margin: 0 0 6px 0; color: #93c5fd;">Resumen Ejecutivo de Gestión — Corte Semana ${evm.currentWeek} de ${evm.totalWeeks}</h4>
        <p style="margin: 0; font-size: 13px;">Proyecto: <strong>Plataforma Inteligente de Monitoreo y Control de Túneles</strong> · Caso N°6 · Fondos NextGenerationEU.</p>
      </div>

      <h4 style="color: #f8fafc; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">1. Diagnóstico de la Triple Restricción</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <thead>
          <tr style="background: rgba(255,255,255,0.05); text-align: left;">
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Dimensión</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Línea Base</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Estado al Corte</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Semáforo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);"><strong>Alcance</strong></td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">5 Hitos, 14 Entregables WBS</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">H1 y H2 al 100% aceptados; H3 en fase final</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); color: #10b981; font-weight: bold;">VERDE (Conforme)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);"><strong>Costo (Presupuesto)</strong></td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">€${evm.BAC.toLocaleString('es-ES')} (BAC)</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">AC: €${evm.AC.toLocaleString('es-ES')} | EV: €${evm.EV.toLocaleString('es-ES')} (Superávit CV: +€${evm.CV.toLocaleString('es-ES')})</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); color: #10b981; font-weight: bold;">VERDE (CPI: ${evm.CPI.toFixed(3)})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);"><strong>Tiempo (Cronograma)</strong></td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${evm.totalWeeks} Semanas</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">PV: €${evm.PV.toLocaleString('es-ES')} (Desfase SV: ${evm.SV >= 0 ? '+' : ''}€${evm.SV.toLocaleString('es-ES')})</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); color: #f59e0b; font-weight: bold;">AMARILLO (SPI: ${evm.SPI.toFixed(3)})</td>
          </tr>
        </tbody>
      </table>

      <h4 style="color: #f8fafc; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">2. Rendimiento Metrológico EVM</h4>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="background: rgba(15,23,42,0.8); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
          <small style="color: #94a3b8;">Cost Performance Index</small>
          <div style="font-size: 18px; font-weight: bold; color: #10b981;">CPI = ${evm.CPI.toFixed(3)}</div>
          <small style="color: #64748b;">Eficiencia presupuestaria favorable</small>
        </div>
        <div style="background: rgba(15,23,42,0.8); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
          <small style="color: #94a3b8;">Schedule Performance Index</small>
          <div style="font-size: 18px; font-weight: bold; color: #f59e0b;">SPI = ${evm.SPI.toFixed(3)}</div>
          <small style="color: #64748b;">Ritmo de ejecución controlado</small>
        </div>
        <div style="background: rgba(15,23,42,0.8); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
          <small style="color: #94a3b8;">Estimación a Conclusión</small>
          <div style="font-size: 18px; font-weight: bold; color: #93c5fd;">EAC = €${evm.EAC.toLocaleString('es-ES')}</div>
          <small style="color: #10b981;">Superávit proyectado: €${evm.VAC.toLocaleString('es-ES')}</small>
        </div>
      </div>
    </div>
  `;
}

function buildFinancialReport() {
  const evm = window.PMO_DATA_STORE.getCalculatedEVM();
  return `
    <div style="font-family: inherit; line-height: 1.6;">
      <h4 style="color: #93c5fd; margin-top:0;">Auditoría Financiera y Desglose Presupuestario al Corte</h4>
      <p style="font-size: 13px; color: #94a3b8;">Presupuesto Total Aprobado (BAC): <strong>€${evm.BAC.toLocaleString('es-ES')}</strong> · Subvención Fondos Europeos.</p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <thead>
          <tr style="background: rgba(255,255,255,0.05); text-align: left;">
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Métrica EVM</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Valor</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Interpretación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Presupuesto a la Conclusión (BAC)</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">€${evm.BAC.toLocaleString('es-ES')}</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Línea base total contractual aprobada</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Valor Ganado (EV)</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">€${evm.EV.toLocaleString('es-ES')}</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Valor del trabajo real ejecutado</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Costo Actual Incurrido (AC)</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">€${evm.AC.toLocaleString('es-ES')}</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Gasto efectivamente devengado</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Variación de Costo (CV)</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); color:#10b981; font-weight:bold;">${evm.CV >= 0 ? '+' : ''}€${evm.CV.toLocaleString('es-ES')}</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Superávit presupuestario a la fecha</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Índice de Desempeño por Cumplir (TCPI)</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${evm.TCPI.toFixed(3)}</td>
            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Factible sin requerir horas extras estructurales</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function buildTechnicalReport() {
  const t = window.PMO_DATA_STORE.data.telemetry;
  return `
    <div style="font-family: inherit; line-height: 1.6;">
      <h4 style="color: #93c5fd; margin-top:0;">Dossier de Arquitectura de Sistemas y Calidad de Software</h4>
      <p style="font-size: 13px; color: #94a3b8;">Evaluación de Confiabilidad, Latencia, Cobertura y Normativa NIS2.</p>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(15,23,42,0.8); padding: 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
          <strong style="color: #10b981;">Disponibilidad de Servicio (SLA)</strong>
          <div style="font-size: 22px; font-weight: bold; margin: 4px 0;">${t.uptime}%</div>
          <small style="color: #94a3b8;">Meta: ≥ 99.5% | Telemetría ininterrumpida.</small>
        </div>
        <div style="background: rgba(15,23,42,0.8); padding: 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
          <strong style="color: #3b82f6;">Latencia de Alertas</strong>
          <div style="font-size: 22px; font-weight: bold; margin: 4px 0;">${t.latency} s</div>
          <small style="color: #94a3b8;">Meta: < 5.0 s | Pipeline Kafka + Redis Cache.</small>
        </div>
      </div>
    </div>
  `;
}

function buildRiskReport() {
  const store = window.PMO_DATA_STORE;
  const risks = store.data.risks;
  return `
    <div style="font-family: inherit; line-height: 1.6;">
      <h4 style="color: #93c5fd; margin-top:0;">Matriz y Bitácora de Gestión de Riesgos Vigentes</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px;">
        <thead>
          <tr style="background: rgba(255,255,255,0.05); text-align: left;">
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Cód.</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Riesgo</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Prob/Imp</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Plan de Mitigación</th>
            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${risks.map(r => `
            <tr>
              <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);"><strong>${r.id}</strong></td>
              <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${r.title}</td>
              <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${r.prob} / ${r.impact}</td>
              <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${r.mitigationPlan}</td>
              <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); font-weight:bold;">${r.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function buildChangeReport() {
  const store = window.PMO_DATA_STORE;
  const rfcs = store.data.rfcs;
  return `
    <div style="font-family: inherit; line-height: 1.6;">
      <h4 style="color: #93c5fd; margin-top:0;">Registro Oficial de Control de Cambios (RFC)</h4>
      ${rfcs.map(rfc => `
        <div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 14px; margin-bottom: 12px; background: rgba(15,23,42,0.6);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: #60a5fa;">${rfc.id}: ${rfc.title}</strong>
            <span style="color: #10b981; font-weight: bold; font-size: 12px;">${rfc.status}</span>
          </div>
          <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Problema:</strong> ${rfc.problemDescription}</p>
          <p style="margin: 0; font-size: 13px;"><strong>Solución:</strong> ${rfc.solutionAdoptada}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function buildProgressReport() {
  return `
    <div style="font-family: inherit; line-height: 1.6;">
      <h4 style="color: #93c5fd; margin-top:0;">Acta de Estado de Hitos del Cronograma Maestro</h4>
      <p style="font-size: 13px; color: #94a3b8;">H1 y H2 cerrados formalmente. H3 en proceso de calibración y pruebas finales.</p>
    </div>
  `;
}

// ====================================================================
// 13. SISTEMA DE GRÁFICOS REACTIVOS (CHART.JS)
// ====================================================================

function initCharts() {
  if (typeof window.Chart === 'undefined') return;

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

  updateAllCharts();
}

function updateAllCharts() {
  if (typeof window.Chart === 'undefined') return;
  const store = window.PMO_DATA_STORE;
  const evm = store.getCalculatedEVM();

  // 1. Resumen EVM
  const ctxEvm = document.getElementById('evmChart');
  if (ctxEvm) {
    if (PMO_APP.charts.evm) PMO_APP.charts.evm.destroy();
    PMO_APP.charts.evm = new Chart(ctxEvm, {
      type: 'bar',
      data: {
        labels: ['BAC (Presupuesto)', 'PV (Planificado)', 'EV (Ganado)', 'AC (Costo Real)'],
        datasets: [{
          data: [evm.BAC, evm.PV, evm.EV, evm.AC],
          backgroundColor: [
            'rgba(148, 163, 184, 0.6)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: ['#94a3b8', '#3b82f6', '#10b981', '#f59e0b'],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Importe: €${ctx.parsed.y.toLocaleString('es-ES')}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (val) => `€${(val / 1000).toFixed(0)}k` },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 2. Distribución Presupuestaria
  const ctxBudget = document.getElementById('budgetChart');
  if (ctxBudget) {
    if (PMO_APP.charts.budget) PMO_APP.charts.budget.destroy();
    PMO_APP.charts.budget = new Chart(ctxBudget, {
      type: 'doughnut',
      data: {
        labels: store.data.budgetDistribution.labels,
        datasets: [{
          data: store.data.budgetDistribution.amounts,
          backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` €${ctx.parsed.toLocaleString('es-ES')} (${((ctx.parsed / evm.BAC) * 100).toFixed(1)}%)`
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  // 3. Distribución de Recursos por Perfil
  const ctxResources = document.getElementById('resourcePieChart');
  if (ctxResources) {
    if (PMO_APP.charts.resources) PMO_APP.charts.resources.destroy();
    PMO_APP.charts.resources = new Chart(ctxResources, {
      type: 'doughnut',
      data: {
        labels: store.data.resourceProfiles.labels,
        datasets: [{
          data: store.data.resourceProfiles.amounts,
          backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 10.5 } } }
        },
        cutout: '65%'
      }
    });
  }

  // 4. Curvas de Tendencia EVM
  const ctxEvmTrend = document.getElementById('evmTrendChart');
  if (ctxEvmTrend) {
    if (PMO_APP.charts.evmTrend) PMO_APP.charts.evmTrend.destroy();
    const weeks = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14'];
    const pvStep = evm.BAC / 14;
    const pvData = weeks.map((_, i) => Math.round(pvStep * (i + 1)));
    const evData = [10714, 21000, 30500, 41000, 52800, 62000, 73000, evm.EV, null, null, null, null, null, null];
    const acData = [9800, 19500, 29200, 39500, 50200, 60800, 70500, evm.AC, null, null, null, null, null, null];
    const projEv = [null, null, null, null, null, null, null, evm.EV, Math.round(evm.EV + (evm.BAC - evm.EV) * 0.18), Math.round(evm.EV + (evm.BAC - evm.EV) * 0.36), Math.round(evm.EV + (evm.BAC - evm.EV) * 0.55), Math.round(evm.EV + (evm.BAC - evm.EV) * 0.72), Math.round(evm.EV + (evm.BAC - evm.EV) * 0.88), evm.BAC];
    const projAc = [null, null, null, null, null, null, null, evm.AC, Math.round(evm.AC + (evm.EAC - evm.AC) * 0.18), Math.round(evm.AC + (evm.EAC - evm.AC) * 0.36), Math.round(evm.AC + (evm.EAC - evm.AC) * 0.55), Math.round(evm.AC + (evm.EAC - evm.AC) * 0.72), Math.round(evm.AC + (evm.EAC - evm.AC) * 0.88), evm.EAC];

    PMO_APP.charts.evmTrend = new Chart(ctxEvmTrend, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [
          {
            label: 'PV (Planificado)',
            data: pvData,
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false,
            tension: 0.2
          },
          {
            label: 'EV Real (Ganado)',
            data: evData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.3
          },
          {
            label: 'AC Real (Costo Actual)',
            data: acData,
            borderColor: '#f59e0b',
            borderWidth: 2.5,
            tension: 0.3
          },
          {
            label: 'Proyección EV',
            data: projEv,
            borderColor: 'rgba(16, 185, 129, 0.6)',
            borderDash: [5, 5],
            borderWidth: 2
          },
          {
            label: 'Proyección AC (EAC)',
            data: projAc,
            borderColor: 'rgba(245, 158, 11, 0.6)',
            borderDash: [5, 5],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          y: {
            ticks: { callback: (val) => `€${(val / 1000).toFixed(0)}k` },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: { grid: { color: 'rgba(255, 255, 255, 0.03)' } }
        }
      }
    });
  }

  // 5. Evolución de Índices CPI y SPI
  const ctxIndexTrend = document.getElementById('indexTrendChart');
  if (ctxIndexTrend) {
    if (PMO_APP.charts.indexTrend) PMO_APP.charts.indexTrend.destroy();
    PMO_APP.charts.indexTrend = new Chart(ctxIndexTrend, {
      type: 'line',
      data: {
        labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', `S${evm.currentWeek}`],
        datasets: [
          {
            label: 'CPI (Eficiencia Costo)',
            data: [1.09, 1.08, 1.04, 1.04, 1.05, 1.02, 1.035, evm.CPI],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2.5,
            tension: 0.3
          },
          {
            label: 'SPI (Rendimiento Cronograma)',
            data: [1.00, 0.98, 0.95, 0.96, 0.985, 0.965, 0.973, evm.SPI],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2.5,
            tension: 0.3
          },
          {
            label: 'Línea Base (1.00)',
            data: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
            borderColor: '#ef4444',
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0.85,
            max: 1.20,
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

function resizeAllCharts() {
  if (typeof window.Chart === 'undefined') return;
  Object.values(PMO_APP.charts).forEach(chart => {
    if (chart && typeof chart.resize === 'function') {
      chart.resize();
    }
  });
}

// ====================================================================
// 14. SIMULADOR DE ESCENARIOS (WHAT-IF)
// ====================================================================

function runSimulation() {
  const efficiencySlider = document.getElementById('sliderEfficiency');
  const delaySlider = document.getElementById('sliderPermitDelay');
  const costSlider = document.getElementById('sliderContingencyCost');

  if (!efficiencySlider || !delaySlider || !costSlider) return;

  const factorEff = parseFloat(efficiencySlider.value);
  const permitDelayDays = parseInt(delaySlider.value, 10);
  const extraCost = parseFloat(costSlider.value);

  document.getElementById('valEfficiency').textContent = `${factorEff.toFixed(2)}x`;
  document.getElementById('valPermitDelay').textContent = `${permitDelayDays} ${permitDelayDays === 1 ? 'día' : 'días'}`;
  document.getElementById('valContingencyCost').textContent = `€${extraCost.toLocaleString('es-ES')}`;

  const store = window.PMO_DATA_STORE;
  const evm = store.getCalculatedEVM();

  const workRemaining = evm.BAC - evm.EV;
  const effectiveCPI = evm.CPI * factorEff;
  const ETC = effectiveCPI > 0 ? workRemaining / effectiveCPI : workRemaining;
  const simulatedEAC = Math.round(evm.AC + ETC + extraCost);
  const simulatedVAC = Math.round(evm.BAC - simulatedEAC);

  const baseScheduleGapDays = Math.round((14 * 7 * 0.428) * (1 - (evm.SPI * factorEff)));
  const totalScheduleDiffDays = Math.max(0, baseScheduleGapDays) + permitDelayDays;

  // Actualizar UI del simulador
  const eacEl = document.getElementById('simEAC');
  const eacSubEl = document.getElementById('simEACSub');
  eacEl.textContent = `€${simulatedEAC.toLocaleString('es-ES')}`;
  if (simulatedEAC <= evm.BAC) {
    eacSubEl.textContent = `Línea Base: €${evm.BAC.toLocaleString('es-ES')} (Dentro de margen)`;
    eacEl.style.color = '#10b981';
  } else {
    eacSubEl.textContent = `Sobrecosto de €${(simulatedEAC - evm.BAC).toLocaleString('es-ES')}`;
    eacEl.style.color = '#ef4444';
  }

  const vacEl = document.getElementById('simVAC');
  const vacSubEl = document.getElementById('simVACSub');
  if (simulatedVAC >= 0) {
    vacEl.textContent = `+€${simulatedVAC.toLocaleString('es-ES')}`;
    vacEl.className = 'sim-kpi-value positive';
    vacSubEl.textContent = 'Superávit proyectado a la conclusión';
  } else {
    vacEl.textContent = `-€${Math.abs(simulatedVAC).toLocaleString('es-ES')}`;
    vacEl.className = 'sim-kpi-value negative';
    vacSubEl.textContent = 'Déficit presupuestario proyectado';
  }

  const schedEl = document.getElementById('simScheduleDiff');
  const schedSubEl = document.getElementById('simScheduleSub');
  if (totalScheduleDiffDays === 0) {
    schedEl.textContent = '0 días (A tiempo)';
    schedEl.style.color = '#10b981';
    schedSubEl.textContent = 'Cierre previsto en Semana 14';
  } else if (totalScheduleDiffDays <= 5) {
    schedEl.textContent = `+${totalScheduleDiffDays} días`;
    schedEl.style.color = '#f59e0b';
    schedSubEl.textContent = 'Absorbible mediante holgura de H4 a H5';
  } else {
    schedEl.textContent = `+${totalScheduleDiffDays} días`;
    schedEl.style.color = '#ef4444';
    schedSubEl.textContent = 'Riesgo de incumplimiento en hito final H5';
  }

  const trafficLightEl = document.getElementById('simTrafficLight');
  const trafficLightSubEl = document.getElementById('simTrafficLightSub');
  const narrativeEl = document.getElementById('simNarrative');

  if (simulatedVAC >= 0 && totalScheduleDiffDays <= 3) {
    trafficLightEl.className = 'sim-status-pill green';
    trafficLightEl.textContent = 'VERDE — Proyecto Estable';
    trafficLightSubEl.textContent = 'Indicadores dentro de límites de tolerancia';
    narrativeEl.innerHTML = `<strong>Diagnóstico de Simulación:</strong> El proyecto mantiene un desempeño financiero y operativo saludable. El superávit de <strong>€${simulatedVAC.toLocaleString('es-ES')}</strong> protege contra imprevistos menores y permite absorber las pruebas finales de H5 sin comprometer fondos europeos.`;
  } else if (simulatedVAC >= -4000 && totalScheduleDiffDays <= 8) {
    trafficLightEl.className = 'sim-status-pill amber';
    trafficLightEl.textContent = 'AMARILLO — Precaución Operativa';
    trafficLightSubEl.textContent = 'Requiere monitoreo intensivo semanal y CCB';
    narrativeEl.innerHTML = `<strong>Diagnóstico de Simulación:</strong> Se detecta un desfase moderado en el cronograma (+${totalScheduleDiffDays} días) o presión de costos. <em>Medida recomendada:</em> activar la gestión anticipada de permisos municipales e instruir Fast-Tracking en el Sprint 6 para evitar que la desviación alcance la ruta crítica.`;
  } else {
    trafficLightEl.className = 'sim-status-pill red';
    trafficLightEl.textContent = 'ROJO — Acción Correctiva Inmediata';
    trafficLightSubEl.textContent = 'Desviación superior a umbrales de seguridad';
    narrativeEl.innerHTML = `<strong>Diagnóstico de Simulación:</strong> La combinación de baja productividad, retrasos en permisos y sobrecostos sobrepasa la reserva de contingencia. <em>Plan de Contención:</em> convocar de inmediato al Comité Extraordinario de Dirección, desestimar alcances opcionales (MoSCoW Could-Have) y reprogramar la entrega de H4 con fast-tracking de cuadrillas nocturnas.`;
  }
}

function setPresetScenario(type) {
  const efficiencySlider = document.getElementById('sliderEfficiency');
  const delaySlider = document.getElementById('sliderPermitDelay');
  const costSlider = document.getElementById('sliderContingencyCost');

  document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));

  if (type === 'optimista') {
    efficiencySlider.value = '1.06';
    delaySlider.value = '0';
    costSlider.value = '0';
    document.getElementById('presetOptimista')?.classList.add('active');
    showToast('Escenario Optimista: Aceleración técnica y cero demoras.', 'success');
  } else if (type === 'probable') {
    efficiencySlider.value = '0.98';
    delaySlider.value = '2';
    costSlider.value = '1500';
    document.getElementById('presetProbable')?.classList.add('active');
    showToast('Escenario Más Probable: Inercia actual y contingencia moderada.', 'info');
  } else if (type === 'pesimista') {
    efficiencySlider.value = '0.84';
    delaySlider.value = '14';
    costSlider.value = '7500';
    document.getElementById('presetPesimista')?.classList.add('active');
    showToast('Escenario Pesimista: Demora municipal de 14 días y consultoría extra.', 'warning');
  }

  runSimulation();
}

// ====================================================================
// 15. TOASTS Y UTILIDADES GLOBALES
// ====================================================================

function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-text">${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 3500);
}

function setupTelemetryHeartbeat() {
  setInterval(() => {
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
      statusDot.style.transform = 'scale(1.3)';
      setTimeout(() => {
        statusDot.style.transform = 'scale(1)';
      }, 500);
    }
  }, 15000);
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeReport();
      closeNewRfcModal();
      closeNewRiskModal();
      closeNewTaskModal();
      closeEditMetricsModal();
      closeReportModal();
      closeTelemetryModal();
      closeImportDataModal();
    }
  });
}

// Exportar funciones globales
window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.generateReport = generateReport;
window.closeReport = closeReport;
window.printReport = printReport;
window.copyReportText = copyReportText;
window.exportReportCSV = exportReportCSV;
window.exportReportMarkdown = exportReportMarkdown;
window.toggleEditReportPreview = toggleEditReportPreview;
window.runSimulation = runSimulation;
window.setPresetScenario = setPresetScenario;
window.showToast = showToast;

window.openNewRfcModal = openNewRfcModal;
window.openEditRfcModal = openEditRfcModal;
window.closeNewRfcModal = closeNewRfcModal;
window.submitNewRfc = submitNewRfc;
window.confirmDeleteRFC = confirmDeleteRFC;

window.openNewRiskModal = openNewRiskModal;
window.openEditRiskModal = openEditRiskModal;
window.closeNewRiskModal = closeNewRiskModal;
window.submitNewRisk = submitNewRisk;
window.confirmDeleteRisk = confirmDeleteRisk;

window.openNewTaskModal = openNewTaskModal;
window.openEditTaskModal = openEditTaskModal;
window.closeNewTaskModal = closeNewTaskModal;
window.submitNewTask = submitNewTask;
window.confirmDeleteTask = confirmDeleteTask;

window.openEditMetricsModal = openEditMetricsModal;
window.closeEditMetricsModal = closeEditMetricsModal;
window.submitEditMetrics = submitEditMetrics;
window.resetAllData = resetAllData;

window.switchReportsTab = switchReportsTab;
window.renderManualReports = renderManualReports;
window.openNewReportModal = openNewReportModal;
window.openEditReportModal = openEditReportModal;
window.closeReportModal = closeReportModal;
window.submitReport = submitReport;
window.confirmDeleteReport = confirmDeleteReport;
window.viewManualReport = viewManualReport;

window.openTelemetryModal = openTelemetryModal;
window.closeTelemetryModal = closeTelemetryModal;
window.submitTelemetry = submitTelemetry;

window.exportDataBackup = exportDataBackup;
window.openImportDataModal = openImportDataModal;
window.closeImportDataModal = closeImportDataModal;
window.handleImportFile = handleImportFile;
window.submitImportData = submitImportData;
