// Stats Page JavaScript

let linkData = null;

// DOM Elements
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const statsContent = document.getElementById('stats-content');
const deleteBtn = document.getElementById('delete-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const code = getCodeFromUrl();
  
  if (!code) {
    showError('Invalid URL');
    return;
  }

  loadStats(code);
  setupEventListeners(code);
});

function setupEventListeners(code) {
  // Delete button
  deleteBtn.addEventListener('click', () => handleDelete(code));

  // Copy buttons
  document.getElementById('copy-code-btn').addEventListener('click', function() {
    copyToClipboard(this.dataset.url, this);
  });

  document.getElementById('copy-url-btn').addEventListener('click', function() {
    copyToClipboard(this.dataset.url, this);
  });
}

// Get code from URL path
function getCodeFromUrl() {
  const pathParts = window.location.pathname.split('/');
  // URL format: /code/:code
  if (pathParts.length >= 3 && pathParts[1] === 'code') {
    return pathParts[2];
  }
  return null;
}

// Load stats
async function loadStats(code) {
  loadingState.style.display = 'block';
  errorState.style.display = 'none';
  statsContent.style.display = 'none';

  try {
    const response = await fetch(`/api/links/${code}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Link not found');
      }
      throw new Error('Failed to load stats');
    }

    linkData = await response.json();
    renderStats();

  } catch (error) {
    console.error('Error loading stats:', error);
    showError(error.message);
  }
}

// Render stats
function renderStats() {
  loadingState.style.display = 'none';
  errorState.style.display = 'none';
  statsContent.style.display = 'block';

  const shortUrl = `${window.location.origin}/${linkData.code}`;

  // Update stats
  document.getElementById('stat-code').textContent = linkData.code;
  document.getElementById('copy-code-btn').dataset.url = shortUrl;

  document.getElementById('stat-url').href = linkData.target_url;
  document.getElementById('stat-url').textContent = linkData.target_url;
  document.getElementById('copy-url-btn').dataset.url = linkData.target_url;

  document.getElementById('stat-clicks').textContent = linkData.total_clicks.toLocaleString();

  document.getElementById('stat-last-clicked').textContent = formatDate(linkData.last_clicked);

  document.getElementById('stat-created').textContent = formatDateTime(linkData.created_at);

  // Update page title
  document.title = `Stats: ${linkData.code} - URL Shortener`;
}

// Show error
function showError(message) {
  loadingState.style.display = 'none';
  statsContent.style.display = 'none';
  errorState.style.display = 'block';
  errorMessage.textContent = message;
}

// Delete link
async function handleDelete(code) {
  if (!confirm(`Are you sure you want to delete the link "${code}"? This cannot be undone.`)) {
    return;
  }

  const originalText = deleteBtn.textContent;
  deleteBtn.disabled = true;
  deleteBtn.textContent = 'Deleting...';

  try {
    const response = await fetch(`/api/links/${code}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete link');
    }

    // Redirect to dashboard after successful deletion
    alert('Link deleted successfully!');
    window.location.href = '/';

  } catch (error) {
    console.error('Error deleting link:', error);
    alert('Failed to delete link. Please try again.');
    deleteBtn.disabled = false;
    deleteBtn.textContent = originalText;
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

function formatDateTime(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
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
