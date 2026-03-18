# Phaser Pac-Man 🕹️

A fully functional, arcade-style Pac-Man clone built using **Phaser 3** and **JavaScript**. This project features classic mechanics including ghost AI, power pellets, "frightened" states, and warp tunnels.

## 🤖 Built with Gemini
This project was developed through an iterative, collaborative process with **Gemini**. The development focused on:
* **Pair Programming:** Collaborative logic building for ghost movement and collision handling.
* **Modular Design:** Transitioning from basic scripts to a structured game loop with reusable functions.
* **Arcade Authenticity:** Implementing classic features like "hit-stop" effects, blinking warnings, and high-score persistence.

## 🚀 Features
* **Classic Gameplay:** Eat all pellets to win while avoiding ghosts.
* **Ghost AI:** Multiple ghosts (Blinky & Pinky) with randomized pathfinding.
* **Power-Ups:** Eat Power Pellets to turn the tables, slowing ghosts down and making them edible.
* **Warp Tunnels:** Seamless screen-wrap movement on the center row.
* **Persistence:** High scores are saved to your browser's `localStorage`.
* **Arcade UI:** Retro-style blinking "Press Space" prompts and lives counter.

## 🛠️ Tech Stack
* **Engine:** [Phaser 3](https://phaser.io/)
* **Language:** JavaScript (ES6+)
* **Storage:** Web Storage API (LocalStorage)
* **Graphics:** Dynamic Procedural Textures (Phaser Graphics)

## 🎮 How to Play
1.  **Clone the repo:** `git clone https://github.com/jd-dev-studios/phaser-pacman.git`
2.  **Run a local server:** Because Phaser loads assets/logic via scripts, use an extension like "Live Server" in VS Code or run `python -m http.server`.
3.  **Controls:** * **Arrow Keys:** Move Pac-Man.
    * **Spacebar:** Restart after Game Over.

## 🗺️ Map Legend
* `1`: Wall
* `0`: Pellet (10 pts)
* `3`: Power Pellet (50 pts + Frightened Mode)
* `2`: Ghost House (Ghost only)
* `5`: Pac-Man Spawn