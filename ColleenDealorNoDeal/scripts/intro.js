document.addEventListener('DOMContentLoaded', () => {
  const introVideo = document.getElementById('introVideo');
  const introContainer = document.getElementById('introVideoContainer');
  const playButton = document.getElementById('introPlayButton');
  const watchIntroBtn = document.getElementById('watchIntroBtn');

  // When play button is clicked, unmute and play the video.
  playButton.addEventListener('click', () => {
    introVideo.muted = false; // Ensure audio plays.
    introVideo.play();
    playButton.style.display = 'none';
  });

  // When the video ends, fade out and hide the intro container.
  introVideo.addEventListener('ended', () => {
    introContainer.style.transition = 'opacity 1s';
    introContainer.style.opacity = '0';
    setTimeout(() => {
      introContainer.style.display = 'none';
    }, 1000);
  });

  // "Watch Intro Again" button resets and shows the intro video.
  watchIntroBtn.addEventListener('click', () => {
    // Reset the video.
    introVideo.currentTime = 0;
    // Show the intro container.
    introContainer.style.display = 'flex';
    introContainer.style.opacity = '1';
    // Show the play button again so user can click to play with audio.
    playButton.style.display = 'block';
  });
});
