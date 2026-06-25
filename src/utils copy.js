export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI  = document.getElementById("textbox-container");
  const dialogueBox = document.getElementById("textbox");
  const dialogueEl  = document.getElementById("dialogue");
  const closeBtn    = document.getElementById("close");

  // show UI
  dialogueUI.style.display = "block";

  // add / reset hint element
  let hintEl = document.getElementById("continue-hint");
  if (!hintEl) {
    hintEl = document.createElement("div");
    hintEl.id = "continue-hint";
    hintEl.style.cssText = `
      font-size: 1rem;
      opacity: 0;
      margin-top: 0.5rem;
      color: #444;
      align-self: flex-end;
      transition: opacity 0.6s ease;
      user-select: none;
    `;
    dialogueBox.appendChild(hintEl);
  }
  hintEl.textContent = "Tap the box to continue…";
  hintEl.style.opacity = "0"; // reset visibility

  // typewriter effect
  let index = 0;
  let currentText = "";
  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogueEl.innerHTML = currentText;
      index++;
      return;
    }
    clearInterval(intervalRef);

    // show hint once typing is done
    hintEl.style.opacity = "1";
  }, 15); // slowed down a bit so text is readable

  let closed = false;
  let armed  = false; // ignore the same click that opened it

  function cleanup() {
    closeBtn?.removeEventListener("click", closeDialogue);
    dialogueBox?.removeEventListener("click", onBoxClick);
    window.removeEventListener("keypress", onKeypress);
    clearInterval(intervalRef);
  }

  function closeDialogue() {
    if (closed) return;
    closed = true;
    onDisplayEnd?.();
    dialogueUI.style.display = "none";
    dialogueEl.innerHTML = "";
    hintEl.style.opacity = "0";
    cleanup();
  }

  function onBoxClick() {
    if (!armed) return;
    closeDialogue();
  }

  function onKeypress(e) {
    if (e.code === "Enter" || e.code === "Space") closeDialogue();
  }

  // Close with the X button as well
  closeBtn?.addEventListener("click", closeDialogue);

  // Arm after a brief delay so the opening click doesn’t close it
  setTimeout(() => {
    armed = true;
    dialogueBox?.addEventListener("click", onBoxClick);
  }, 50);

  // Keyboard close
  window.addEventListener("keypress", onKeypress);
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  k.camScale(k.vec2(resizeFactor < 1 ? 1 : 1.5));
}
