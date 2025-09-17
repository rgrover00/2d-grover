export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const diaglogue = document.getElementById("dialogue");
  const closeBtn = document.getElementById("close");

  dialogueUI.style.display = "block";

  let index = 0;
  let currentText = "";
  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      diaglogue.innerHTML = currentText;
      index++;
      return;
    }
    clearInterval(intervalRef);
  }, 1);

  let closed = false;       // prevent double-calls
  let armed = false;        // ignore the click that opened the menu

  function closeDialogue() {
    if (closed) return;
    closed = true;

    onDisplayEnd?.();
    dialogueUI.style.display = "none";
    diaglogue.innerHTML = "";
    clearInterval(intervalRef);

    // Cleanup listeners
    closeBtn.removeEventListener("click", closeDialogue);
    document.removeEventListener("click", onDocClick, true);
    window.removeEventListener("keypress", onKeypress);
  }

  function onDocClick() {
    if (!armed) return;     // first click after open is ignored
    closeDialogue();
  }

  function onKeypress(e) {
    if (e.code === "Enter") closeDialogue();
  }

  // Click the X still works
  closeBtn.addEventListener("click", closeDialogue);

  // Arm the global click after a tick so the opening click doesn't close it
  setTimeout(() => {
    armed = true;
    // use capture to catch clicks even if something stops propagation
    document.addEventListener("click", onDocClick, true);
  }, 50);

  // Enter key still closes
  window.addEventListener("keypress", onKeypress);
}
