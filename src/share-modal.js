// ...existing code before attaching event listener...

// Wait for the DOM to fully load before accessing elements
window.addEventListener('DOMContentLoaded', () => {
  const shareModalEl = document.getElementById('share-modal')
  if (shareModalEl) {
    // Attach event listener only if the element exists
    shareModalEl.addEventListener('click', handleClick)
  } else {
    console.warn('share-modal element not found')
  }
})

// ...existing code after attaching event listener...
