/* =========================================
   TYPING SPEED TEST — COMPLETE SCRIPT
   ========================================= */

// ---- DOM refs ----
const testScreen = document.getElementById('test-screen');
const resultsScreen = document.getElementById('results-screen');
const textDisplay = document.getElementById('text-display');
const hiddenInput = document.getElementById('hidden-input');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const goAgainBtn = document.getElementById('go-again-btn');

const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const timeDisplayEl = document.getElementById('time-display');
const personalBestEl = document.getElementById('personal-best-value');

const resultTitleEl = document.getElementById('result-title');
const resultSubtitleEl = document.getElementById('result-subtitle');
const resultWpmEl = document.getElementById('result-wpm');
const resultAccuracyEl = document.getElementById('result-accuracy');
const resultCharsCorrectEl = document.getElementById('result-chars-correct');
const resultCharsWrongEl = document.getElementById('result-chars-wrong');
const resultIconWrapper = document.getElementById('result-icon-wrapper');
const confettiCanvas = document.getElementById('confetti-canvas');

const difficultyBtns = document.querySelectorAll('[data-difficulty]');
const modeBtns = document.querySelectorAll('[data-mode]');

// ---- State ----
let allData = null;
let currentText = '';
let charIndex = 0;
let errorCount = 0;
let totalErrors = 0;   // errors that ever happened (for accuracy)
let started = false;
let finished = false;
let timerInterval = null;
let elapsedSecs = 0;
let timedSecs = 60;
let currentDifficulty = 'hard';
let currentMode = 'timed';
const TIMED_LIMIT = 60;

// ---- localStorage personal best ----
function getPersonalBest() {
  return parseInt(localStorage.getItem('typingPB') || '0', 10);
}
function setPersonalBest(wpm) {
  localStorage.setItem('typingPB', wpm);
}
function renderPersonalBest() {
  const pb = getPersonalBest();
  personalBestEl.textContent = pb > 0 ? pb : '--';
}

// ---- Load data ----
fetch('./data.json')
  .then(r => r.json())
  .then(data => {
    allData = data;
    loadPassage();
    renderPersonalBest();
  })
  .catch(() => {
    textDisplay.textContent = 'Failed to load passages. Please refresh.';
  });

// ---- Load a random passage ----
function loadPassage() {
  const arr = allData[currentDifficulty];
  const passage = arr[Math.floor(Math.random() * arr.length)];
  currentText = passage.text;
  renderPassage();
  resetState();
}

// ---- Render passage as character spans ----
function renderPassage() {
  textDisplay.innerHTML = '';
  for (let i = 0; i < currentText.length; i++) {
    const span = document.createElement('span');
    span.classList.add('char');
    // Render spaces visibly
    span.textContent = currentText[i] === ' ' ? '\u00a0' : currentText[i];
    span.dataset.char = currentText[i];
    textDisplay.appendChild(span);
  }
  // Set cursor on first char
  updateCursor();
}

function getCharSpans() {
  return textDisplay.querySelectorAll('.char');
}

function updateCursor() {
  const spans = getCharSpans();
  spans.forEach(s => s.classList.remove('cursor'));
  if (charIndex < spans.length) {
    spans[charIndex].classList.add('cursor');
  }
}

// ---- Reset state (no reload of passage) ----
function resetState() {
  charIndex = 0;
  errorCount = 0;
  totalErrors = 0;
  started = false;
  finished = false;
  elapsedSecs = 0;
  timedSecs = TIMED_LIMIT;
  clearInterval(timerInterval);
  timerInterval = null;

  wpmEl.textContent = '0';
  accuracyEl.textContent = '100%';
  updateTimeDisplay();

  startOverlay.classList.remove('hidden');
  textDisplay.classList.add('blurred');
  hiddenInput.value = '';
  updateCursor();
}

