document.addEventListener('DOMContentLoaded', () => {

  // ======================================================
  // ELEMENTS
  // ======================================================

  const introVideo =
    document.getElementById('introVideo');

  const introContainer =
    document.getElementById('introVideoContainer');

  const introButtons =
    document.getElementById('introButtons');

  const playButton =
    document.getElementById('introPlayButton');

  const skipButton =
    document.getElementById('skipIntroButton');

  const fullScreenButton =
    document.getElementById('introFullScreenButton');

  const watchIntroBtn =
    document.getElementById('watchIntroBtn');


  // ======================================================
  // PLAY INTRO
  // ======================================================

  playButton.addEventListener('click', () => {

    // Make sure sound is on.
    introVideo.muted = false;

    // Start the intro video.
    introVideo.play().catch(err => {
      console.error("Video play error:", err);
    });

    // Hide ALL intro buttons while the video plays.
    introButtons.style.display = 'none';

  });


  // ======================================================
  // INTRO FULL SCREEN BUTTON
  // ======================================================

  fullScreenButton.addEventListener('click', () => {

    if (!document.fullscreenElement) {

      document.documentElement
        .requestFullscreen()
        .catch(err => {

          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          );

        });

    } else {

      document.exitFullscreen();

    }

  });


  // ======================================================
  // FULLSCREEN CHANGE
  // ======================================================

  document.addEventListener('fullscreenchange', () => {

    if (document.fullscreenElement) {

      fullScreenButton.textContent =
        "Exit Full Screen";

    } else {

      fullScreenButton.textContent =
        "Full Screen";

    }

  });


  // ======================================================
  // SKIP INTRO
  // ======================================================

  skipButton.addEventListener('click', () => {

    // Stop the video.
    introVideo.pause();

    // Fade the intro screen away.
    introContainer.style.transition =
      'opacity 1s';

    introContainer.style.opacity =
      '0';

    setTimeout(() => {

      introContainer.style.display =
        'none';

    }, 1000);

  });


  // ======================================================
  // INTRO VIDEO FINISHED
  // ======================================================

  introVideo.addEventListener('ended', () => {

    // Fade the intro screen away.
    introContainer.style.transition =
      'opacity 1s';

    introContainer.style.opacity =
      '0';

    setTimeout(() => {

      introContainer.style.display =
        'none';

    }, 1000);

  });


  // ======================================================
  // WATCH INTRO AGAIN
  // ======================================================

  watchIntroBtn.addEventListener('click', () => {

    // Reset the video to the beginning.
    introVideo.pause();
    introVideo.currentTime = 0;

    // Bring the intro screen back.
    introContainer.style.display =
      'flex';

    introContainer.style.opacity =
      '1';

    // Restore all three intro buttons.
    introButtons.style.display =
      'flex';

    // Update fullscreen button text.
    if (document.fullscreenElement) {

      fullScreenButton.textContent =
        "Exit Full Screen";

    } else {

      fullScreenButton.textContent =
        "Full Screen";

    }

  });

});