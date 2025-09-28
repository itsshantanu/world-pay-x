// Loader utility for full-screen loading overlay
let loaderContainer = null;

function createLoaderContainer() {
  if (!loaderContainer) {
    loaderContainer = document.createElement('div');
    loaderContainer.id = 'loader-container';
    loaderContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    `;
    
    // Create spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 4px solid #374151;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    `;
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.id = 'loading-text';
    loadingText.style.cssText = `
      color: white;
      font-size: 16px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    loadingText.textContent = 'Processing subscription...';
    
    loaderContainer.appendChild(spinner);
    loaderContainer.appendChild(loadingText);
    
    // Add CSS animation for spinner
    if (!document.getElementById('loader-styles')) {
      const style = document.createElement('style');
      style.id = 'loader-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }
  return loaderContainer;
}

export function showLoader(message = 'Processing subscription...') {
  const loader = createLoaderContainer();
  const loadingText = loader.querySelector('#loading-text');
  if (loadingText) {
    loadingText.textContent = message;
  }
  
  if (!loader.parentNode) {
    document.body.appendChild(loader);
  }
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

export function hideLoader() {
  if (loaderContainer && loaderContainer.parentNode) {
    loaderContainer.parentNode.removeChild(loaderContainer);
  }
  
  // Restore body scroll
  document.body.style.overflow = '';
}

export function updateLoaderMessage(message) {
  if (loaderContainer) {
    const loadingText = loaderContainer.querySelector('#loading-text');
    if (loadingText) {
      loadingText.textContent = message;
    }
  }
}