const tapBtn        = document.getElementById("tapBtn");
const scoreDisplay  = document.getElementById("score");
const timerDisplay  = document.getElementById("timer");
const countdownEl   = document.getElementById("countdown");
const leaderboard   = document.getElementById("leaderboard");
const submitModal   = document.getElementById("submitModal");
const resultPanel   = document.getElementById("resultPanel");
const rewardText    = document.getElementById("rewardText");
const luckyDrawText = document.getElementById("luckyDrawText");
const positionText  = document.getElementById("positionText");
const closeResultBtn= document.getElementById("closeResultBtn");
const tapBtnLabel   = document.getElementById("tapBtnLabel");

let taps = 0;
let timeLeft = 30;
let timer;
let finalScore = 0;
let gameStarted = false;
let loadingDotsInterval;

function submitScore(name, phone, score) {
  return fetch('./submit-score.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, score })
  }).then(r=>r.json());
}

function loadLeaderboard() {
  fetch('./get-leaderboard.php')
    .then(r=>r.json())
    .then(data => {
      leaderboard.innerHTML = '';
      data.forEach(e => {
        const li = document.createElement('li');
        li.textContent = `${e.name} - ${e.score} taps`;
        leaderboard.appendChild(li);
      });
    });
}

function getReward(score){
  if(score < 150)      return {text:"Try harder!", draw:false};
  if(score<=250)      return {text:"$30 voucher", draw:false};
  return {text:"$30 voucher", draw:true};
}

function showResultPanel(){
  const reward = getReward(finalScore);
  rewardText.textContent = `Reward: ${reward.text}`;
  luckyDrawText.textContent = reward.draw ? '✅ You are entered into the lucky draw for a free massage gun!' : '';

  fetch('./get-leaderboard.php')
    .then(r => r.json())
    .then(data => {
      const sorted = data.sort((a, b) => b.score - a.score);
      const rank = sorted.findIndex(e => e.score === finalScore) + 1;
      positionText.textContent = `You placed #${rank} on the leaderboard!`;

      // Hide loading overlay when result is ready
      clearInterval(loadingDotsInterval);
      document.getElementById("loadingOverlay").style.display = "none";

      // Show result panel
      resultPanel.style.display = 'flex';
    });
}

// When image button is clicked
tapBtn.addEventListener('click', () => {
  if (!gameStarted) {
    gameStarted = true;
    taps = 0;
    timeLeft = 30;
    tapBtnLabel.textContent = `${taps}`;
    timerDisplay.innerHTML = 'Time Left: <br>30s';
    tapBtn.disabled = true;

    let countdown = 3;
    tapBtnLabel.textContent = countdown;
    pulse(); // first pulse for “3”

    // ---- Countdown interval ----
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown >= 1) {
        tapBtnLabel.textContent = countdown;
        pulse(); // pulse for “2” then “1”
      } else {
        clearInterval(countdownInterval);

        tapBtnLabel.textContent = 'TAP';
        tapBtn.disabled = false;

        // ---- Game timer ----
        timer = setInterval(() => {
          timeLeft--;
          timerDisplay.innerHTML = `Time Left: ${timeLeft}s`;

          if (timeLeft <= 0) {
            clearInterval(timer);
            tapBtn.disabled = true;
            tapBtnLabel.textContent = 'Done!';
            timerDisplay.innerHTML = "⏱️ Time's up!";
            finalScore = taps;
            document.getElementById("finalScoreText").textContent = finalScore;
            submitModal.style.display = 'block';

            document.querySelector('.front-page').style.display = 'none';
          }
        }, 1000);
      }
    }, 1000);
  } else if (timeLeft > 0) {
    taps++;
    tapBtnLabel.textContent = `${taps}`;

    // Tap animation
    tapBtn.classList.add('clicked');
    setTimeout(() => tapBtn.classList.remove('clicked'), 50);
  }

  // helper: pulse animation
  function pulse() {
    tapBtnLabel.classList.add('countdown');
    setTimeout(() => tapBtnLabel.classList.remove('countdown'), 400);
  }
});


// ---- Submit button logic (updated) ----
document.getElementById("submitScoreBtn").addEventListener("click", () => {
  const name = document.getElementById("finalName").value.trim();
  const phone = document.getElementById("finalPhone").value.trim();
  const pdpaChecked = document.getElementById("pdpaCheck").checked;

  if (!name || !phone) {
    alert("Please enter name & phone");
    return;
  }
  if (!pdpaChecked) {
    alert("Please agree to the PDPA terms and conditions.");
    return;
  }

  // Hide submit modal, show loading overlay
  submitModal.style.display = "none";
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.style.display = "flex";

  // Start animated dots:  . → .. → ...
  const loadingDots = document.getElementById("loadingDots");
  let dotCount = 1;
  loadingDots.textContent = ".";
  loadingDotsInterval = setInterval(() => {
    dotCount = (dotCount % 3) + 1;  // cycles 1→2→3
    loadingDots.textContent = ".".repeat(dotCount);
  }, 400);

  // Submit score → refresh leaderboard → show result
  submitScore(name, phone, finalScore)
    .then(() => loadLeaderboard())
    .then(() => {
      showResultPanel();                 // (hides loader inside)
      // Reset form fields
      document.getElementById("finalName").value = "";
      document.getElementById("finalPhone").value = "";
      tapBtnLabel.textContent = "Play Now";
      gameStarted = false;
    })
    .catch(err => {
      console.error("Submission error:", err);
      alert("Error submitting score. Please try again.");
      clearInterval(loadingDotsInterval);
      loadingOverlay.style.display = "none";
    });
});


closeResultBtn.addEventListener('click', () => {
  resultPanel.style.display = 'none';

  // Show front page again
  document.querySelector('.front-page').style.display = 'flex';

  // Reset game state
  taps = 0;
  timeLeft = 30;
  gameStarted = false;

  // Reset button text and state
  tapBtnLabel.textContent = 'Play Now';
  tapBtn.disabled = false;

  // Optionally reset timer/score display
  document.getElementById("score").style.display = "block";
  document.getElementById("score").innerHTML = "Taps:<br> 0";
  timerDisplay.innerHTML = "Time Left:<br> 30s";
});
loadLeaderboard();
