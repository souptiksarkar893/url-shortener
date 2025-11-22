// Dashboard JavaScript

let allLinks = [];
let currentSort = { field: 'created_at', direction: 'desc' };

// DOM Elements
const form = document.getElementById('add-link-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnSpinner = submitBtn.querySelector('.spinner');
const successMessage = document.getElementById('success-message');
const shortUrlLink = document.getElementById('short-url-link');
const copySuccessBtn = document.getElementById('copy-success-btn');
const searchInput = document.getElementById('search-input');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const errorState = document.getElementById('error-state');
const tableContainer = document.getElementById('table-container');
const tbody = document.getElementById('links-tbody');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
  setupEventListeners();
});

function setupEventListeners() {
  // Form submission
  form.addEventListener('submit', handleFormSubmit);

  // Search
  searchInput.addEventListener('input', handleSearch);

  // Table sorting
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => handleSort(th.dataset.sort));
  });

  // Copy button in success message
  copySuccessBtn.addEventListener('click', function() {
    copyToClipboard(this.dataset.url, this);
  });

  // Real-time validation
  const codeInput = document.getElementById('custom-code');
  codeInput.addEventListener('input', validateCode);
}

// Form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const targetUrl = document.getElementById('target-url').value.trim();
  const customCode = document.getElementById('custom-code').value.trim();
  
  // Clear previous errors
  document.getElementById('url-error').textContent = '';
  document.getElementById('code-error').textContent = '';
  successMessage.style.display = 'none';

  // Validate URL
  if (!isValidUrl(targetUrl)) {
    document.getElementById('url-error').textContent = 'Please enter a valid URL';
    return;
  }

  // Validate custom code if provided
  if (customCode && !isValidCode(customCode)) {
    document.getElementById('code-error').textContent = 'Code must be 6-8 alphanumeric characters';
    return;
  }

  // Disable form
  setFormLoading(true);

  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        target_url: targetUrl, 
        code: customCode || undefined 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        document.getElementById('code-error').textContent = 'This code is already taken';
      } else {
        document.getElementById('url-error').textContent = data.error || 'Failed to create link';
      }
      return;
    }

    // Success
    form.reset();
    showSuccessMessage(data.short_url);
    loadLinks(); // Reload the table

  } catch (error) {
    console.error('Error:', error);
    document.getElementById('url-error').textContent = 'Network error. Please try again.';
  } finally {
    setFormLoading(false);
  }
}

function setFormLoading(loading) {
  submitBtn.disabled = loading;
  btnText.style.display = loading ? 'none' : 'inline';
  btnSpinner.style.display = loading ? 'inline-block' : 'none';
}

function showSuccessMessage(shortUrl) {
  shortUrlLink.href = shortUrl;
  shortUrlLink.textContent = shortUrl;
  copySuccessBtn.dataset.url = shortUrl;
  successMessage.style.display = 'block';
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 10000);
}

// Load all links
async function loadLinks() {
  loadingState.style.display = 'block';
  emptyState.style.display = 'none';
  errorState.style.display = 'none';
  tableContainer.style.display = 'none';

  try {
    const response = await fetch('/api/links');
    
    if (!response.ok) {
      throw new Error('Failed to fetch links');
    }

    allLinks = await response.json();
    renderTable();

  } catch (error) {
    console.error('Error loading links:', error);
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
  }
}

// Render table
function renderTable(filteredLinks = null) {
  const links = filteredLinks !== null ? filteredLinks : allLinks;

  loadingState.style.display = 'none';
  errorState.style.display = 'none';

  if (links.length === 0) {
    emptyState.style.display = 'block';
    tableContainer.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  tableContainer.style.display = 'block';

  tbody.innerHTML = links.map(link => `
    <tr>
      <td class="code-cell">${escapeHtml(link.code)}</td>
      <td class="url-cell" title="${escapeHtml(link.target_url)}">
        <a href="${escapeHtml(link.target_url)}" target="_blank">${escapeHtml(link.target_url)}</a>
      </td>
      <td>${link.total_clicks}</td>
      <td>${formatDate(link.last_clicked)}</td>
      <td class="actions-cell">
        <a href="/code/${escapeHtml(link.code)}" class="btn btn-secondary">View Stats</a>
        <button class="copy-btn" onclick="copyToClipboard('${window.location.origin}/${escapeHtml(link.code)}', this)">Copy Link</button>
        <button class="btn btn-danger" onclick="deleteLink('${escapeHtml(link.code)}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Search/Filter
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    renderTable();
    return;
  }

  const filtered = allLinks.filter(link => 
    link.code.toLowerCase().includes(query) ||
    link.target_url.toLowerCase().includes(query)
  );

  renderTable(filtered);
}

// Sorting
function handleSort(field) {
  if (currentSort.field === field) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.field = field;
    currentSort.direction = 'asc';
  }

  // Update sort indicators
  document.querySelectorAll('th.sortable').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
  });
  
  const sortedTh = document.querySelector(`th[data-sort="${field}"]`);
  sortedTh.classList.add(`sort-${currentSort.direction}`);

  // Sort data
  allLinks.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    // Handle null values
    if (valA === null) return 1;
    if (valB === null) return -1;

    // String comparison
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
    if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable();
}

// Delete link
async function deleteLink(code) {
  if (!confirm(`Are you sure you want to delete the link "${code}"? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch(`/api/links/${code}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete link');
    }

    // Remove from local array and re-render
    allLinks = allLinks.filter(link => link.code !== code);
    renderTable();

  } catch (error) {
    console.error('Error deleting link:', error);
    alert('Failed to delete link. Please try again.');
  }
}

// Validation
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

function validateCode(e) {
  const code = e.target.value;
  const errorEl = document.getElementById('code-error');
  
  if (code && !isValidCode(code)) {
    errorEl.textContent = 'Code must be 6-8 alphanumeric characters';
    e.target.classList.add('error');
  } else {
    errorEl.textContent = '';
    e.target.classList.remove('error');
  }
}

// Utilities
function formatDate(dateString) {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  });
}
