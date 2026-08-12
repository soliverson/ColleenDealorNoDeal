document.addEventListener('DOMContentLoaded', () => {
  const introVideo = document.getElementById('introVideo');
  const introContainer = document.getElementById('introVideoContainer');
  const playButton = document.getElementById('introPlayButton');
  const skipButton = document.getElementById('skipIntroButton');
  const watchIntroBtn = document.getElementById('watchIntroBtn');

  playButton.addEventListener('click', () => {
    introVideo.muted = false;
    introVideo.play();
    playButton.style.display = 'none';
    skipButton.style.display = 'none';
  });

  skipButton.addEventListener('click', () => {
    introVideo.pause();
    introContainer.style.transition = 'opacity 1s';
    introContainer.style.opacity = '0';
    setTimeout(() => {
      introContainer.style.display = 'none';
    }, 1000);
  });

  introVideo.addEventListener('ended', () => {
    introContainer.style.transition = 'opacity 1s';
    introContainer.style.opacity = '0';
    setTimeout(() => {
      introContainer.style.display = 'none';
    }, 1000);
  });

  watchIntroBtn.addEventListener('click', () => {
    introVideo.currentTime = 0;
    introContainer.style.display = 'flex';
    introContainer.style.opacity = '1';
    playButton.style.display = 'block';
    skipButton.style.display = 'block';
  });
});