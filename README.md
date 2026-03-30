# Frontend Mentor - Typing Speed Test solution

This is a solution to the [Typing Speed Test challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/typing-speed-test). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
  - [AI Collaboration](#ai-collaboration)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- Start a test by clicking the Start button or by clicking the passage and typing
- Select a difficulty level — Easy, Medium, or Hard — for passages of varying complexity
- Switch between **Timed (60s)** mode and **Passage** mode (timer counts up with no limit)
- Restart at any time to get a new random passage from the selected difficulty
- See real-time WPM, accuracy, and time stats while typing
- See visual feedback showing correct characters (green), errors (red/underlined), and cursor position
- Correct mistakes with backspace (original errors still count against accuracy)
- View results showing WPM, accuracy, and characters typed after completing a test
- See a **"Baseline Established!"** message on their first test, setting their personal best
- See a **"High Score Smashed!"** celebration with confetti when beating their personal best
- Have their personal best persist across sessions via `localStorage`
- View the optimal layout depending on their device's screen size
- See hover and focus states for all interactive elements on the page

### Screenshot

![](./preview.jpg)

### Links

- Solution URL: [Add solution URL here]( )
- Live Site URL: [Add live site URL here](https://your-live-site-url.com)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox layout
- Mobile-first responsive design
- Vanilla JavaScript (no frameworks)
- `localStorage` for personal best persistence
- Canvas API for confetti animation

### What I learned

Working through this project gave me hands-on experience with several JavaScript concepts I hadn't used much before.

Tracking typing character by character — rather than comparing full strings — was the key insight for showing real-time feedback per letter:

```js
const expected = currentText[charIndex];
if (lastChar === expected) {
  spans[charIndex].classList.add('correct');
  charIndex++;
} else {
  spans[charIndex].classList.add('wrong');
  totalErrors++;
  charIndex++;
}
```

I also learned how to use the Canvas API to build a simple confetti animation from scratch using `requestAnimationFrame`:

```js
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.y += p.vy;
    p.vy += p.gravity;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });
  requestAnimationFrame(draw);
}
```

On the CSS side, I got comfortable using CSS custom properties for a consistent color system across the whole project, which made theming much easier to manage.

### Continued development

In future projects I want to focus on:

- **Accessibility** — I want to go deeper on ARIA roles and live regions so dynamic updates (like stats changing while typing) are properly announced to screen reader users.
- **CSS animations** — The cursor blink and character highlight transitions were my first real use of keyframe animations. I'd like to get more confident with complex CSS motion.
- **JavaScript state management** — As the script grew, managing all the state variables (started, finished, charIndex, etc.) felt a bit scattered. I want to explore cleaner patterns for organising state in vanilla JS before moving to a framework.
- **Testing** — I'd like to learn how to write basic unit tests for logic functions like WPM calculation and accuracy tracking.

### Useful resources

- [MDN — KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) — Essential for understanding how to capture keystrokes reliably, especially the difference between `keydown` and `input` events.
- [MDN — Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) — Used this to build the confetti animation for the new personal best screen.
- [MDN — localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — Clear and concise reference for persisting the personal best score across sessions.
- [CSS-Tricks — A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) — My go-to reference whenever I got confused about alignment and spacing in the stats bar and results cards.
- [web.dev — Accessible focus management](https://web.dev/focus-management/) — Helped me think through how to manage keyboard focus correctly when switching between the test and results screens.

### AI Collaboration

I used **Claude (Anthropic)** as a coding assistant throughout this project.


- **How I used it:** I shared my existing HTML skeleton and partial CSS, and asked Claude to help me complete the full implementation — including the JavaScript game logic, CSS redesign matching the Figma designs, and the results screen with confetti.

- **What worked well:** Having Claude read the design screenshots and `data.json` structure meant it could suggest a complete, cohesive solution in one pass. The character-by-character typing tracker and the three different result states (first test / new PB / normal) were areas where talking through the logic with Claude helped me understand *why* each piece worked, not just what to write.

- **What I learned from the process:** Claude explained concepts like `requestAnimationFrame` for the canvas animation and why a hidden `<input>` is the best approach for capturing keystrokes — things I wouldn't have found quickly by searching alone.

- **What to watch out for:** AI-generated code still needs to be read carefully. I reviewed every function to make sure I understood it before treating it as "my" solution.

## Author

- Frontend Mentor - [@Payal Dipak Gandhile] (https://www.frontendmentor.io/profile/PayalGandhile)