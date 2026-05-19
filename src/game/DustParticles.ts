import * as THREE from 'three';

export class DustParticles {
  public group: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private velocities: Float32Array;
  private particleCount = 500;

  // Bounds for the indoor area
  private bounds = {
    minX: -20, maxX: 15,
    minY: 0, maxY: 4,
    minZ: -30, maxZ: 15
  };

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = THREE.MathUtils.randFloat(this.bounds.minX, this.bounds.maxX);
      positions[i3 + 1] = THREE.MathUtils.randFloat(this.bounds.minY, this.bounds.maxY);
      positions[i3 + 2] = THREE.MathUtils.randFloat(this.bounds.minZ, this.bounds.maxZ);

      // Random velocities: gentle upward drift with slight horizontal wander
      this.velocities[i3] = THREE.MathUtils.randFloat(-0.01, 0.01);
      this.velocities[i3 + 1] = THREE.MathUtils.randFloat(0.02, 0.05);
      this.velocities[i3 + 2] = THREE.MathUtils.randFloat(-0.01, 0.01);
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xccccaa,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
      depthWrite: false
    });

    this.group = new THREE.Points(this.geometry, this.material);
  }

  update(delta: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      positions[i3] += this.velocities[i3] * delta;
      positions[i3 + 1] += this.velocities[i3 + 1] * delta;
      positions[i3 + 2] += this.velocities[i3 + 2] * delta;

      // Add slight random drift
      this.velocities[i3] += THREE.MathUtils.randFloat(-0.005, 0.005) * delta;
      this.velocities[i3 + 2] += THREE.MathUtils.randFloat(-0.005, 0.005) * delta;

      // Clamp horizontal velocities
      this.velocities[i3] = THREE.MathUtils.clamp(this.velocities[i3], -0.02, 0.02);
      this.velocities[i3 + 2] = THREE.MathUtils.clamp(this.velocities[i3 + 2], -0.02, 0.02);

      // Reset particle when it goes above ceiling
      if (positions[i3 + 1] > this.bounds.maxY) {
        positions[i3] = THREE.MathUtils.randFloat(this.bounds.minX, this.bounds.maxX);
        positions[i3 + 1] = this.bounds.minY;
        positions[i3 + 2] = THREE.MathUtils.randFloat(this.bounds.minZ, this.bounds.maxZ);
        this.velocities[i3] = THREE.MathUtils.randFloat(-0.01, 0.01);
        this.velocities[i3 + 1] = THREE.MathUtils.randFloat(0.02, 0.05);
        this.velocities[i3 + 2] = THREE.MathUtils.randFloat(-0.01, 0.01);
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
