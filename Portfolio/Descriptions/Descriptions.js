/* %%%%%%%%%%%%%%%%%%%%%%%% Physics.js %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5
* this.meshMap = new Map(); 
  -  Initializes a map to store the relationship between "Three.js meshes" and their corresponding "physics-rigid-bodies".

!------------ Import and Setup Rapier
* import('@dimforge/rapier3d').then((RAPIER) => {})
- Dynamically imports the Rapier-3D physics-engine. Once the module is loaded, the callback function is executed.

* @dimforge/rapier3d
-  is a JavaScript library for 3D physics simulations.

* const gravity = { x: 0, y: -9.81, z: 0 };
- Defines the gravity vector for the physics world.

* this.world = new RAPIER.World(gravity);
- Creates a new physics-world with the specified gravity.

* this.rapier = RAPIER;
- Stores a "reference" to the Rapier module.


!------------ Create Ground Mesh and Rigid Body
* const groundGeometry = new THREE.BoxGeometry(20, 1, 20);
- Defines the geometry for a box with specified dimensions.

* const groundMaterial = new THREE.MeshStandardMaterial({ color: 'turquoise', }); 
- Creates a material for the mesh with a turquoise color.

* this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial); 
- Creates a mesh using the geometry and material.

* this.scene.add(this.groundMesh); 
- Adds the ground mesh to the scene.

* const groundRigidBodyType = RAPIER.RigidBodyDesc.fixed(); 
- Describes the rigid-body as fixed (not affected by forces).

* this.groundRigidBody = this.world.createRigidBody(groundRigidBodyType); 
- Creates the rigid body in the physics world.

* const groundColliderType = RAPIER.ColliderDesc.cuboid(10, 0.5, 10); 
- Describes the collider-shape as a cuboid.

* this.world.createCollider(groundColliderType, this.groundRigidBody);
- Creates the collider and associates it with the rigid-body.

* this.rapierLoaded = true;
- Sets a flag indicating the physics engine is loaded.

* appStateStore.setState({ physicsReady: true });
- Updates the application-state to indicate that the physics setup is complete.



!------------ Adding Meshes
* const rigidBodyType = this.rapier.RigidBodyDesc.dynamic();
- Describes the rigid-body as dynamic (affected by forces).

* this.rigidBody = this.world.createRigidBody(rigidBodyType);
- Creates a dynamic rigid body.

* const worldPosition = mesh.getWorldPosition(new THREE.Vector3());
- Gets the world position of the mesh.

* const worldRotation = mesh.getWorldQuaternion(new THREE.Quaternion());
- Gets the world rotation of the mesh.

* this.rigidBody.setTranslation(worldPosition);
- Sets the rigid body's position to match the mesh's world position.

* this.rigidBody.setRotation(worldRotation);
- Sets the rigid body's rotation to match the mesh's world rotation.

* const dimensions = this.computeCuboidDimensions(mesh);
- Computes the dimensions of the collider.

* const colliderType = this.rapier.ColliderDesc.cuboid(dimensions.x / 2, dimensions.y / 2, dimensions.z / 2);
- Creates a cuboid collider using the computed dimensions.

* this.world.createCollider(colliderType, this.rigidBody);
- Adds the collider to the physics world.

* this.meshMap.set(mesh, this.rigidBody);
- Maps the mesh to its corresponding rigid body.



!------------ Compute Cuboid Dimensions
* computeCuboidDimensions(mesh) {}
- Method to compute the dimensions of the mesh's bounding box.

* mesh.geometry.computeBoundingBox();
- Computes the bounding box for the mesh's geometry.

* const size = mesh.geometry.boundingBox.getSize(new THREE.Vector3()); 
- Gets the size of the bounding box.

* const worldScale = mesh.getWorldScale(new THREE.Vector3());
- Gets the world scale of the mesh.

* size.multiply(worldScale);
- Adjusts the bounding box size by the mesh's world scale.



!------------ Loop Method
* loop() {} 
- Method to update the scene based on the physics simulation.

* if (!this.rapierLoaded) return;
- Checks if Rapier is loaded; if not, skips the loop if the physics library isn’t loaded.

* this.world.step();
- Advances the physics simulation by one step.

* this.meshMap.forEach((rigidBody, mesh) => {}
- Iterates over each entry in the meshMap, processing each mesh and its corresponding rigid body.

* const position = new THREE.Vector3().copy(rigidBody.translation());
* const rotation = new THREE.Quaternion().copy(rigidBody.rotation());
- gets the rigid body’s position & rigid body’s rotation.

* position.applyMatrix4(
*    new THREE.Matrix4().copy(mesh.parent.matrixWorld).invert()
* );
- adjusts the position based on the parent matrix.
- Applies the inverse of the parent mesh's world matrix to the position to get the position relative to the parent.

* const inverseParentMatrix = new THREE.Matrix4()
*   .extractRotation(mesh.parent.matrixWorld)
*   .invert();
- calculates the inverse rotation of the parent matrix.
- Extracts and inverts the rotation part of the parent mesh's world matrix.

* const inverseParentRotation =
*   new THREE.Quaternion().setFromRotationMatrix(inverseParentMatrix);
- Sets a quaternion from the inverted parent rotation matrix.
- gets the inverse rotation quaternion.

* rotation.premultiply(inverseParentRotation);
- applies the inverse rotation to the rigid body’s rotation.
- Pre-multiplies the rotation by the inverse parent rotation.

* mesh.position.copy(position);
* mesh.quaternion.copy(rotation);
- updates the mesh’s position & rotation
- Copies the calculated position and rotation to the mesh.


!==================================================================
!========================= Add() ==================================

? this.meshMap.set(mesh, this.rigidBody);
- establishes a relationship between each mesh in the scene and its corresponding rigid body in the physics simulation.



!==================================================================
!========================= Loop() =================================

? Why "THREE.Vector3().copy()" ?
- This is necessary because we want to store the translation (position) of the rigid-body in a new object to avoid modifying the original data.

? Why "THREE.Quaternion().copy()" ?
- we want to store the rotation of the rigid-body in a new object to avoid modifying the original data.



!%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
? position.applyMatrix4()
- This effectively transforms the world position of the rigid body back into the local coordinate system of the parent object.

? mesh.parent.matrixWorld
- This "matrix" includes the position, rotation, and scale of the parent object.

? (mesh.parent.matrixWorld).invert()
- The "inversion" is necessary to transform the position from world-coordinates back into the local-coordinates of the parent object. 
- This step is crucial for correctly positioning the mesh relative to its parent.

? Why Transform to Parent's Local Coordinates?????
- When a mesh is part of a hierarchical structure (i.e., it has a parent), its position and rotation are relative to its parent. The physics engine (rapier) provides the world position and rotation of the rigid bodies. However, in a hierarchical scene graph, we need to adjust these values to account for the transformations applied by parent objects.

- By transforming the world position of the rigid body back to the local coordinate system of the parent, we ensure that the mesh is correctly positioned within its parent's space. This adjustment is essential for maintaining the hierarchical relationships and ensuring that the mesh's position and rotation are accurately updated according to the physics simulation.



!%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Purpose of Inverting the Parent's Matrix
* 01. Handling Parent Transformations:
- In a 3D scene graph, objects can be nested within other objects, meaning a child object's transformation (position, rotation, scale) is relative to its parent's transformation.
When updating a child's transformation, you often need to account for the parent's transformation to ensure the child moves correctly within the world space.

* 02. Transforming from World Space to Local Space:
- After computing the new world space position and rotation from the physics engine, you need to transform these back into the local space of the child object's parent to apply them correctly.
This requires inverting the parent's transformation matrix to cancel out the parent's effects and correctly set the child's transformations.

? .extractRotation(mesh.parent.matrixWorld)
- strips out the translation and scale, leaving only the rotation from the matrixWorld of the parent. 
- This step is crucial because we are interested in adjusting only the rotation of the mesh relative to its parent, not its position or scale.

? .invert() 
- The inversion is necessary to transform the world rotation of the rigid body back into the local coordinate system of the parent. This step ensures that the rotation is correctly aligned with the parent's coordinate system.

!%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
* Why Use THREE.Quaternion?
Representation of Rotation:
- Quaternions are used to represent rotations in 3D space because they avoid the problem of gimbal lock and provide smooth interpolations.
- Quaternions are more computationally efficient for many operations compared to Euler angles (pitch, yaw, roll).

? .setFromRotationMatrix()
-  converts a rotation matrix into a quaternion. This is important because transformations in the scene graph are often represented as matrices, but for certain operations (like applying rotations), quaternions are more convenient.










*/