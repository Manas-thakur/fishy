const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let boids = [];
const numBoids = 80; // Adjust number of particles
let mouse = { x: null, y: null, active: false, vx: 0, vy: 0, lastX: null, lastY: null };

// Track mouse position and velocity
document.addEventListener('mousemove', (e) => {
    if (mouse.lastX !== null && mouse.lastY !== null) {
        mouse.vx = e.clientX - mouse.lastX;
        mouse.vy = e.clientY - mouse.lastY;
    }
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
});

document.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.vx = 0;
    mouse.vy = 0;
});

// Resize canvas
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

class Boid {
    constructor(isRed = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2; // Random velocity
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 8; // Size of the fish (smaller)
        this.isRed = isRed;
        this.angle = 0;
    }

    update(boids) {
        // Flocking behavior parameters
        const separationDist = 30;
        const alignmentDist = 50;
        const cohesionDist = 50;
        
        let separation = { x: 0, y: 0 };
        let alignment = { x: 0, y: 0 };
        let cohesion = { x: 0, y: 0 };
        let separationCount = 0;
        let alignmentCount = 0;
        let cohesionCount = 0;

        // Calculate flocking forces
        boids.forEach(other => {
            if (other === this) return;
            
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Separation: avoid crowding neighbors
            if (dist < separationDist && dist > 0) {
                separation.x += dx / dist;
                separation.y += dy / dist;
                separationCount++;
            }
            
            // Alignment: steer towards average heading of neighbors
            if (dist < alignmentDist) {
                alignment.x += other.vx;
                alignment.y += other.vy;
                alignmentCount++;
            }
            
            // Cohesion: steer towards average position of neighbors
            if (dist < cohesionDist) {
                cohesion.x += other.x;
                cohesion.y += other.y;
                cohesionCount++;
            }
        });

        // Apply flocking forces with reduced strength for more randomness
        if (separationCount > 0) {
            separation.x /= separationCount;
            separation.y /= separationCount;
            this.vx += separation.x * 0.03;
            this.vy += separation.y * 0.03;
        }
        
        if (alignmentCount > 0) {
            alignment.x /= alignmentCount;
            alignment.y /= alignmentCount;
            this.vx += (alignment.x - this.vx) * 0.01;
            this.vy += (alignment.y - this.vy) * 0.01;
        }
        
        if (cohesionCount > 0) {
            cohesion.x /= cohesionCount;
            cohesion.y /= cohesionCount;
            this.vx += (cohesion.x - this.x) * 0.0005;
            this.vy += (cohesion.y - this.y) * 0.0005;
        }

        // Add random movement for more natural variation
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;

        // Mouse interaction: orbit around cursor with multiple effects
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const orbitRadius = 150; // Distance to maintain from cursor
            const attractionStrength = 250; // How strongly attracted to orbit
            const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
            
            if (dist < attractionStrength) {
                // Effect 1: Flee from fast-moving cursor
                if (mouseSpeed > 5 && dist < 100) {
                    const fleeForce = 0.15;
                    this.vx += (dx / dist) * fleeForce;
                    this.vy += (dy / dist) * fleeForce;
                } else {
                    // Effect 2: Calculate perpendicular vector for orbital motion
                    const tangentX = -dy;
                    const tangentY = dx;
                    const tangentMag = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
                    
                    if (tangentMag > 0) {
                        // Add orbital force (tangent direction) - stronger when closer
                        const orbitForce = 0.03 * (1 - dist / attractionStrength);
                        this.vx += (tangentX / tangentMag) * orbitForce;
                        this.vy += (tangentY / tangentMag) * orbitForce;
                    }
                    
                    // Effect 3: Maintain distance from cursor (spring force)
                    if (dist > 0) {
                        const targetDist = orbitRadius;
                        const force = (dist - targetDist) * 0.003;
                        this.vx -= (dx / dist) * force;
                        this.vy -= (dy / dist) * force;
                    }
                    
                    // Effect 4: Follow cursor movement direction slightly
                    if (mouseSpeed > 1) {
                        const followForce = 0.005;
                        this.vx += mouse.vx * followForce;
                        this.vy += mouse.vy * followForce;
                    }
                }
                
                // Effect 5: Speed boost when near cursor
                const speedBoost = 1 + (1 - dist / attractionStrength) * 0.5;
                this.vx *= speedBoost;
                this.vy *= speedBoost;
            }
        }

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = 2;
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < -this.size) this.x = width + this.size;
        if (this.x > width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = height + this.size;
        if (this.y > height + this.size) this.y = -this.size;

        // Calculate angle based on velocity
        this.angle = Math.atan2(this.vy, this.vx);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.strokeStyle = this.isRed ? '#ff4444' : '#888888';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const s = this.size;

        // Looking at the reference image carefully:
        // - The body is a teardrop/rounded triangle pointing right
        // - Top and bottom spines curve outward then meet at back
        // - The cross ribs are inside, creating 3 "tail fins" visually
        // - All 4 lines end roughly parallel at the back

        // 1. Top Spine: Nose -> curves up and out -> sweeps back to tail
        ctx.beginPath();
        ctx.moveTo(s * 1.1, 0); // Sharp nose
        ctx.quadraticCurveTo(s * 0.1, -s * 0.95, -s * 0.95, -s * 0.8); 
        ctx.stroke();

        // 2. Bottom Spine: Nose -> curves down and out -> sweeps back to tail
        ctx.beginPath();
        ctx.moveTo(s * 1.1, 0); // Sharp nose
        ctx.quadraticCurveTo(s * 0.1, s * 0.95, -s * 0.95, s * 0.8);
        ctx.stroke();

        // 3. Inner Cross Rib 1: Top-middle -> curves out -> back to lower tail area
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, -s * 0.7); // Starts further back
        ctx.quadraticCurveTo(s * 0.15, -s * 0.05, -s * 1.1, s * 0.35); // Extends beyond body
        ctx.stroke();

        // 4. Inner Cross Rib 2: Bottom-middle -> curves out -> back to upper tail area
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, s * 0.7); // Starts further back
        ctx.quadraticCurveTo(s * 0.15, s * 0.05, -s * 1.1, -s * 0.35); // Extends beyond body
        ctx.stroke();

        ctx.restore();
    }
}

// Initialize boids
function init() {
    boids = [];
    // Add one red boid
    boids.push(new Boid(true));
    // Add normal boids
    for (let i = 0; i < numBoids; i++) {
        boids.push(new Boid(false));
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    boids.forEach(boid => {
        boid.update(boids);
        boid.draw();
    });

    requestAnimationFrame(animate);
}

init();
animate();