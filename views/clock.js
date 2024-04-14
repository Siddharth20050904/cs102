function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const clockDiv = document.getElementById('clock');
    clockDiv.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  // Update the clock every second
  setInterval(updateClock, 1000);
  
  // Initial clock update
  updateClock();