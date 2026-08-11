function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      document.getElementById("fullScreenBtn").textContent = "Exit Full Screen";
    } else {
      document.exitFullscreen();
      document.getElementById("fullScreenBtn").textContent = "Full Screen";
    }
  }
  