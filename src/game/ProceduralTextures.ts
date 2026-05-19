import * as THREE from 'three';

function hash(n: number): number {
  return Math.abs(Math.sin(n) * 43758.5453) % 1;
}

function noise2D(x: number, y: number): number {
  const n = Math.floor(x) + Math.floor(y) * 57;
  const a = hash(n);
  const b = hash(n + 1);
  const c = hash(n + 57);
  const d = hash(n + 58);
  const fx = x - Math.floor(x);
  const fy = y - Math.floor(y);
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function fbm(x: number, y: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

export function createConcreteNormalMap(): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);

  // Generate height map using fbm noise
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      heights[y * size + x] = fbm(x * 0.05, y * 0.05, 4);
    }
  }

  // Compute normals from height differences
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      const xPrev = heights[y * size + ((x - 1 + size) % size)];
      const xNext = heights[y * size + ((x + 1) % size)];
      const yPrev = heights[((y - 1 + size) % size) * size + x];
      const yNext = heights[((y + 1) % size) * size + x];

      // Compute normal from height differences (strength controls bumpiness)
      const strength = 2.0;
      const dx = (xPrev - xNext) * strength;
      const dy = (yPrev - yNext) * strength;

      // Normalize
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const nx = dx / len;
      const ny = dy / len;
      const nz = 1 / len;

      // Map from [-1,1] to [0,255]
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function createMetalNormalMap(): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Default flat normal
      let nx = 0;
      let ny = 0;

      // Brushed horizontal scratches
      const scratchNoise = hash(y * 7.13 + 0.5);
      if (scratchNoise > 0.92) {
        // This row has a scratch - perturb the Y normal
        const scratchIntensity = hash(y * 3.7 + x * 0.01) * 0.6;
        ny = (scratchIntensity - 0.3);
      }

      // Fine brushed texture along X
      const brushed = hash(x * 0.3 + y * 137.0) * 0.1 - 0.05;
      nx += brushed;

      // Normalize
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      data[idx] = Math.floor((nx / len * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny / len * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz / len * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function createEnvironmentMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  // Create a small procedural scene for the environment
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x1a1a1a);

  // Add dim lights to simulate prison interior reflections
  const warmLight = new THREE.PointLight(0xffaa55, 2, 20);
  warmLight.position.set(5, 3, 0);
  envScene.add(warmLight);

  const blueLight = new THREE.PointLight(0x4488ff, 1, 15);
  blueLight.position.set(-5, 2, -3);
  envScene.add(blueLight);

  const dimLight = new THREE.PointLight(0xffffee, 0.5, 10);
  dimLight.position.set(0, 4, 5);
  envScene.add(dimLight);

  // Add some geometry for the lights to bounce off of
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
  const floorGeo = new THREE.BoxGeometry(20, 0.1, 20);
  const floor = new THREE.Mesh(floorGeo, wallMat);
  floor.position.y = -2;
  envScene.add(floor);

  const ceiling = new THREE.Mesh(floorGeo, wallMat);
  ceiling.position.y = 5;
  envScene.add(ceiling);

  const renderTarget = pmremGenerator.fromScene(envScene, 0.04);
  const texture = renderTarget.texture;

  // Dispose intermediate objects
  renderTarget.dispose();
  wallMat.dispose();
  floorGeo.dispose();
  pmremGenerator.dispose();

  return texture;
}
