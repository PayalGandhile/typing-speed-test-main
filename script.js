console.log("JS connected successfully");

const textDisplay = document.getElementById("text-display");
const button = document.querySelector(".controls");
const difficultyButtons = document.querySelectorAll("[data-difficulty]");

fetch("data.json")
  .then((response) => {
    console.log("Status:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("JSON loaded:", data);
    const defaultArray = data.easy;
    const randomIndex = Math.floor(Math.random() * defaultArray.length);
    textDisplay.innerText = defaultArray[randomIndex].text;

    button.addEventListener("click", function (e) {
      const difficulty = e.target.dataset.difficulty;

      if (!difficulty) return; // ignore non-difficulty clicks

      const selectedArray = data[difficulty];

      const randomIndex = Math.floor(Math.random() * selectedArray.length);

      const selectedText = selectedArray[randomIndex].text;

      textDisplay.innerText = selectedText;
    });
  })
  .catch((error) => {
    console.error("Error loading JSON:", error);

    textDisplay.innerText = "Failed to load passages. Please refresh.";

    difficultyButtons.forEach((btn) => {
      btn.disabled = true;
    });
  });
