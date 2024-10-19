const explosionSound = new Audio("./assets/blast.mp3");
explosionSound.volume = 0.7;

let isExplosionSoundPreloaded = true;

// Preload the sounds and pause for later use
document.addEventListener("click", () => {
  if (!isExplosionSoundPreloaded) {
    explosionSound
      .play()
      .then(() => {
        explosionSound.pause();
        explosionSound.currentTime = 0;
        isExplosionSoundPreloaded = true;
      })
      .catch((error) => console.error("Audio preload error:", error));
  }
});

// Setup for fireworks animation
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
const effectCanvas = document.createElement("canvas");
const effectCtx = effectCanvas.getContext("2d");
document.body.appendChild(effectCanvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
effectCanvas.width = window.innerWidth;
effectCanvas.height = 0;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  effectCanvas.width = window.innerWidth;
  effectCanvas.height = 0;
});

let fireworks = [];
let effects = [];

function createFirework() {
  const sideStart = Math.random() < 0.5;
  const x = sideStart
    ? Math.random() < 0.5
      ? 0
      : canvas.width
    : Math.random() * canvas.width;
  const y = sideStart ? Math.random() * canvas.height : canvas.height;

  const types = [
    "rocket",
    "burst",
    "kamuro",
    "peony",
    "crossette",
    "willow",
    "fountain",
    "chrysanthemum",
    "ring",
    "palm",
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  const size =
    type === "kamuro" ? Math.random() * 50 + 150 : Math.random() * 70 + 70;
  const speed =
    type === "kamuro" ? 2 : type === "rocket" ? Math.random() * 10 + 5 : 5;
  const explosionHeight =
    Math.random() * (canvas.height / 2) + canvas.height / 4;

  const firework = {
    x: x,
    y: y,
    explosionHeight: explosionHeight,
    size: size,
    particles: [],
    trailParticles: [],
    explode: false,
    color:
      type === "kamuro" ? "gold" : `hsl(${Math.random() * 360}, 100%, 50%)`,
    speed: speed,
    type: type,
  };

  fireworks.push(firework);
}

function createExplosionEffect(x, y) {
  const effect = {
    x: x,
    y: y,
    radius: 0,
    maxRadius: Math.random() * 50 + 50,
    alpha: 1,
  };
  effects.push(effect);
}

function createSparkingTrail(firework) {
  for (let i = 0; i < 5; i++) {
    firework.trailParticles.push({
      x: firework.x,
      y: firework.y,
      angle: Math.random() * 2 * Math.PI,
      speed: Math.random() * 1 + 0.5,
      radius: Math.random() * 2 + 1,
      life: 20,
      color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
    });
  }
}

function updateFireworks() {
  fireworks.forEach((firework) => {
    if (!firework.explode) {
      firework.y -= firework.speed;
      createSparkingTrail(firework);

      if (firework.y <= firework.explosionHeight) {
        firework.explode = true;
        createExplosionEffect(firework.x, firework.y);

        if (isExplosionSoundPreloaded) {
          explosionSound.currentTime = 0;
          explosionSound.play();
        }

        const particleCount =
          firework.size * (firework.type === "rocket" ? 2 : 1);
        for (let i = 0; i < particleCount; i++) {
          let color;
          let speed;
          switch (firework.type) {
            case "peony":
              color = `hsl(${Math.random() * 360}, 100%, 50%)`;
              speed = Math.random() * 4 + 2;
              break;
            case "willow":
              color = "rgba(255, 140, 0, 1)";
              speed = Math.random() * 1 + 1;
              break;
            case "fountain":
              color = `hsl(${Math.random() * 360}, 100%, 75%)`;
              speed = Math.random() * 0.5 + 0.5;
              break;
            default:
              color = firework.color;
              speed = Math.random() * 5 + 2;
          }

          firework.particles.push({
            x: firework.x,
            y: firework.y,
            angle: Math.random() * 2 * Math.PI,
            speed: speed,
            radius: Math.random() * 2 + 1,
            life: Math.random() * 50 + 50,
            gravity:
              firework.type === "kamuro" ? 0.1 : 0.03 + Math.random() * 0.07,
            opacity: 1,
            flicker: Math.random() * 0.2 + 0.8,
            color: color,
          });
        }
      }
    } else {
      firework.particles.forEach((particle) => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y +=
          Math.sin(particle.angle) * particle.speed - particle.gravity;
        particle.speed *= 0.98;
        particle.opacity -= 0.01;
        particle.opacity = particle.opacity * particle.flicker;
        particle.life--;
      });
    }
  });

  fireworks = fireworks.filter((fw) =>
    fw.explode ? fw.particles.some((p) => p.life > 0) : true
  );

  effects.forEach((effect) => {
    effect.radius += 0.5;
    effect.alpha -= 0.01;
  });

  effects = effects.filter((e) => e.alpha > 0);
}

