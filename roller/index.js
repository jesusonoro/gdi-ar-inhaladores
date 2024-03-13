// Imports
import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { MindARThree } from "mindar-image-three";
import { gsap } from "gsap";

// UI Controls
var backingTargetFound = false;
const statusText = document.getElementById("statusText");

// ThreeJS + MindAR
// Scene Init

// Backing
const backingMindarThree = new MindARThree({
  container: document.querySelector("#container"),
  imageTargetSrc: "target/roller.mind",
  filterMinCF: 0.0001,
  filterBeta: 0.003,
});
const { renderer, scene, camera } = backingMindarThree;
const backingAnchor = backingMindarThree.addAnchor(0);

// Test 3D Scene
const geometry = new THREE.PlaneGeometry(0.55 * 1.8, 1 * 1.8);
var video = document.getElementById("video");
var texture = new THREE.VideoTexture(video);
texture.needsUpdate;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBAFormat;
texture.crossOrigin = "anonymous";

var playingVideo = false;
window.addEventListener("click", () => {
  if (!playingVideo && backingTargetFound) {
    video.load();
    video.play();

    if (models) {
      const showAndClose = (_model, _start, _end) => {
        setTimeout(() => {
          _model.play();
          _model.playing = true;
          gsap.to(_model.object.scale, {
            x: 0.6,
            duration: 1,
          });
          gsap.to(_model.object.scale, {
            y: 0.6,
            duration: 1,
          });
          gsap.to(_model.object.scale, {
            z: 0.6,
            duration: 1,
          });
        }, _start);
        setTimeout(() => {
          _model.playing = false;
          gsap.to(_model.object.scale, {
            x: 0,
            duration: 1,
          });
          gsap.to(_model.object.scale, {
            y: 0,
            duration: 1,
          });
          gsap.to(_model.object.scale, {
            z: 0,
            duration: 1,
          });
        }, _end);
      };
      showAndClose(models[0], 9000, 14000);
      showAndClose(models[1], 14000, 19500);
      showAndClose(models[2], 19500, 25000);
      showAndClose(models[3], 25000, 31000);
    }

    playingVideo = true;

    statusText.classList.add("hidden");
    setTimeout(() => {
      playingVideo = false;
    }, 36000);
  }
});
const plane = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({ map: texture })
);
plane.position.set(0, -0.4, 0);
backingAnchor.group.add(plane);

// 3D Scene
let modelsReady = 0;
const models = [
  {
    i: 0,
    name: "Iprasynt",
    path: "../models/iprasynt_2.glb",
    position: new THREE.Vector3(0.1, -1, 0.2),
    mixer: null,
    playing: false,
    play: null,
    object: null,
    zoomIn: null,
    zoomOut: null,
    rotate: null,
    stopRotation: null,
  },
  {
    i: 1,
    name: "Sacrusynt",
    path: "../models/sacrusynt_2.glb",
    position: new THREE.Vector3(0.1, -1, 0.2),
    mixer: null,
    playing: false,
    play: null,
    object: null,
    zoomIn: null,
    zoomOut: null,
    rotate: null,
    stopRotation: null,
  },
  {
    i: 2,
    name: "Eclosynt 250",
    path: "../models/eclosynt250_2.glb",
    position: new THREE.Vector3(0.1, -1, 0.2),
    mixer: null,
    playing: false,
    play: null,
    object: null,
    zoomIn: null,
    zoomOut: null,
    rotate: null,
    stopRotation: null,
  },
  {
    i: 3,
    name: "Eclosynt-Nas",
    path: "../models/eclosyntNas_2.glb",
    position: new THREE.Vector3(0.1, -1, 0.2),
    mixer: null,
    playing: false,
    play: null,
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

      // Animation

      const animations = gltf.animations;
      if (_model.object && animations && animations.length) {
        _model.mixer = new THREE.AnimationMixer(object);

        _model.play = () => {
          animations.forEach((clip) => {
            const action = _model.mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
            action.play();
          });
        };
      }

      // Positioning
      _model.object.position.set(
        _model.position.x,
        _model.position.y,
        _model.position.z
      );
      _model.object.scale.set(0, 0, 0);

      backingAnchor.group.add(_model.object);

      // Ready
      modelsReady += 1;
    },
    (xhr) => {
      // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
      alert(error);
    }
  );
};
// Load
models.forEach((_model) => {
  loadModel(_model);
});

// Lights
const environmentLight = new THREE.AmbientLight("#FFFFFF", 3);
scene.add(environmentLight);

const clock = new THREE.Clock();
const start = async () => {
  await backingMindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);

    // Models animation
    if (modelsReady === 4) {
      models.forEach((_model, i) => {
        if (_model.playing) {
          _model.mixer.update(clock.getDelta());
        }
      });
    }

    if (!backingTargetFound) {
      if (backingAnchor.visible) {
        statusText.innerText = "Da click a la pantalla para ver el video";
        backingTargetFound = true;
      }
    } else {
      if (!backingAnchor.visible) {
        statusText.innerText = "Mira el roller con tu cámara";
        backingTargetFound = false;
      }
    }
  });
};
start();
