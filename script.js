document.addEventListener('DOMContentLoaded', () => {
  const timerType = document.getElementById('timerType');
  const timerDisplay = document.getElementById('timerDisplay');
  const timerControls = document.getElementById('timerControls');
  const feedback = document.getElementById('feedback');
  let timer = null, chess = null;

  const clearTimer = () => { if (timer) clearInterval(timer); timer = null; };
  const showFeedback = (msg, isError = false) => {
    feedback.textContent = msg;
    feedback.className = isError ? 'feedback error' : 'feedback';
  };

  timerType.addEventListener('change', () => {
    clearTimer();
    timerDisplay.textContent = '';
    timerControls.innerHTML = '';
    feedback.textContent = '';
    timerDisplay.classList.add('visible');
    timerControls.classList.add('visible');
    if (!timerType.value) {
      timerDisplay.textContent = 'Select a timer type to begin';
      timerControls.classList.remove('visible');
      return;
    }
    timerMap[timerType.value]();
  });

  // Timer Renderers
  const timerMap = {
    countdown: renderCountdown,
    stopwatch: renderStopwatch,
    hiit: renderHIIT,
    pomodoro: renderPomodoro,
    chess: renderChess,
    event: renderEventCountdown,
    tabata: renderTabata,
    custom: renderCustomInterval,
    presentation: renderPresentation,
    breathing: renderBreathing,
    soundloop: renderSoundLoop,
  };

  // Countdown Timer
  function renderCountdown() {
    timerControls.innerHTML = `
      <label for="countdownInput">Seconds:</label>
      <input type="number" id="countdownInput" min="1" required>
      <button id="startCountdown"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startCountdown').addEventListener('click', () => {
      let time = parseInt(document.getElementById('countdownInput').value, 10);
      if (isNaN(time) || time < 1) return showFeedback('Please enter a valid number of seconds.', true);
      showFeedback('');
      clearTimer();
      timerDisplay.textContent = `${time}s`;
      timer = setInterval(() => {
        timerDisplay.textContent = time > 0 ? `${time}s` : "Time's up!";
        if (time-- <= 0) clearTimer();
      }, 1000);
    });
  }

  // Stopwatch
  function renderStopwatch() {
    timerControls.innerHTML = `
      <button id="startStopwatch"><i class="fa fa-play"></i>Start</button>
      <button id="pauseStopwatch"><i class="fa fa-pause"></i>Pause</button>
      <button id="resetStopwatch"><i class="fa fa-rotate-left"></i>Reset</button>
    `;
    let elapsed = 0;
    timerDisplay.textContent = '0s';
    document.getElementById('startStopwatch').addEventListener('click', () => {
      clearTimer();
      timer = setInterval(() => timerDisplay.textContent = `${++elapsed}s`, 1000);
    });
    document.getElementById('pauseStopwatch').addEventListener('click', clearTimer);
    document.getElementById('resetStopwatch').addEventListener('click', () => {
      clearTimer();
      elapsed = 0;
      timerDisplay.textContent = '0s';
    });
  }

  // HIIT Timer
  function renderHIIT() {
    timerControls.innerHTML = `
      <label>Work (sec):</label><input type="number" id="hiitWork" min="1">
      <label>Rest (sec):</label><input type="number" id="hiitRest" min="1">
      <label>Rounds:</label><input type="number" id="hiitRounds" min="1">
      <button id="startHIIT"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startHIIT').addEventListener('click', () => {
      let work = parseInt(document.getElementById('hiitWork').value, 10);
      let rest = parseInt(document.getElementById('hiitRest').value, 10);
      let rounds = parseInt(document.getElementById('hiitRounds').value, 10);
      if ([work, rest, rounds].some(v => isNaN(v) || v < 1))
        return showFeedback('Please enter valid positive numbers for work, rest, and rounds.', true);
      showFeedback('');
      let current = 1, mode = 'Work', time = work;
      clearTimer();
      timer = setInterval(() => {
        timerDisplay.textContent = `Round ${current} - ${mode}: ${time}s`;
        if (time-- < 1) {
          if (mode === 'Work') { mode = 'Rest'; time = rest; }
          else if (++current > rounds) { clearTimer(); timerDisplay.textContent = "HIIT complete!"; }
          else { mode = 'Work'; time = work; }
        }
      }, 1000);
    });
  }

  // Pomodoro Timer
  function renderPomodoro() {
    timerControls.innerHTML = `
      <label>Work (min):</label><input type="number" id="pomoWork" min="1">
      <label>Break (min):</label><input type="number" id="pomoBreak" min="1">
      <label>Rounds:</label><input type="number" id="pomoRounds" min="1">
      <button id="startPomodoro"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startPomodoro').addEventListener('click', () => {
      let work = parseInt(document.getElementById('pomoWork').value, 10) * 60;
      let rest = parseInt(document.getElementById('pomoBreak').value, 10) * 60;
      let rounds = parseInt(document.getElementById('pomoRounds').value, 10);
      if ([work, rest, rounds].some(v => isNaN(v) || v < 1))
        return showFeedback('Please enter valid positive numbers for work, break, and rounds.', true);
      showFeedback('');
      let current = 1, mode = 'Work', time = work;
      clearTimer();
      timer = setInterval(() => {
        timerDisplay.textContent = `Round ${current} - ${mode}: ${Math.floor(time/60)}m ${time%60}s`;
        if (time-- < 1) {
          if (mode === 'Work') { mode = 'Break'; time = rest; }
          else if (++current > rounds) { clearTimer(); timerDisplay.textContent = "Pomodoro complete!"; }
          else { mode = 'Work'; time = work; }
        }
      }, 1000);
    });
  }

  // Chess Clock
  function renderChess() {
    timerControls.innerHTML = `
      <label>Minutes per player:</label>
      <input type="number" id="chessTime" min="1">
      <button id="startChess"><i class="fa fa-play"></i>Start</button>
      <button id="switchBtn" disabled><i class="fa fa-rotate"></i> Switch Player</button>
    `;
    chess = {active: null, times: [0,0], intervals: [null,null], running: false};
    document.getElementById('startChess').addEventListener('click', () => {
      let mins = parseInt(document.getElementById('chessTime').value, 10);
      if (isNaN(mins) || mins < 1) return showFeedback('Please enter minutes for each player.', true);
      showFeedback('');
      chess.times = [mins*60, mins*60];
      chess.active = 0;
      chess.running = true;
      document.getElementById('switchBtn').disabled = false;
      updateChessDisplay();
      runChessTimers();
    });
    document.getElementById('switchBtn').addEventListener('click', () => {
      if (!chess.running) return;
      chess.active = chess.active === 0 ? 1 : 0;
      runChessTimers();
    });
    function runChessTimers() {
      clearInterval(chess.intervals[0]); clearInterval(chess.intervals[1]);
      let act = chess.active;
      chess.intervals[act] = setInterval(() => {
        chess.times[act]--;
        updateChessDisplay();
        if (chess.times[act] <= 0) {
          clearInterval(chess.intervals[0]); clearInterval(chess.intervals[1]);
          timerDisplay.textContent = `Player ${act+1} time's up!`;
          chess.running = false;
          document.getElementById('switchBtn').disabled = true;
        }
      }, 1000);
    }
    function updateChessDisplay() {
      let format = t => `${Math.floor(t/60)}m ${t%60}s`;
      timerDisplay.textContent = `Player 1: ${format(chess.times[0])} | Player 2: ${format(chess.times[1])}`;
    }
  }

  // Event Countdown
  function renderEventCountdown() {
    timerControls.innerHTML = `
      <label>Date & time:</label>
      <input type="datetime-local" id="eventTime">
      <button id="startEventCountdown"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startEventCountdown').addEventListener('click', () => {
      let date = new Date(document.getElementById('eventTime').value);
      if (isNaN(date.getTime())) return showFeedback('Please select a valid date and time.', true);
      showFeedback('');
      clearTimer();
      timer = setInterval(() => {
        let diff = Math.floor((date.getTime() - Date.now())/1000);
        if (diff <= 0) { clearTimer(); timerDisplay.textContent = "Event started!"; return; }
        let d = Math.floor(diff/86400), h = Math.floor((diff%86400)/3600),
            m = Math.floor((diff%3600)/60), s = diff%60;
        timerDisplay.textContent = `${d}d ${h}h ${m}m ${s}s left`;
      },1000);
    });
  }

  // Tabata Timer
  function renderTabata() {
    timerControls.innerHTML = `
      <label>Work (sec):</label><input type="number" id="tabataWork" min="1">
      <label>Rest (sec):</label><input type="number" id="tabataRest" min="1">
      <label>Rounds:</label><input type="number" id="tabataRounds" min="1">
      <button id="startTabata"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startTabata').addEventListener('click', () => {
      let work = parseInt(document.getElementById('tabataWork').value, 10);
      let rest = parseInt(document.getElementById('tabataRest').value, 10);
      let rounds = parseInt(document.getElementById('tabataRounds').value, 10);
      if ([work, rest, rounds].some(v => isNaN(v) || v < 1))
        return showFeedback('Please enter valid values.', true);
      showFeedback('');
      let current = 1, mode = 'Work', time = work;
      clearTimer();
      timer = setInterval(() => {
        timerDisplay.textContent = `Round ${current} - ${mode}: ${time}s`;
        if (time-- < 1) {
          if (mode === 'Work') { mode = 'Rest'; time = rest; }
          else if (++current > rounds) { clearTimer(); timerDisplay.textContent = "Tabata complete!"; }
          else { mode = 'Work'; time = work; }
        }
      },1000);
    });
  }

  // Custom Interval Timer
  function renderCustomInterval() {
    timerControls.innerHTML = `
      <label>Pattern (e.g. 10,5,10):</label>
      <input type="text" id="customPattern">
      <button id="startCustomInterval"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startCustomInterval').addEventListener('click', () => {
      let pattern = document.getElementById('customPattern').value.split(',').map(x=>parseInt(x.trim(),10));
      if (!pattern.length || pattern.some(isNaN))
        return showFeedback('Enter a comma-separated list of seconds.', true);
      showFeedback('');
      let idx = 0, time = pattern[0];
      clearTimer();
      timer = setInterval(() => {
        timerDisplay.textContent = `Interval ${idx+1}: ${time}s`;
        if (time-- < 1) {
          if (++idx >= pattern.length) { clearTimer(); timerDisplay.textContent = "Custom intervals complete!"; }
          else time = pattern[idx];
        }
      },1000);
    });
  }

  // Presentation Timer
  function renderPresentation() {
    timerControls.innerHTML = `
      <label>Total minutes:</label>
      <input type="number" id="presTime" min="1">
      <button id="startPresentation"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startPresentation').addEventListener('click', () => {
      let time = parseInt(document.getElementById('presTime').value, 10) * 60;
      if (isNaN(time) || time < 1) return showFeedback('Enter total minutes.', true);
      showFeedback('');
      clearTimer();
      timer = setInterval(() => {
        timerDisplay.textContent = `Time left: ${Math.floor(time/60)}m ${time%60}s`;
        if (time-- < 1) { clearTimer(); timerDisplay.textContent = "Presentation time is up!"; }
      },1000);
    });
  }

  // Breathing Timer
  function renderBreathing() {
    timerControls.innerHTML = `
      <label>Inhale (sec):</label><input type="number" id="inhale" min="1">
      <label>Hold (sec):</label><input type="number" id="hold" min="0">
      <label>Exhale (sec):</label><input type="number" id="exhale" min="1">
      <label>Cycles:</label><input type="number" id="cycles" min="1">
      <button id="startBreathing"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startBreathing').addEventListener('click', () => {
      let inhale = parseInt(document.getElementById('inhale').value, 10);
      let hold = parseInt(document.getElementById('hold').value, 10);
      let exhale = parseInt(document.getElementById('exhale').value, 10);
      let cycles = parseInt(document.getElementById('cycles').value, 10);
      if ([inhale, hold, exhale, cycles].some(v=>isNaN(v)||v<0) || inhale < 1 || exhale < 1 || cycles < 1)
        return showFeedback('Enter valid numbers.', true);
      showFeedback('');
      let steps = [];
      for(let i=0; i<cycles; i++){
        steps.push({label:'Inhale',time:inhale});
        if(hold) steps.push({label:'Hold',time:hold});
        steps.push({label:'Exhale',time:exhale});
      }
      let idx = 0, t = steps[0].time;
      clearTimer();
      timer = setInterval(()=>{
        timerDisplay.textContent = `${steps[idx].label}: ${t}s`;
        if(t-- < 1){
          if(++idx>=steps.length){clearTimer();timerDisplay.textContent="Breathing complete!";return;}
          t = steps[idx].time;
        }
      },1000);
    });
  }

  // Repeating Sound Timer
  function renderSoundLoop() {
    timerControls.innerHTML = `
      <label>Interval (sec):</label>
      <input type="number" id="soundInterval" min="1">
      <label>Repeats:</label>
      <input type="number" id="soundRepeats" min="1">
      <button id="startSoundLoop"><i class="fa fa-play"></i>Start</button>`;
    document.getElementById('startSoundLoop').addEventListener('click', () => {
      let interval = parseInt(document.getElementById('soundInterval').value, 10);
      let repeats = parseInt(document.getElementById('soundRepeats').value, 10);
      if (isNaN(interval)||interval<1||isNaN(repeats)||repeats<1)
        return showFeedback('Enter valid values.', true);
      showFeedback('');
      let count = 0;
      clearTimer();
      timer = setInterval(()=>{
        timerDisplay.textContent = `Play sound! (${count+1}/${repeats})`;
        if(window.Audio) new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
        if(++count>=repeats){clearTimer();timerDisplay.textContent="Sound loop complete!";}
      },interval*1000);
    });
  }
});