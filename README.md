# Booth Booking Grid
Live demos:  
- Version 1 (original submission): https://Muhammedmiqdad.github.io/booth-booking/  
- Version 2 (improved version): https://Muhammedmiqdad.github.io/booth-booking/v2/  

Mini test project — interactive booth booking grid in plain HTML, CSS, and JavaScript.

## What I built
A small, accessible interactive floor plan with a booking cart implemented using **plain HTML, CSS, and JavaScript** (no frameworks). Users can hover a booth to see its price and an **"Add Booth"** button, add multiple booths to the cart, see the total update with a small animation, and remove booths from the cart. Some booths are pre-booked (disabled).

## Files
- `index.html` — semantic HTML structure using `<header>`, `<main>`, `<section>`, `<article>`, and `<button>` as required.
- `styles.css` — responsive, accessible styling and hover animations.
- `app.js` — main application logic (rendering booths, cart management, accessibility features).
- `README.md` — this file.

### Updates
- Improved mobile responsiveness for floor grid and cart layout 

## Improvements in Version 2
- Cart state is saved in localStorage (persists after reload).  
- Added ARIA attributes and keyboard navigation (Enter, Space, Arrow keys).  
- Polished responsive UI design system.  
- Enhanced accessibility and user experience.

## Data structure overview
I used a simple array of booth objects in `app.js`:
```js
{
  id: 'A1',        // booth label
  price: 68,       // numeric price in KWD
  booked: false,   // pre-booked/disabled flag
  selected: false  // in-memory selection flag
}



