// Generate stars
const starsContainer = document.getElementById('stars');
for (let i = 0; i < 120; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  star.style.left = Math.random() * 100 + '%';
  star.style.top = Math.random() * 100 + '%';
  star.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
  star.style.setProperty('--op', (0.3 + Math.random() * 0.7).toFixed(2));
  star.style.animationDelay = (Math.random() * 4) + 's';
  const size = 1 + Math.random() * 3;
  star.style.width = size + 'px';
  star.style.height = size + 'px';
  starsContainer.appendChild(star);
}

// Generate floating color blobs
const shapesContainer = document.getElementById('shapes');
const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6fc8','#845ef7'];
for (let i = 0; i < 6; i++) {
  const shape = document.createElement('div');
  shape.className = 'shape';
  shape.style.left = (10 + i * 16) + '%';
  shape.style.top = (10 + Math.random() * 80) + '%';
  const size = 200 + Math.random() * 300;
  shape.style.width = size + 'px';
  shape.style.height = size + 'px';
  shape.style.background = colors[i];
  shape.style.setProperty('--sd', (5 + Math.random() * 6) + 's');
  shape.style.animationDelay = (Math.random() * 4) + 's';
  shapesContainer.appendChild(shape);
}

// Card entrance animation
const cards = document.querySelectorAll('.game-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }, i * 100);
    }
  });
}, { threshold: 0.1 });

cards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(40px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(.175,.885,.32,1.275), box-shadow 0.35s ease, border-color 0.35s ease';
  observer.observe(card);
});


