// script.js

// Add pointercancel event listener to remove the 'pressed' class from buttons

document.querySelectorAll('button').forEach(button => {
  button.addEventListener('pointercancel', () => {
    button.classList.remove('pressed');
  });
});
