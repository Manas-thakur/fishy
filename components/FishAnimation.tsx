'use client';

import { useEffect, useRef } from 'react';

class Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  isRed: boolean;
  angle: number;

  constructor(width: number, height: number, isRed: boolean = false) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.size = 8;
    this.isRed = isRed;
    this.angle = 0;
  }

  update(boids: Boid[], mouse: MouseState, width: number, height: number) {
    const separationDist = 30;
    const alignmentDist = 50;
    const cohesionDist = 50;
    
    let separation = { x: 0, y: 0 };
    let alignment = { x: 0, y: 0 };
    let cohesion = { x: 0, y: 0 };
    let separationCount = 0;
    let alignmentCount = 0;
    let cohesionCount = 0;

    boids.forEach(other => {
      if (other === this) return;
      
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < separationDist && dist > 0) {
        separation.x += dx / dist;
        separation.y += dy / dist;
        separationCount++;
      }
      
      if (dist < alignmentDist) {
        alignment.x += other.vx;
        alignment.y += other.vy;
        alignmentCount++;
      }
      
      if (dist < cohesionDist) {
        cohesion.x += other.x;
        cohesion.y += other.y;
        cohesionCount++;
      }
    });

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

    this.vx += (Math.random() - 0.5) * 0.1;
    this.vy += (Math.random() - 0.5) * 0.1;

    if (mouse.active && mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const orbitRadius = 150;
      const attractionStrength = 250;
      const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      
      if (dist < attractionStrength) {
        if (mouseSpeed > 5 && dist < 100) {
          const fleeForce = 0.15;
          this.vx += (dx / dist) * fleeForce;
          this.vy += (dy / dist) * fleeForce;
        } else {
          const tangentX = -dy;
          const tangentY = dx;
          const tangentMag = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
          
          if (tangentMag > 0) {
            const orbitForce = 0.03 * (1 - dist / attractionStrength);
            this.vx += (tangentX / tangentMag) * orbitForce;
            this.vy += (tangentY / tangentMag) * orbitForce;
          }
          
          if (dist > 0) {
            const targetDist = orbitRadius;
            const force = (dist - targetDist) * 0.003;
            this.vx -= (dx / dist) * force;
            this.vy -= (dy / dist) * force;
          }
          
          if (mouseSpeed > 1) {
            const followForce = 0.005;
            this.vx += mouse.vx * followForce;
            this.vy += mouse.vy * followForce;
          }
        }
        
        const speedBoost = 1 + (1 - dist / attractionStrength) * 0.5;
        this.vx *= speedBoost;
        this.vy *= speedBoost;
      }
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const maxSpeed = 2;
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -this.size) this.x = width + this.size;
    if (this.x > width + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = height + this.size;
    if (this.y > height + this.size) this.y = -this.size;

    this.angle = Math.atan2(this.vy, this.vx);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const fishColor = getComputedStyle(document.documentElement)
      .getPropertyValue(this.isRed ? '--fish-red' : '--fish-color').trim();
    
    ctx.strokeStyle = fishColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const s = this.size;

    ctx.beginPath();
    ctx.moveTo(s * 1.1, 0);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.95, -s * 0.95, -s * 0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s * 1.1, 0);
    ctx.quadraticCurveTo(s * 0.1, s * 0.95, -s * 0.95, s * 0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.7);
    ctx.quadraticCurveTo(s * 0.15, -s * 0.05, -s * 1.1, s * 0.35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.35, s * 0.7);
    ctx.quadraticCurveTo(s * 0.15, s * 0.05, -s * 1.1, -s * 0.35);
    ctx.stroke();

    ctx.restore();
  }
}

interface MouseState {
  x: number | null;
  y: number | null;
  active: boolean;
  vx: number;
  vy: number;
  lastX: number | null;
  lastY: number | null;
}

export default function FishAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boidsRef = useRef<Boid[]>([]);
  const mouseRef = useRef<MouseState>({
    x: null,
    y: null,
    active: false,
    vx: 0,
    vy: 0,
    lastX: null,
    lastY: null
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      boidsRef.current = [];
      boidsRef.current.push(new Boid(canvas.width, canvas.height, true));
      for (let i = 0; i < 80; i++) {
        boidsRef.current.push(new Boid(canvas.width, canvas.height, false));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      boidsRef.current.forEach(boid => {
        boid.update(boidsRef.current, mouseRef.current, canvas.width, canvas.height);
        boid.draw(ctx);
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      if (mouse.lastX !== null && mouse.lastY !== null) {
        mouse.vx = e.clientX - mouse.lastX;
        mouse.vy = e.clientY - mouse.lastY;
      }
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      const mouse = mouseRef.current;
      mouse.active = false;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    resize();
    init();
    animate();

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} id="bg-canvas" />;
}
