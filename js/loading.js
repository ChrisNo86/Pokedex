import { appState } from './state.js';

export function setLoadingState(isLoading) {
  appState.isLoading = isLoading;
  toggleLoadingIndicator(isLoading);
}

export function toggleLoadingIndicator(showLoader) {
  const loader = document.getElementById('loader-text');

  if (!loader) return;

  loader.style.display = showLoader ? 'block' : 'none';
}

export function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
