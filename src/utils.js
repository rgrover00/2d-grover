// Lazily cache DOM elements so we don't query the DOM on every single dialogue trigger
const ui = {
  initialized: false,
  container: null,
  box: null,
  textEl: null,
  closeBtn: null,
  hintEl: null,
};

function initUI() {
  if (ui.initialized) return;

  ui.container = document.getElementById("textbox-container");
  ui.box = document.getElementById("textbox");
  ui.textEl = document.getElementById("dialogue");
  ui.closeBtn = document.getElementById("close");

  // Create the hint element once
  ui.hintEl = document.createElement("div");
  ui.hintEl.id = "continue-hint";
  ui.hintEl.textContent = "Tap to continue…";
  
  // Note: Ideally, move this block to your CSS file under `#continue-hint`
  ui.hintEl.style.cssText = `
    font-size: 1rem;
    opacity: 0;
    margin-top: 0.5rem;
    color: #444;
    align-self: flex-end;
    transition: opacity 0.6s ease;
    user-select: none;
  `;
  
  ui.box.appendChild(ui.hintEl);
  ui.initialized = true;
}

export function displayDialogue(text, onDisplayEnd) {
  initUI(); // Ensures UI is ready, does nothing if already cached

  // Reset UI State
  ui.container.style.display = "block";
  ui.hintEl.style.opacity = "0";
  ui.textEl.textContent = ""; 

  let index = 0;
  let isTyping = true;
  let closed = false;
  let armed = false;

  // Typewriter effect
  const intervalRef = setInterval(() => {
    if (index < text.length) {
      ui.textEl.textContent += text[index];
      index++;
    } else {
      finishTyping();
    }
  }, 15);

  // Helper to instantly finish typing
  function finishTyping() {
    clearInterval(intervalRef);
    isTyping = false;
    ui.textEl.textContent = text; 
    ui.hintEl.style.opacity = "1";
  }

  function cleanup() {
    ui.closeBtn?.removeEventListener("click", closeDialogue);
    ui.box?.removeEventListener("click", onInteract);
    window.removeEventListener("keydown", onKeydown);
  }

  function closeDialogue() {
    if (closed) return;
    closed = true;
    cleanup();
    
    ui.container.style.display = "none";
    ui.textEl.textContent = "";
    ui.hintEl.style.opacity = "0";
    
    onDisplayEnd?.();
  }

  // Handle player input (click or keypress)
  function onInteract() {
    if (!armed) return;
    
    if (isTyping) {
      finishTyping(); // Skip typewriter effect
    } else {
      closeDialogue(); // Close if text is fully displayed
    }
  }

  function onKeydown(e) {
    if (e.code === "Enter" || e.code === "Space") onInteract();
  }

  // Event Listeners
  ui.closeBtn?.addEventListener("click", closeDialogue);
  window.addEventListener("keydown", onKeydown);

  // Arm after a brief delay so the initial walk-into-boundary click doesn't instantly trigger this
  setTimeout(() => {
    armed = true;
    ui.box?.addEventListener("click", onInteract);
  }, 50);
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  k.camScale(k.vec2(resizeFactor < 1 ? 1 : 1.5));
}