function updateTimeDisplay() {
  if (currentMode === 'timed') {
    const remaining = TIMED_LIMIT - elapsedSecs;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    timeDisplayEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
  } else {
    const m = Math.floor(elapsedSecs / 60);
    const s = elapsedSecs % 60;
    timeDisplayEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }
}

// ---- Start test ----
function startTest() {
  if (started || finished) return;
  started = true;
  startOverlay.classList.add('hidden');
  textDisplay.classList.remove('blurred');
  hiddenInput.focus();

  timerInterval = setInterval(() => {
    elapsedSecs++;
    updateTimeDisplay();
    updateWPM();

    if (currentMode === 'timed' && elapsedSecs >= TIMED_LIMIT) {
      finishTest();
    }
  }, 1000);
}

// ---- WPM calculation (gross WPM) ----
function updateWPM() {
  const minutes = elapsedSecs / 60;
  if (minutes === 0) return;
  const wordsTyped = charIndex / 5;
  const wpm = Math.round(wordsTyped / minutes);
  wpmEl.textContent = wpm;

  // Accuracy: % of chars typed correctly (charIndex attempted, totalErrors wrong)
  const attempted = charIndex + totalErrors;
  const acc = attempted > 0 ? Math.round(((charIndex) / (charIndex + totalErrors)) * 100) : 100;
  accuracyEl.textContent = `${Math.min(100, acc)}%`;
}

// ---- Handle keystrokes ----
hiddenInput.addEventListener('input', (e) => {
  if (!started || finished) return;

  const spans = getCharSpans();
  const typed = hiddenInput.value;
  const lastChar = typed[typed.length - 1];
  hiddenInput.value = ''; // always reset so we track one char at a time

  if (lastChar === undefined) return;

  const expected = currentText[charIndex];

  if (lastChar === expected) {
    // Correct
    spans[charIndex].classList.add('correct');
    spans[charIndex].classList.remove('wrong');
    charIndex++;
  } else {
    // Wrong
    spans[charIndex].classList.add('wrong');
    totalErrors++;
    charIndex++;
  }

  updateCursor();
  updateWPM();

  // Passage mode: finish when all chars typed
  if (charIndex >= currentText.length) {
    finishTest();
  }
});

// Backspace support via keydown
hiddenInput.addEventListener('keydown', (e) => {
  if (!started || finished) return;
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (charIndex > 0) {
      charIndex--;
      const spans = getCharSpans();
      spans[charIndex].classList.remove('correct', 'wrong');
      updateCursor();
      updateWPM();
    }
  }
});

// ---- Finish test ----
function finishTest() {
  if (finished) return;
  finished = true;
  clearInterval(timerInterval);

  // Final stats
  const minutes = Math.max(elapsedSecs, 1) / 60;
  const wordsTyped = charIndex / 5;
  const finalWPM = Math.round(wordsTyped / minutes);

  const attempted = charIndex + totalErrors;
  const finalAcc = attempted > 0
    ? Math.round((charIndex / (charIndex + totalErrors)) * 100)
    : 100;
  const charsCorrect = charIndex - countWrong();
  const charsWrong = countWrong();

  // Determine result type
  const pb = getPersonalBest();
  let resultType = 'normal';
  if (pb === 0) {
    resultType = 'first';
  } else if (finalWPM > pb) {
    resultType = 'new-pb';
  }

  // Save PB
  if (finalWPM > pb) {
    setPersonalBest(finalWPM);
    renderPersonalBest();
  } else if (pb === 0) {
    setPersonalBest(finalWPM);
    renderPersonalBest();
  }

  showResults(finalWPM, finalAcc, charsCorrect, charsWrong, resultType);
}

function countWrong() {
  const spans = getCharSpans();
  let count = 0;
  spans.forEach(s => { if (s.classList.contains('wrong')) count++; });
  return count;
}