function drawFireworks() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  fireworks.forEach((firework) => {
    firework.trailParticles.forEach((trail) => {
      ctx.fillStyle = trail.color;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
      ctx.fill();
      trail.life--;
    });
    firework.trailParticles = firework.trailParticles.filter((t) => t.life > 0);

    if (!firework.explode) {
      ctx.fillStyle = firework.color;
      ctx.beginPath();
      ctx.arc(firework.x, firework.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      firework.particles.forEach((particle) => {
        if (particle.life > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = firework.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    }
  });

  effects.forEach((effect) => {
    effectCtx.beginPath();
    const gradient = effectCtx.createRadialGradient(
      effect.x,
      effect.y,
      0,
      effect.x,
      effect.y,
      effect.radius
    );
    gradient.addColorStop(0, `rgba(255, 255, 0, ${effect.alpha})`);
    gradient.addColorStop(1, `rgba(255, 255, 0, 0)`);

    effectCtx.fillStyle = gradient;
    effectCtx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    effectCtx.fill();
  });
}

function animate() {
  updateFireworks();
  drawFireworks();
  requestAnimationFrame(animate);
}

setInterval(createFirework, Math.random() * 500 + 500);
animate();

(() => {
  const max_stars = 200;
  const stars = [];
  const starContainer = document.getElementById("starCont");

  for (let i = 0; i < max_stars; i++) {
    const star = document.createElement("span");
    const size = Math.floor(Math.random() * 3) + 1;
    star.className = "star";
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.background = `rgba(255, 255, 177, ${Math.random()})`;
    star.style.top = Math.ceil(Math.random() * 100) + "%";
    star.style.left = Math.ceil(Math.random() * 100) + "%";
    stars.push(star);
    starContainer.appendChild(star);
  }

  stars.slice(0, max_stars * 0.6).forEach((star) => {
    star.style.animationName = "glow";
    star.style.animationDelay = Math.floor(Math.random() * 6) + 1 + "s";
    star.style.animationDuration = Math.floor(Math.random() * 6) + 1 + "s";
  });
})();

// Access the first and second flower containers by their unique IDs
// Access the first and second flower containers by their unique IDs
const flowerContainer1 = document.getElementById("flower-container-1");
const flowerContainer2 = document.getElementById("flower-container-2");

// Function to create a flower
function createFlower() {
  const flowerDiv = document.createElement("div");
  flowerDiv.classList.add("flower");

  // Create petals
  for (let i = 0; i < 8; i++) {
    const petal = document.createElement("div");
    petal.classList.add("petal");
    petal.style.transform = `rotate(${i * 45}deg) translateY(-50%)`;
    flowerDiv.appendChild(petal);
  }

  // Create center
  const center = document.createElement("div");
  center.classList.add("center");
  flowerDiv.appendChild(center);

  // Create leaves
  const leftLeaf = document.createElement("div");
  leftLeaf.classList.add("leaf", "left-leaf");
  flowerDiv.appendChild(leftLeaf);

  const rightLeaf = document.createElement("div");
  rightLeaf.classList.add("leaf", "right-leaf");
  flowerDiv.appendChild(rightLeaf);

  return flowerDiv;
}

// Function to create a row of flowers in a specified container
function createMultipleFlowers(container, count) {
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("flower-row");

  for (let i = 0; i < count; i++) {
    const flower = createFlower(); // Reusing the createFlower() function
    rowDiv.appendChild(flower);
  }

  container.appendChild(rowDiv); // Append the row to the specified container
}

// Function to clear existing flowers in a specified container
function clearFlowers(container) {
  container.innerHTML = ""; // Clear the specified container before adding new rows
}

// Function to create multiple rows with decreasing number of flowers based on screen size for a specified container
function createMultipleRows(container, reverse = false) {
  clearFlowers(container); // Clear previous flowers
  let maxFlowers = 9;

  // Adjust the number of flowers based on screen width
  if (window.innerWidth <= 600) {
    maxFlowers = 6; // Smaller screens, fewer flowers
  } else if (window.innerWidth <= 400) {
    maxFlowers = 5; // Even fewer flowers for very small screens
  }

  if (reverse) {
    // For reverse order (small to large)
    for (let i = 3; i <= maxFlowers; i += 2) {
      createMultipleFlowers(container, i); // Generate the row with 'i' flowers
    }
  } else {
    // For normal order (large to small)
    for (let i = maxFlowers; i >= 3; i -= 2) {
      createMultipleFlowers(container, i); // Generate the row with 'i' flowers
    }
  }
}

// Event listener to adjust the flowers on window resize
window.addEventListener("resize", () => {
  createMultipleRows(flowerContainer1); // Create rows for the first container
  createMultipleRows(flowerContainer2, true); // Create rows for the second container in reverse order
});

// Initial call to create the rows based on the current screen size
createMultipleRows(flowerContainer1); // Create rows for the first container
createMultipleRows(flowerContainer2, true); // Create rows for the second container in reverse order
