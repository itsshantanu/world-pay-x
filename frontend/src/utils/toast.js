// Toast notification utility
let toastContainer = null;
let toastQueue = [];
let isProcessingQueue = false;

function createToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function displayToast(message, type, duration) {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${getToastColor(type)};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    word-wrap: break-word;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    pointer-events: auto;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    border: 1px solid ${getBorderColor(type)};
  `;
  
  toast.textContent = message;
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

async function processToastQueue() {
  if (isProcessingQueue || toastQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  
  while (toastQueue.length > 0) {
    const { message, type, duration } = toastQueue.shift();
    displayToast(message, type, duration);
    
    // Wait 800ms before showing next toast
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  isProcessingQueue = false;
}

export function showToast(message, type = 'info', duration = 4000) {
  toastQueue.push({ message, type, duration });
  processToastQueue();
}

function getToastColor(type) {
  switch (type) {
    case 'success': return '#10b981'; // green-500
    case 'error': return '#ef4444'; // red-500
    case 'warning': return '#f59e0b'; // amber-500
    case 'info': 
    default: return '#3b82f6'; // blue-500
  }
}

function getBorderColor(type) {
  switch (type) {
    case 'success': return '#059669'; // green-600
    case 'error': return '#dc2626'; // red-600
    case 'warning': return '#d97706'; // amber-600
    case 'info':
    default: return '#2563eb'; // blue-600
  }
}