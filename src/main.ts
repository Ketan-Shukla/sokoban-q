import './style.css'
import './game'

// Function to detect if device is mobile
function isMobileDevice(): boolean {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to update layout based on screen size
function updateLayout() {
  const app = document.querySelector('#app');
  if (!app) return;
  
  if (isMobileDevice()) {
    app.className = 'mobile-layout';
  } else {
    app.className = 'desktop-layout';
  }
}

// Create the HTML structure
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="desktop-layout">
    <div class="description-section">
      <h1>Sokoban - Clean & Centered</h1>
      <div class="instructions">
        <h3>🎯 Classic Sokoban Puzzle Game</h3>
        <p>🎮 <strong>Goal:</strong> Push all crates onto targets to complete each level</p>
        <p>🕹️ <strong>Controls:</strong></p>
        <ul>
          <li>Arrow keys: Move your character</li>
          <li>R: Reset current level</li>
          <li>N: Next level | P: Previous level</li>
        </ul>
        <p>✨ <strong>Features:</strong></p>
        <ul>
          <li>Consistent visual design with high-quality sprites</li>
          <li>Perfectly centered levels on all screen sizes</li>
          <li>3 carefully designed, solvable puzzle levels</li>
          <li>Mobile-optimized: Game-only view on mobile devices</li>
          <li>Progress tracking with auto-save</li>
        </ul>
        <p>🎨 <strong>Visual Design:</strong></p>
        <ul>
          <li>Clean, consistent sprite artwork</li>
          <li>Automatic level centering</li>
          <li>Touch-friendly interface</li>
          <li>Professional game presentation</li>
        </ul>
        <p>📱 <strong>Mobile Experience:</strong></p>
        <ul>
          <li>Full-screen game view on mobile devices</li>
          <li>Swipe gestures for movement (up, down, left, right)</li>
          <li>On-screen touch buttons for precise control</li>
          <li>Optimized touch controls and interface</li>
          <li>Maximum screen space utilization</li>
          <li>Distraction-free gaming</li>
        </ul>
      </div>
    </div>
    <div class="game-section">
      <div id="game-container"></div>
    </div>
  </div>
`;

// Set initial layout
updateLayout();

// Update layout on window resize
window.addEventListener('resize', updateLayout);

// Update layout on orientation change (mobile devices)
window.addEventListener('orientationchange', () => {
  setTimeout(updateLayout, 100); // Small delay to ensure orientation change is complete
});
