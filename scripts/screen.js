function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(
        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
      );
    });
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener("fullscreenchange", () => {
  const button = document.getElementById("fullScreenBtn");

  if (!button) return;

  if (document.fullscreenElement) {
    button.textContent = "Exit Full Screen";
    document.body.classList.add("tv-fullscreen");
  } else {
    button.textContent = "Full Screen";
    document.body.classList.remove("tv-fullscreen");
  }
});