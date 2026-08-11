function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log("Sound error: " + err));
    }
  }
  
  function stopSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
  