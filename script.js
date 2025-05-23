let alarmInterval = null;
let countdownInterval = null;
let elapsedSeconds = 0;
let totalSeconds = 0;
let intervalSeconds = 0;
let isPaused = false;

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

startBtn.addEventListener('click', startAlarm);
pauseBtn.addEventListener('click', pauseAlarm);
stopBtn.addEventListener('click', stopAlarm);
resetBtn.addEventListener('click', resetAlarm);

function startAlarm() {
  const totalTime = parseInt(document.getElementById('totalTime').value);
  const intervalTime = parseInt(document.getElementById('intervalTime').value);
  const beepSound = document.getElementById('beepSound');

  if (isNaN(totalTime) || totalTime <= 0 || isNaN(intervalTime) || intervalTime <= 0) {
    alert('⛔ Please enter valid positive numbers.');
    return;
  }

  totalSeconds = totalTime * 60;
  intervalSeconds = intervalTime * 60;

  if (!isPaused) {
    stopAlarm(); // clear any previous intervals
    elapsedSeconds = 0;
  } else {
    isPaused = false;
  }

  playBeep(beepSound); // beep immediately on start
  updateStatus(elapsedSeconds, totalSeconds, false, false, intervalSeconds);

  // Alarm interval runs every second, check if interval reached to beep
  alarmInterval = setInterval(() => {
    elapsedSeconds++;
    if (elapsedSeconds > totalSeconds) {
      stopAlarm();
      updateStatus(totalSeconds, totalSeconds, true);
      return;
    }

    // Beep every intervalSeconds
    if (elapsedSeconds % intervalSeconds === 0) {
      playBeep(beepSound);
    }

    updateStatus(elapsedSeconds, totalSeconds, false, false, intervalSeconds - (elapsedSeconds % intervalSeconds));
  }, 1000);
}

function pauseAlarm() {
  if (!alarmInterval) return;
  clearInterval(alarmInterval);
  alarmInterval = null;
  isPaused = true;
  document.getElementById('status').textContent = '⏸️ Paused';
}

function stopAlarm() {
  clearInterval(alarmInterval);
  alarmInterval = null;
  elapsedSeconds = 0;
  isPaused = false;
  updateStatus(0, 0, false, true);
}

function resetAlarm() {
  stopAlarm();
  document.getElementById('totalTime').value = '';
  document.getElementById('intervalTime').value = '';
  document.getElementById('customMessage').value = '';
  updateStatus(0, 0, false, true);
}

function playBeep(beepSound) {
  let beepCount = 0;
  const maxBeeps = 3;  // play beep 3 times (~3 seconds)

  const beepInterval = setInterval(() => {
    beepSound.pause();
    beepSound.currentTime = 0;
    beepSound.play();

    if ('vibrate' in navigator) {
      navigator.vibrate(300);
    }

    beepCount++;
    if (beepCount >= maxBeeps) {
      clearInterval(beepInterval);
    }
  }, 1000);  // repeat every 1 second
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateStatus(elapsed, total, done = false, reset = false, remaining = 0) {
  const statusEl = document.getElementById('status');
  const countdownEl = document.getElementById('countdown');
  const customMessage = document.getElementById('customMessage').value || 'Interval alert triggered';
  const progressBar = document.getElementById('progressBar');

  if (progressBar && total > 0) {
    progressBar.value = Math.min((elapsed / total) * 100, 100);
  } else if (progressBar) {
    progressBar.value = 0;
  }

  if (reset) {
    statusEl.textContent = 'Status: Ready';
    countdownEl.textContent = '';
  } else if (done) {
    statusEl.textContent = `✅ Done! You completed ${Math.floor(total / 60)} minutes.`;
    countdownEl.textContent = '';
  } else {
    statusEl.textContent = `Status: Minute ${Math.floor(elapsed / 60) + 1} of ${Math.floor(total / 60)} — ${customMessage}`;
    countdownEl.textContent = `⏳ Next beep in: ${formatTime(remaining)}`;
  }
}
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (window.SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("Voice command:", transcript);

    if (transcript.includes("start")) {
      startAlarm();
    } else if (transcript.includes("pause")) {
      pauseAlarm();
    } else if (transcript.includes("stop")) {
      stopAlarm();
    } else if (transcript.includes("reset")) {
      resetAlarm();
    }
  };

recognition.onerror = function(event) {
  if (event.error === 'no-speech') {
    console.log("No speech detected. Please try again.");
  } else {
    console.error("Voice recognition error:", event);
  }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
}



