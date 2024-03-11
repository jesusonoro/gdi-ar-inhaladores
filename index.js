// UI Controls
var targetFound = false;
var selection = null;
var selectionZoomIn = null;
var selectionZoomOut = null;
var selectionRotate = null;
var selectionStopRotating = null;

const statusText = document.getElementById("statusText");

const buttons1 = document.getElementById("buttons1");
const iprasyntBtn = document.getElementById("iprasyntBtn");
const sacrusyntBtn = document.getElementById("sacrusyntBtn");
const eclosynt250Btn = document.getElementById("eclosynt250Btn");
const eclosyntNasBtn = document.getElementById("eclosyntNasBtn");

const buttons2 = document.getElementById("buttons2");
const backBtn = document.getElementById("backBtn");

const clickSelection = (_inhName) => {
  selection = _inhName;
  console.log(`Click ${_inhName}`);
  buttons1.classList.add("hidden");
  buttons2.classList.remove("hidden");
  statusText.innerText = _inhName;
};

backBtn.addEventListener("click", () => {
  if (targetFound) {
    statusText.innerText = "Selecciona un producto";
  } else {
    statusText.innerText = "Mira el flyer con tu cámara";
  }
  buttons1.classList.remove("hidden");
  buttons2.classList.add("hidden");
});

// ThreeJS + MindAR

// Imports
import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { MindARThree } from "mindar-image-three";

// Scene Init
const mindarThree = new MindARThree({
  container: document.querySelector("#container"),
  imageTargetSrc: "target/target.mind",
});
const { renderer, scene, camera } = mindarThree;
const anchor = mindarThree.addAnchor(0);

// Test 3D Scene
const geometry = new THREE.PlaneGeometry(0.55 * 1.4, 1 * 1.4);
var video = document.getElementById("video");
var texture = new THREE.VideoTexture(video);
texture.needsUpdate;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBAFormat;
texture.crossOrigin = "anonymous";

var playingVideo = false;
window.addEventListener("click", () => {
  if (!playingVideo) {
    video.load();
    video.play();
    playingVideo = true;
  }
});

const plane = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({ map: texture })
);

// 3D Scene

// Load
let mixer;
let modelsReady = 0;

const models = [
  {
    name: "Iprasynt",
    path: "models/iprasynt_2.glb",
    position: new THREE.Vector3(-0.3, -0.25, 0.05),
    mixer: null,
    playing: false,
    button: iprasyntBtn,
    object: null,
    zoomIn: null,
    zoomOut: null,
    rotate: null,
    stopRotation: null,
  },
  {
    name: "Sacrusynt",
    path: "models/sacrusynt.glb",
    position: new THREE.Vector3(-0.1, -0.25, 0.05),
    mixer: null,
    playing: false,
    button: sacrusyntBtn,
    object: null,
    zoomIn: null,
    zoomOut: null,
    rotate: null,
    stopRotation: null,
  },
  {
    name: "Eclosynt 250",
    path: "models/eclosynt250.glb",
    position: new THREE.Vector3(0.1, -0.25, 0.05),
    mixer: null,
    playing: false,
    button: eclosynt250Btn,
    object: null,
    zoomIn: null,
    zoomOut: null,
    rotate: null,
    stopRotation: null,
  },
  {
    name: "Eclosynt-Nas",
    path: "models/eclosyntNas.glb",
    position: new THREE.Vector3(0.3, -0.25, 0.05),
    mixer: null,
    playing: false,
    button: eclosyntNasBtn,
    object: null,
    zoomIn: null,
    zoomOut: null,
    rotate: null,
    stopRotation: null,
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
      _model.object = object;

      // Materials fix
      // object.children.forEach((_child, i) => {
      //   console.log(`child l1_${i}`, _child.name);
      //   if (
      //     _child.type === "Object3D" &&
      //     (_child.name === "Top" || _child.name === "Lateral")
      //   ) {
      //     console.log("Object3D", _child);
      //     _child.children.forEach((_childl2, j) => {
      //       console.log(`child l2_${j}`, _childl2.name);
      //       if (_childl2.type === "Group") {
      //         _childl2.children.forEach((_mesh, k) => {
      //           console.log(`mesh l3_${k}`, _mesh.name);
      //           console.log("mesh", _mesh);
      //           // _mesh.material = new THREE.MeshBasicMaterial({
      //           //   side: THREE.DoubleSide,
      //           // });
      //         });
      //       }
      //     });
      //   } else {
      //     console.log(_child);
      //   }
      // });

      // Animation

      const animations = gltf.animations;
      if (_model.object && animations && animations.length) {
        _model.mixer = new THREE.AnimationMixer(object);

        // Model Button Click
        _model.button.addEventListener("click", () => {
          // UI status update
          clickSelection(_model.name);

          // Play animation
          animations.forEach((clip) => {
            const action = _model.mixer.clipAction(clip);
            // action.clampWhenFinished = true;
            action.play();
          });

          // Model playing status TRUE
          _model.playing = true;
        });
      }

      // Positioning
      _model.object.position.set(
        _model.position.x,
        _model.position.y,
        _model.position.z
      );
      _model.object.scale.set(0.2, 0.2, 0.2);

      _model.zoomIn = () => {
        gsap.to(_model.object, {
          scale: new THREE.Vector3(1, 1, 1),
          duration: 1,
        });
      };

      anchor.group.add(_model.object);

      // Ready
      modelsReady += 1;
      console.log("");
      console.log("");
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

    // Models animation
    if (modelsReady === 4) {
      models.forEach((_model) => {
        if (_model.playing) {
          _model.mixer.update(clock.getDelta());
        }
      });
    }
    if (!targetFound) {
      if (anchor.visible) {
        statusText.innerText = "Da click a la pantalla para ver el video";
        targetFound = true;
      }
    } else {
      if (!anchor.visible) {
        statusText.innerText = "Mira el flyer con tu cámara.";
        targetFound = false;
      }
    }
  });
};
start();
