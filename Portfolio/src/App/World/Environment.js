import * as THREE from 'three';
import App from '../App.js';

export default class Environment {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.physics = this.app.world.physics;

    this.loadEnvironment();
    this.addMeshes();
  }

  loadEnvironment() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(1, 1, 1);
    this.directionalLight.castShadow = true;

    this.scene.add(this.directionalLight);
  }
  addMeshes() {
    const group = new THREE.Group();
    group.position.y = 10;
    group.rotation.x = 0.5;
    this.scene.add(group);

    const geometry = new THREE.BoxGeometry(4, 2, 1);
    const material = new THREE.MeshStandardMaterial({ color: 'yellow' });
    this.cubeMesh = new THREE.Mesh(geometry, material);
    this.cubeMesh.position.y = 12;
    this.cubeMesh.rotation.x = 15;
    this.cubeMesh.rotation.z = 20;
    this.cubeMesh.scale.set(1, 1, 1);

    group.add(this.cubeMesh);
    this.physics.add(this.cubeMesh);
  }
}