const data = window.BRIEFINGS_DATA;
const briefings = data.briefings;

const roadgroupSelect = document.querySelector('#roadgroupSelect');
const searchInput = document.querySelector('#searchInput');
const qualityFilter = document.querySelector('#qualityFilter');
const briefingList = document.querySelector('#briefingList');
const matchCount = document.querySelector('#matchCount');

const title = document.querySelector('#briefingTitle');
const areaLabel = document.querySelector('#areaLabel');
const qualityBadge = document.querySelector('#qualityBadge');
const postCount = document.querySelector('#postCount');
const issueCount = document.querySelector('#issueCount');
const qualityReason = document.querySelector('#qualityReason');
const briefingContent = document.querySelector('#briefingContent');

let currentId = briefings[0]?.id;

function initSummary() {
  document.querySelector('#totalCount').textContent = data.stats.total;
  document.querySelector('#thoroughCount').textContent = data.stats.thorough;
  document.querySelector('#weakCount').textContent = data.stats.weak;
}

function optionLabel(briefing) {
  return `${briefing.area} | ${briefing.name}`;
}

function populateSelect() {
  roadgroupSelect.innerHTML = briefings
    .map((briefing) => `<option value="${briefing.id}">${escapeHtml(optionLabel(briefing))}</option>`)
    .join('');
  roadgroupSelect.value = currentId;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[char]));
}

function filteredBriefings() {
  const query = searchInput.value.trim().toLowerCase();
  const quality = qualityFilter.value;
  return briefings.filter((briefing) => {
    const qualityOk = quality === 'all' || briefing.quality === quality;
    const haystack = `${briefing.name} ${briefing.area} ${briefing.quality} ${briefing.searchText}`.toLowerCase();
    const searchOk = !query || haystack.includes(query);
    return qualityOk && searchOk;
  });
}

function renderSelected() {
  const briefing = briefings.find((item) => item.id === currentId) || briefings[0];
  if (!briefing) return;
  currentId = briefing.id;
  roadgroupSelect.value = briefing.id;
  title.textContent = briefing.name;
  areaLabel.textContent = briefing.area;
  qualityBadge.textContent = briefing.quality;
  qualityBadge.className = `badge ${briefing.qualityTone}`;
  postCount.textContent = briefing.posts;
  issueCount.textContent = briefing.issueCount;
  qualityReason.textContent = briefing.qualityReason;
  briefingContent.innerHTML = briefing.contentHtml;
}

function renderList() {
  const items = filteredBriefings();
  matchCount.textContent = `${items.length} matching`;
  if (!items.length) {
    briefingList.innerHTML = '<p class="empty">No briefings match the current filters.</p>';
    return;
  }
  briefingList.innerHTML = items.map((briefing) => `
    <button class="list-button ${briefing.id === currentId ? 'active' : ''}" type="button" data-id="${briefing.id}">
      <strong>${escapeHtml(briefing.name)}</strong>
      <span class="list-meta">
        <span class="pill">${escapeHtml(briefing.area)}</span>
        <span class="pill ${briefing.qualityTone}">${briefing.quality}</span>
        <span class="pill">${briefing.posts} posts</span>
      </span>
    </button>
  `).join('');
}

roadgroupSelect.addEventListener('change', (event) => {
  currentId = event.target.value;
  renderSelected();
  renderList();
});

searchInput.addEventListener('input', renderList);
qualityFilter.addEventListener('change', renderList);

briefingList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-id]');
  if (!button) return;
  currentId = button.dataset.id;
  renderSelected();
  renderList();
  if (window.matchMedia('(max-width: 820px)').matches) {
    document.querySelector('.selected-briefing').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

initSummary();
populateSelect();
renderSelected();
renderList();
