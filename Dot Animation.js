// Interactive Particle System Animation for Scriptable
// Creates an impressive, colorful particle system animation
// Run in the Scriptable app for best experience

// Check if we're running in the app
const isInApp = config.runsInApp;

// This animation is designed primarily for in-app viewing with WebView
if (isInApp) {
  // Create a WebView to run our animation
  let webView = new WebView();
  
  // HTML with Canvas and JavaScript for particle animation
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #000;
        touch-action: none;
      }
      canvas {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
      }
      .instructions {
        position: fixed;
        bottom: 20px;
        left: 0;
        right: 0;
        color: rgba(255, 255, 255, 0.5);
        font-family: Arial, sans-serif;
        text-align: center;
        font-size: 12px;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <canvas id="canvas"></canvas>
    <div class="instructions">Tap or drag to interact with particles</div>
    
    <script>
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas to full window size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Configuration
      const config = {
        particleCount: 800,
        particleBaseSize: 1,
        particleAddedSize: 1,
        particleMaxSpeed: 1,
        particleColor: '#FFFFFF',
        fadeAmount: 0.03,
        connectionRadius: 50,
        interactionRadius: 50,
        repelStrength: 150,
        attractStrength: 20,
      };
      
      // Color palettes
      const colorPalettes = [
        // Cosmic
        ['#2E0854', '#5E11A5', '#7B25CC', '#9D4EDD', '#C77DFF'],
        // Aurora
        ['#00B4D8', '#00D4E0', '#00DFAB', '#00DE66', '#19FF29'],
        // Fire
        ['#FF4800', '#FF5C00', '#FF7900', '#FFB600', '#FFD200'],
        // Neon City
        ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0'],
        // Ocean
        ['#013A63', '#01497C', '#014F86', '#2A6F97', '#2C7DA0']
      ];
      
      // Choose a random palette
      let currentPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
      
      // Particle class
      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = config.particleBaseSize + Math.random() * config.particleAddedSize;
          this.speedX = (Math.random() - 0.5) * config.particleMaxSpeed;
          this.speedY = (Math.random() - 0.5) * config.particleMaxSpeed;
          this.color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
          this.originalColor = this.color;
          this.energy = 0.5 + Math.random() * 0.5; // For particle pulsating
          this.energySpeed = 0.01 + Math.random() * 0.02;
        }
        
        // Update particle position
        update() {
          // Energy oscillation for pulsating effect
          this.energy += this.energySpeed;
          if (this.energy > 1 || this.energy < 0.5) {
            this.energySpeed = -this.energySpeed;
          }
          
          // Move particles
          this.x += this.speedX;
          this.y += this.speedY;
          
          // Wrap around screen edges
          if (this.x < 0) this.x = canvas.width;
          if (this.x > canvas.width) this.x = 0;
          if (this.y < 0) this.y = canvas.height;
          if (this.y > canvas.height) this.y = 0;
        }
        
        // Draw the particle
        draw() {
          ctx.beginPath();
          const size = this.size * (0.8 + this.energy * 0.4); // Pulsating size
          ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
        
        // Interaction with mouse/touch
        interact(x, y, isAttracting) {
          const dx = this.x - x;
          const dy = this.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.interactionRadius) {
            // Calculate force strength based on distance
            const strength = isAttracting ? 
              config.attractStrength * (1 - distance / config.interactionRadius) :
              config.repelStrength * (1 - distance / config.interactionRadius);
            
            // Apply force
            const forceX = dx * strength / distance || 0;
            const forceY = dy * strength / distance || 0;
            
            this.speedX += isAttracting ? -forceX : forceX;
            this.speedY += isAttracting ? -forceY : forceY;
            
            // Limit speed
            const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (currentSpeed > config.particleMaxSpeed * 2) {
              this.speedX = (this.speedX / currentSpeed) * config.particleMaxSpeed * 2;
              this.speedY = (this.speedY / currentSpeed) * config.particleMaxSpeed * 2;
            }
            
            // Highlight interacting particles
            this.color = isAttracting ? '#FFFFFF' : '#FF3366';
          } else {
            // Gradually return to original color
            this.color = this.originalColor;
          }
        }
      }
      
      // Create particles
      let particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
      }
      
      // Interaction handling
      let isInteracting = false;
      let interactionX = 0;
      let interactionY = 0;
      let isAttracting = false; // Toggle between attract/repel
      
      // Mouse/touch event listeners
      window.addEventListener('mousedown', handleInteractionStart);
      window.addEventListener('touchstart', handleInteractionStart);
      window.addEventListener('mousemove', handleInteractionMove);
      window.addEventListener('touchmove', handleInteractionMove);
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchend', handleInteractionEnd);
      
      function handleInteractionStart(e) {
        isInteracting = true;
        isAttracting = e.shiftKey || (e.touches && e.touches.length > 1);
        updateInteractionPosition(e);
        
        // Change color palette on double tap
        if (e.detail === 2 || (e.touches && e.touches.length > 2)) {
          let newPalette;
          do {
            newPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
          } while (newPalette === currentPalette);
          
          currentPalette = newPalette;
          
          // Update particle colors
          particles.forEach(particle => {
            particle.originalColor = currentPalette[Math.floor(Math.random() * currentPalette.length)];
          });
        }
      }
      
      function handleInteractionMove(e) {
        if (isInteracting) {
          updateInteractionPosition(e);
        }
      }
      
      function handleInteractionEnd() {
        isInteracting = false;
      }
      
      function updateInteractionPosition(e) {
        // Get position whether it's mouse or touch
        if (e.touches && e.touches.length > 0) {
          interactionX = e.touches[0].clientX;
          interactionY = e.touches[0].clientY;
        } else {
          interactionX = e.clientX;
          interactionY = e.clientY;
        }
      }
      
      // Animation loop
      function animate() {
        // Create fading effect by drawing semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, ' + config.fadeAmount + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw connections first (behind particles)
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.connectionRadius) {
              // Draw connection with opacity based on distance
              const opacity = 1 - (distance / config.connectionRadius);
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity * 0.2 + ')';
              ctx.lineWidth = 1;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        
        // Update and draw particles
        particles.forEach((particle) => {
          particle.update();
          
          // Handle interaction
          if (isInteracting) {
            particle.interact(interactionX, interactionY, isAttracting);
          }
          
          particle.draw();
        });
        
        // Draw interaction area if active
        if (isInteracting) {
          ctx.beginPath();
          ctx.arc(interactionX, interactionY, config.interactionRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isAttracting ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 51, 102, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        requestAnimationFrame(animate);
      }
      
      // Handle window resize
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
      
      // Start animation
      animate();
    </script>
  </body>
  </html>
  `;
  
  // Load the HTML into the WebView
  await webView.loadHTML(html);
  await webView.present();
  
} else {
  // For widget mode, create a simplified snapshot of the animation
  let widget = new ListWidget();
  widget.backgroundColor = new Color("#000000");
  
  // Add a title for the widget
  let titleText = widget.addText("Interactive Particle System");
  titleText.font = Font.boldSystemFont(14);
  titleText.textColor = new Color("#FFFFFF");
  titleText.centerAlignText();
  
  widget.addSpacer(10);
  
  // Create a static preview using emoji
  let grid = [
    "✨   ✨      ✨  ",
    "  ✨      ✨     ",
    "     ✨    ✨  ✨",
    " ✨    ✨       ✨",
    "   ✨      ✨    ",
    "✨    ✨    ✨   "
  ];
  
  let preview = widget.addText(grid.join("\n"));
  preview.font = Font.mediumSystemFont(12);
  preview.textColor = new Color("#FFFFFF");
  preview.centerAlignText();
  
  widget.addSpacer(10);
  
  // Add instruction
  let instructionText = widget.addText("Run in Scriptable app for interactive animation");
  instructionText.font = Font.systemFont(10);
  instructionText.textColor = new Color("#FFFFFF", 0.7);
  instructionText.centerAlignText();
  
  // Set widget refresh interval
  widget.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  // Complete the widget
  Script.setWidget(widget);
}

Script.complete();
