function launchFireworks() {
    const container = document.getElementById("fireworksContainer");
    container.innerHTML = "";
    const duration = 40000;
    const endTime = Date.now() + duration;
    const interval = setInterval(() => {
      if (Date.now() > endTime) { clearInterval(interval); return; }
      const firework = document.createElement("div");
      firework.className = "firework";
      firework.style.left = Math.random() * 100 + "vw";
      firework.style.top = Math.random() * 100 + "vh";
      container.appendChild(firework);
      setTimeout(() => firework.remove(), 500);
    }, 200);
  }
  