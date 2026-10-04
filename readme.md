# 🎮 2D Grover Journey

Welcome to **2D Grover Journey** – my interactive portfolio built like a video game!

Instead of just reading a boring list of projects, you get to **walk around, click things, and explore my world**. Think of it like Pokémon meets a digital résumé.

---

This is a website where you:

* 👆 Tap or click the screen to move around, or use the arrow keys / WASD.
* 🖱️ Scroll to walk up and down the endless hallway.
* 💬 Talk to objects (like my computer, books, or TV) to learn about me.
* ❌ After reading a menu, click **Close** to keep exploring.
* 🎉 Have fun while learning what I do as a Network Engineer and Developer!

---

## 🛠 Built With

* [Kaboom.js](https://kaboomjs.com/) – game engine for the 2D world
* HTML / CSS – makes the text and style look nice
* JavaScript – makes the world come alive

---


## 🧑‍💻 Run it locally

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

Copy `.env.example` to `.env` and set `VITE_GA_MEASUREMENT_ID` to enable Google Analytics (optional).

## ♾️ Floors (v2)

The world is a stack of floors that repeats forever up and down. Each floor is a PNG plus a Tiled JSON in `public/`, listed in `floors` in `src/constants.js`. Every floor must be the same size and keep the stairwell (tile columns 11–13) open at the top and bottom. Named objects in the `boundaries` layer show the matching text from `dialogueData`.

---

## 🌐 Live Demo

👉 Play it here: [2d-grover.pages.dev](https://2d-grover.pages.dev/)

---

## 📬 Contact

* Website: [ronniegrover.com](https://ronniegrover.com)
* Certifications: [Credly](https://www.credly.com/users/ronniegrover)
* GitHub: [@rgrover00](https://github.com/rgrover00)
