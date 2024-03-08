// ThreeJS + MindAR

// Imports
import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { MindARThree } from "mindar-image-three";

// Scene Init
const mindarThree = new MindARThree({
  container: document.querySelector("#container"),
  imageTargetSrc: "/target.mind",
});
const { renderer, scene, camera } = mindarThree;
const anchor = mindarThree.addAnchor(0);

// Test 3D Scene
const geometry = new THREE.PlaneGeometry(1, 0.55);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.5,
});
const plane = new THREE.Mesh(geometry, material);

// 3D Scene

// Load
let mixer;
let modelsReady = 0;

const models = [
  {
    path: "models/iprasynt.glb",
    position: new THREE.Vector3(-0.3, -0.25, 0.05),
    mixer: null,
  },
  {
    path: "models/sacrusynt.glb",
    position: new THREE.Vector3(-0.1, -0.25, 0.05),
    mixer: null,
  },
  {
    path: "models/eclosynt250.glb",
    position: new THREE.Vector3(0.1, -0.25, 0.05),
    mixer: null,
  },
  {
    path: "models/eclosyntNas.glb",
    position: new THREE.Vector3(0.3, -0.25, 0.05),
    mixer: null,
  },
];

// GLTF Init
const gltfLoader = new GLTFLoader();
const loadModel = (_model) => {
  gltfLoader.load(
    _model.path,
    (gltf) => {
      console.log(_model.path);
      console.log(gltf);
      const object = gltf.scene;

      // Materials fix
      object.children.forEach((_child, i) => {
        if (_child.type === "Object3D" && i === 3) {
          console.log("Object3D", _child);
          _child.children.forEach((_oChild) => {
            if (_oChild.type === "Group") {
              _oChild.children.forEach((_mesh) => {
                console.log("mesh", _mesh);
                _mesh.material = new THREE.MeshBasicMaterial({
                  color: 0xffffff,
                });
                _mesh.material.side = THREE.DoubleSide;
              });
            }
          });
        } else {
          console.log(_child);
        }
      });

      // Animation
      const animations = gltf.animations;
      if (object && animations && animations.length) {
        _model.mixer = new THREE.AnimationMixer(object);
        const action = _model.mixer.clipAction(animations[0]);
        action.play();
      }

      // Positioning
      object.position.set(
        _model.position.x,
        _model.position.y,
        _model.position.z
      );
      object.scale.set(0.2, 0.2, 0.2);
      anchor.group.add(object);

      // Ready
      modelsReady += 1;
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
      alert(error);
    }
  );
};

// Lights
const environmentLight = new THREE.AmbientLight("#FFFFFF", 3);
scene.add(environmentLight);

// Load
models.forEach((_model) => {
  loadModel(_model);
});

// Add 3D to anchor
anchor.group.add(plane);

const clock = new THREE.Clock();
const start = async () => {
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    if (modelsReady === 4) {
      models.forEach((_model) => {
        _model.mixer.update(clock.getDelta());
      });
    }
  });
};
start();
