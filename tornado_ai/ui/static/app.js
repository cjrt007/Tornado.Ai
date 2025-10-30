const state = {
  surface: null,
  filter: '',
  activity: [],
};

const toast = document.getElementById('toast');
const lastRefresh = document.getElementById('last-refresh');

function showToast(message, tone = 'info') {
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function addActivity(message, tone = 'info') {
  const timestamp = new Date().toLocaleString();
  state.activity.unshift({ message, tone, timestamp });
  if (state.activity.length > 20) {
    state.activity.pop();
  }
  renderActivity();
}

async function fetchSurface() {
  lastRefresh.textContent = 'Refreshing control surface…';
  const response = await fetch('/api/control/');
  if (!response.ok) {
    throw new Error(`Unable to retrieve control surface: ${response.statusText}`);
  }
  state.surface = await response.json();
  lastRefresh.textContent = `Last refreshed at ${new Date().toLocaleTimeString()}`;
  renderAll();
}

function renderAll() {
  renderFeatures();
  renderRoles();
  renderScans();
}

function featureMatchesFilter(feature, filter) {
  if (!filter) return true;
  const haystack = [feature.id, feature.label, feature.category, ...(feature.tags || [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(filter.toLowerCase());
}

function renderFeatures() {
  const container = document.getElementById('feature-grid');
  container.innerHTML = '';
  if (!state.surface) return;
  const { features = [] } = state.surface;
  const filtered = features.filter((feature) => featureMatchesFilter(feature, state.filter));
  if (!filtered.length) {
    container.innerHTML = '<p class="empty">No features match your filter.</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const feature of filtered) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${feature.label}</h3>
          <span>${feature.id}</span>
        </div>
        <div class="controls">
          <span class="status-pill ${feature.enabled ? 'on' : 'off'}">${
            feature.enabled ? 'Enabled' : 'Disabled'
          }</span>
          <button class="ghost" data-action="toggle" data-id="${feature.id}">${
            feature.enabled ? 'Disable' : 'Enable'
          }</button>
          <button class="ghost" data-action="lock" data-id="${feature.id}">${
            feature.locked ? 'Unlock' : 'Lock'
          }</button>
          <button class="ghost" data-action="edit" data-id="${feature.id}">Edit</button>
        </div>
      </div>
      <p>${feature.description || 'No description provided.'}</p>
      <div class="card-tags">
        <span class="tag">${feature.category}</span>
        ${(feature.tags || [])
          .map((tag) => `<span class="tag">${tag}</span>`)
          .join('')}
      </div>
      <div class="meta">
        <span>${feature.requiresRestart ? '🔄 Requires restart' : '⚡ Hot swappable'}</span>
      </div>
    `;
    card.addEventListener('click', (event) => handleFeatureAction(event, feature));
    fragment.appendChild(card);
  }
  container.appendChild(fragment);
}

function renderRoles() {
  const container = document.getElementById('role-grid');
  container.innerHTML = '';
  if (!state.surface) return;
  const { roles = [] } = state.surface;
  if (!roles.length) {
    container.innerHTML = '<p class="empty">No roles configured.</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const role of roles) {
    const card = document.createElement('article');
    card.className = 'card';
    const enforcement = role.enforcement || {};
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${role.displayName}</h3>
          <span>${role.role}</span>
        </div>
        <div class="controls">
          <button class="ghost" data-action="edit" data-role="${role.role}">Edit</button>
        </div>
      </div>
      <p>${role.description || 'No description provided.'}</p>
      <div class="role-body">
        <div>
          <h4>Permissions</h4>
          <div class="card-tags">${(role.permissions || [])
            .map((perm) => `<span class="tag">${perm}</span>`)
            .join('')}</div>
        </div>
        <div>
          <h4>Feature Access</h4>
          <div class="card-tags">${(role.featureAccess || [])
            .map((feat) => `<span class="tag">${feat}</span>`)
            .join('')}</div>
        </div>
        <div>
          <h4>Guardrails</h4>
          <ul>
            <li>MFA Required: ${enforcement.mfaRequired ? 'Yes' : 'No'}</li>
            <li>Session Timeout: ${enforcement.sessionTimeoutMinutes || 0} minutes</li>
          </ul>
        </div>
      </div>
    `;
    card.addEventListener('click', (event) => handleRoleAction(event, role));
    fragment.appendChild(card);
  }
  container.appendChild(fragment);
}

function renderScans() {
  const container = document.getElementById('scan-grid');
  container.innerHTML = '';
  if (!state.surface) return;
  const { scanProfiles = [] } = state.surface;
  if (!scanProfiles.length) {
    container.innerHTML = '<p class="empty">No scan profiles created.</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const profile of scanProfiles) {
    const schedule = profile.schedule || {};
    const guardrails = profile.guardrails || {};
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${profile.name}</h3>
          <span>${profile.id}</span>
        </div>
        <div class="controls">
          <button class="ghost" data-action="edit" data-id="${profile.id}">Edit</button>
        </div>
      </div>
      <p>${profile.description || 'No description provided.'}</p>
      <div class="card-tags">${(profile.tags || [])
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join('')}</div>
      <div class="role-body">
        <div>
          <h4>Targets</h4>
          <ul>${(profile.targets || []).map((target) => `<li>${target}</li>`).join('')}</ul>
        </div>
        <div>
          <h4>Tooling</h4>
          <div class="card-tags">${(profile.tooling || [])
            .map((tool) => `<span class="tag">${tool}</span>`)
            .join('')}</div>
        </div>
        <div>
          <h4>Schedule</h4>
          <ul>
            <li>Type: ${schedule.type || 'n/a'}</li>
            <li>Cron: ${schedule.cron || 'n/a'}</li>
            <li>Timezone: ${schedule.timezone || 'UTC'}</li>
          </ul>
        </div>
        <div>
          <h4>Guardrails</h4>
          <ul>
            <li>Approvals Required: ${guardrails.approvalsRequired ? 'Yes' : 'No'}</li>
            <li>Approvals Needed: ${guardrails.approvalsNeeded ?? 0}</li>
            <li>Safe Mode: ${guardrails.safeMode ? 'Enabled' : 'Disabled'}</li>
            <li>Max Parallel Tasks: ${guardrails.maxParallelTasks ?? 'n/a'}</li>
          </ul>
        </div>
      </div>
    `;
    card.addEventListener('click', (event) => handleScanAction(event, profile));
    fragment.appendChild(card);
  }
  container.appendChild(fragment);
}

function renderActivity() {
  const feed = document.getElementById('activity-feed');
  feed.innerHTML = '';
  for (const item of state.activity) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.timestamp}</span><strong>${item.message}</strong>`;
    feed.appendChild(li);
  }
}

async function handleFeatureAction(event, feature) {
  const button = event.target.closest('button');
  if (!button) return;
  event.stopPropagation();
  const action = button.dataset.action;
  if (!action) return;
  try {
    if (action === 'toggle') {
      await updateFeatures([{ id: feature.id, enabled: !feature.enabled }]);
      addActivity(`${feature.label} ${feature.enabled ? 'disabled' : 'enabled'}.`);
    }
    if (action === 'lock') {
      await updateFeatures([{ id: feature.id, locked: !feature.locked }]);
      addActivity(`${feature.label} ${feature.locked ? 'unlocked' : 'locked'}.`);
    }
    if (action === 'edit') {
      openFeatureModal(feature);
      return;
    }
    await fetchSurface();
  } catch (error) {
    console.error(error);
    showToast(error.message, 'error');
  }
}

async function handleRoleAction(event, role) {
  const button = event.target.closest('button');
  if (!button) return;
  event.stopPropagation();
  if (button.dataset.action === 'edit') {
    openRoleModal(role);
  }
}

async function handleScanAction(event, profile) {
  const button = event.target.closest('button');
  if (!button) return;
  event.stopPropagation();
  if (button.dataset.action === 'edit') {
    openScanModal(profile);
  }
}

async function updateFeatures(features) {
  const response = await fetch('/api/control/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features }),
  });
  if (!response.ok) {
    throw new Error('Failed to update features');
  }
  showToast('Features saved successfully');
}

async function updateRoles(roles) {
  const response = await fetch('/api/control/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles }),
  });
  if (!response.ok) {
    throw new Error('Failed to update roles');
  }
  showToast('Roles saved successfully');
}

async function updateScans(scans) {
  const response = await fetch('/api/control/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanProfiles: scans }),
  });
  if (!response.ok) {
    throw new Error('Failed to update scan profiles');
  }
  showToast('Scan profiles saved successfully');
}

function openFeatureModal(feature = null) {
  const dialog = document.getElementById('feature-form');
  const form = dialog.querySelector('form');
  form.reset();
  if (feature) {
    form.elements.id.value = feature.id;
    form.elements.label.value = feature.label;
    form.elements.category.value = feature.category || '';
    form.elements.tags.value = (feature.tags || []).join(',');
    form.elements.description.value = feature.description || '';
    form.elements.enabled.checked = !!feature.enabled;
    form.elements.locked.checked = !!feature.locked;
    form.elements.requiresRestart.checked = !!feature.requiresRestart;
  }
  dialog.showModal();
  form.onsubmit = async (event) => {
    event.preventDefault();
    const payload = {
      id: form.elements.id.value.trim(),
      label: form.elements.label.value.trim(),
      category: form.elements.category.value.trim() || undefined,
      description: form.elements.description.value.trim() || undefined,
      tags: form.elements.tags.value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      enabled: form.elements.enabled.checked,
      locked: form.elements.locked.checked,
      requiresRestart: form.elements.requiresRestart.checked,
    };
    try {
      await updateFeatures([payload]);
      addActivity(`Feature ${payload.label} saved.`);
      dialog.close();
      await fetchSurface();
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    }
  };
}

function openRoleModal(role = null) {
  const dialog = document.getElementById('role-form');
  const form = dialog.querySelector('form');
  form.reset();
  if (role) {
    form.elements.role.value = role.role;
    form.elements.displayName.value = role.displayName;
    form.elements.description.value = role.description || '';
    form.elements.permissions.value = (role.permissions || []).join(',');
    form.elements.featureAccess.value = (role.featureAccess || []).join(',');
    form.elements.defaultLanding.value = role.defaultLanding || '';
    const enforcement = role.enforcement || {};
    form.elements.mfaRequired.checked = !!enforcement.mfaRequired;
    form.elements.sessionTimeoutMinutes.value = enforcement.sessionTimeoutMinutes || 30;
  }
  dialog.showModal();
  form.onsubmit = async (event) => {
    event.preventDefault();
    const payload = {
      role: form.elements.role.value.trim(),
      displayName: form.elements.displayName.value.trim(),
      description: form.elements.description.value.trim() || undefined,
      permissions: form.elements.permissions.value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      featureAccess: form.elements.featureAccess.value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      defaultLanding: form.elements.defaultLanding.value.trim() || undefined,
      enforcement: {
        mfaRequired: form.elements.mfaRequired.checked,
        sessionTimeoutMinutes: Number(form.elements.sessionTimeoutMinutes.value || 30),
      },
    };
    try {
      await updateRoles([payload]);
      addActivity(`Role ${payload.displayName} saved.`);
      dialog.close();
      await fetchSurface();
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    }
  };
}

function openScanModal(profile = null) {
  const dialog = document.getElementById('scan-form');
  const form = dialog.querySelector('form');
  form.reset();
  if (profile) {
    form.elements.id.value = profile.id;
    form.elements.name.value = profile.name;
    form.elements.category.value = profile.category || '';
    form.elements.description.value = profile.description || '';
    form.elements.targets.value = (profile.targets || []).join(',');
    form.elements.tooling.value = (profile.tooling || []).join(',');
    form.elements.parameters.value = JSON.stringify(profile.parameters || {}, null, 2);
    form.elements.tags.value = (profile.tags || []).join(',');
    const schedule = profile.schedule || {};
    form.elements.scheduleType.value = schedule.type || 'scheduled';
    form.elements.cron.value = schedule.cron || '';
    form.elements.timezone.value = schedule.timezone || 'UTC';
    const guardrails = profile.guardrails || {};
    form.elements.approvalsRequired.checked = !!guardrails.approvalsRequired;
    form.elements.approvalsNeeded.value = guardrails.approvalsNeeded ?? 0;
    form.elements.safeMode.checked = guardrails.safeMode !== false;
    form.elements.maxParallelTasks.value = guardrails.maxParallelTasks ?? 3;
    form.elements.notifyRoles.value = (guardrails.notifyRoles || []).join(',');
    form.elements.owner.value = profile.owner || '';
  }
  dialog.showModal();
  form.onsubmit = async (event) => {
    event.preventDefault();
    let parameters;
    try {
      parameters = form.elements.parameters.value.trim()
        ? JSON.parse(form.elements.parameters.value)
        : {};
    } catch (error) {
      showToast('Parameters must be valid JSON.', 'error');
      return;
    }
    const payload = {
      id: form.elements.id.value.trim(),
      name: form.elements.name.value.trim(),
      category: form.elements.category.value.trim() || undefined,
      description: form.elements.description.value.trim() || undefined,
      targets: form.elements.targets.value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      tooling: form.elements.tooling.value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      parameters,
      tags: form.elements.tags.value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      schedule: {
        type: form.elements.scheduleType.value,
        cron: form.elements.cron.value.trim() || undefined,
        timezone: form.elements.timezone.value.trim() || 'UTC',
      },
      guardrails: {
        approvalsRequired: form.elements.approvalsRequired.checked,
        approvalsNeeded: Number(form.elements.approvalsNeeded.value || 0),
        safeMode: form.elements.safeMode.checked,
        maxParallelTasks: Number(form.elements.maxParallelTasks.value || 1),
        notifyRoles: form.elements.notifyRoles.value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      },
      owner: form.elements.owner.value.trim() || undefined,
    };
    try {
      await updateScans([payload]);
      addActivity(`Scan profile ${payload.name} saved.`);
      dialog.close();
      await fetchSurface();
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    }
  };
}

function wireTabs() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });
}

function wireGlobalHandlers() {
  document.getElementById('refresh-surface').addEventListener('click', () => fetchSurface());
  document.getElementById('feature-filter').addEventListener('input', (event) => {
    state.filter = event.target.value;
    renderFeatures();
  });
  document.getElementById('open-feature-form').addEventListener('click', () => openFeatureModal());
  document.getElementById('open-role-form').addEventListener('click', () => openRoleModal());
  document.getElementById('open-scan-form').addEventListener('click', () => openScanModal());
  document.getElementById('clear-activity').addEventListener('click', () => {
    state.activity = [];
    renderActivity();
  });
}

async function initialise() {
  try {
    wireTabs();
    wireGlobalHandlers();
    await fetchSurface();
    addActivity('Control surface synchronised.');
  } catch (error) {
    console.error(error);
    showToast(error.message, 'error');
  }
}

initialise();