// ---- Show results screen ----
function showResults(wpm, acc, correct, wrong, type) {
  testScreen.classList.add('hidden');
  resultsScreen.classList.remove('hidden');

  resultWpmEl.textContent = wpm;
  resultAccuracyEl.textContent = `${acc}%`;
  resultCharsCorrectEl.textContent = correct;
  resultCharsWrongEl.textContent = wrong;

  confettiCanvas.classList.add('hidden');

  if (type === 'first') {
    resultIconWrapper.innerHTML = `<img src="./assets/images/icon-completed.svg" alt="Completed" width="80" height="80">`;
    resultTitleEl.textContent = 'Baseline Established!';
    resultSubtitleEl.textContent = "You've set the bar. Now the real challenge begins—time to beat it.";
    goAgainBtn.childNodes[0].textContent = 'Beat This Score ';
  } else if (type === 'new-pb') {
    resultIconWrapper.innerHTML = `<img src="./assets/images/icon-new-pb.svg" alt="New Personal Best" width="80" height="80">`;
    resultTitleEl.textContent = 'High Score Smashed!';
    resultSubtitleEl.textContent = "You're getting faster. That was incredible typing.";
    goAgainBtn.childNodes[0].textContent = 'Beat This Score ';
    launchConfetti();
  } else {
    resultIconWrapper.innerHTML = `<img src="./assets/images/icon-completed.svg" alt="Completed" width="80" height="80">`;
    resultTitleEl.textContent = 'Test Complete!';
    resultSubtitleEl.textContent = 'Solid run. Keep pushing to beat your high score.';
    goAgainBtn.childNodes[0].textContent = 'Go Again ';
  }
}

// ---- Confetti ----
function launchConfetti() {
  confettiCanvas.classList.remove('hidden');
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f4dc73', '#a855f7'];
  const pieces = Array.from({ length: 180 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height * 0.5 + confettiCanvas.height * 0.5,
    w: 8 + Math.random() * 8,
    h: 5 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 2,
    vy: -(2 + Math.random() * 4),
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    gravity: 0.08,
    alpha: 1,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;
    pieces.forEach(p => {
      if (p.alpha <= 0) return;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.angle += p.spin;
      if (p.y > confettiCanvas.height * 0.7) p.alpha -= 0.01;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) frame = requestAnimationFrame(draw);
    else confettiCanvas.classList.add('hidden');
  }
  cancelAnimationFrame(frame);
  draw();
}

// ---- Controls ----

// Difficulty buttons
difficultyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    difficultyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDifficulty = btn.dataset.difficulty;
    loadPassage();
  });
});

// Mode buttons
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    // Reset timer display
    if (currentMode === 'passage') {
      elapsedSecs = 0;
      timeDisplayEl.textContent = '0:00';
    } else {
      elapsedSecs = 0;
      timeDisplayEl.textContent = '0:60';
    }
    loadPassage();
  });
});

// Start button
startBtn.addEventListener('click', () => {
  startTest();
  hiddenInput.focus();
});

// Click on text display starts test
textDisplay.addEventListener('click', () => {
  if (!started && !finished) {
    startTest();
  }
  hiddenInput.focus();
});

// Restart
restartBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  loadPassage();
  hiddenInput.focus();
});

// Go Again
goAgainBtn.addEventListener('click', () => {
  cancelAnimationFrame(undefined);
  resultsScreen.classList.add('hidden');
  testScreen.classList.remove('hidden');
  loadPassage();
});

// Keep focus on hidden input while test is running
document.addEventListener('keydown', (e) => {
  if (started && !finished) {
    hiddenInput.focus();
  }
  // Start with any keypress if test not started
  if (!started && !finished && e.key.length === 1) {
    startTest();
    // Feed the first typed character
    const spans = getCharSpans();
    const expected = currentText[charIndex];
    if (e.key === expected) {
      spans[charIndex].classList.add('correct');
      charIndex++;
    } else {
      spans[charIndex].classList.add('wrong');
      totalErrors++;
      charIndex++;
    }
    updateCursor();
    updateWPM();
    if (charIndex >= currentText.length) finishTest();
  }
});