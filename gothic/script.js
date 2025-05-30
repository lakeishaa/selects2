const radios = document.querySelectorAll('input[name="viewMode"]');
radios.forEach(radio => {
  radio.addEventListener("change", function () {
    if (this.checked) {
      if (this.value === "gothic") {
        window.location.href = "https://lakeishaa.github.io/selects2/gothic/index.html";
      } else if (this.value === "chrome") {
        window.location.href = "https://lakeishaa.github.io/selects2/chrome/index.html";
      } else {
        window.location.href = "https://lakeishaa.github.io/selects2/";
      }
    }
  });
});

const colors = [
  "#32B5FF", // MIK-C3.mp3
  "#FF3232", // MIK-D3.mp3
  "#0EDC0A", // MIK-E3.mp3
  "#E9ED19", // MIK-FS3.mp3
  "#FF87F3", // MIK-GS3.mp3
  "#fa7aed", // MIK-AS3.mp3
];

// Map colors to audio files
const audioFiles = {
  "#32B5FF": "assets/MIK-C3.mp3",
  "#FF3232": "assets/MIK-D3.mp3",
  "#0EDC0A": "assets/MIK-E3.mp3",
  "#E9ED19": "assets/MIK-FS3.mp3",
  "#FF87F3": "assets/MIK-AS3.mp3", // Replace with actual paths
  "#fa7aed": "assets/MIK-GS3.mp3", // Ensure unique keys or handle duplicates appropriately
};

// Store audio objects to preload
const audioElements = {};

function preloadAudio() {
  colors.forEach((color) => {
    const audioSrc = audioFiles[color];
    if (audioSrc) {
      audioElements[color] = new Audio(audioSrc);
      audioElements[color].load(); // Preload the audio
    }
  });
}

// Initialize audio on first user interaction
document.addEventListener("click", () => {
  preloadAudio();
});

// Get all black cells
const blackCells = document.querySelectorAll(".cell.black");

blackCells.forEach((cell) => {
  cell.addEventListener("mouseenter", () => {
    const randomColor = getRandomColor();
    cell.style.backgroundColor = randomColor; // Change background color to random

    // Play corresponding audio
    const audioElement = audioElements[randomColor];
    if (audioElement) {
      audioElement.currentTime = 0; // Reset audio to start
      audioElement.play();
    }
  });

  // Remove the mouseleave behavior that affects audio
  cell.addEventListener("mouseleave", () => {
    cell.classList.add("transition");
    setTimeout(() => {
      cell.style.backgroundColor = ""; // Reset to default (or specify a color)
      cell.classList.remove("transition");
    }, 1000); // Duration of the color change effect
  });
});

// Function to randomly select a color from the predefined colors
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

// Preload audio files
preloadAudio();
