// Imports
import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { MindARThree } from "mindar-image-three";
import { gsap } from "gsap";

// UI Controls
var backingTargetFound = false;
var selection = null;
var zoomedIn = false;
var selectionZoomIn = null;
var selectionZoomOut = null;
var rotateSelection = null;

const statusText = document.getElementById("statusText");

const buttons1 = document.getElementById("buttons1");
const iprasyntBtn = document.getElementById("iprasyntBtn");
const sacrusyntBtn = document.getElementById("sacrusyntBtn");
const eclosynt250Btn = document.getElementById("eclosynt250Btn");
const eclosyntNasBtn = document.getElementById("eclosyntNasBtn");

const buttons2 = document.getElementById("buttons2");
const zoomBtn = document.getElementById("zoomBtn");
const rotateBtn = document.getElementById("rotateBtn");
const backBtn = document.getElementById("backBtn");

zoomBtn.addEventListener("click", () => {
  if (!zoomedIn) {
    selectionZoomIn();
    zoomedIn = true;
  } else {
    selectionZoomOut();
    zoomedIn = false;
  }
});
rotateBtn.addEventListener("click", () => {
  rotateSelection();
});
backBtn.addEventListener("click", () => {
  if (selection !== null) {
    selectionZoomOut();
    zoomedIn = false;
    if (models) {
      models[selection].playing = false;
    }
  }
  if (backingTargetFound) {
    statusText.innerText = "Selecciona un producto";
  } else {
    statusText.innerText = "Mira el backing con tu cámara";
  }
  buttons1.classList.remove("hidden");
  buttons2.classList.add("hidden");
});

// ThreeJS + MindAR

// Scene Init

// Backing
const backingMindarThree = new MindARThree({
  container: document.querySelector("#container"),
  imageTargetSrc: "target/backing.mind",
  filterMinCF: 0.0001,
  filterBeta: 0.003,
});
const { renderer, scene, camera } = backingMindarThree;
const backingAnchor = backingMindarThree.addAnchor(0);
const rollerAnchor = backingMindarThree.addAnchor("target/roller.mind");

// 3D Scene

// Load

let modelsReady = 0;

const models = [
  {
    i: 0,
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
    i: 1,
    name: "Sacrusynt",
    path: "models/sacrusynt_2.glb",
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
    i: 2,
    name: "Eclosynt 250",
    path: "models/eclosynt250_2.glb",
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
    i: 3,
    name: "Eclosynt-Nas",
    path: "models/eclosyntNas_2.glb",
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

const clickSelection = (i) => {
  selection = i;
  if (models) {
    gsap.to(models[i].object.scale, {
      x: 0.3,
      duration: 1,
    });
    gsap.to(models[i].object.scale, {
      y: 0.3,
      duration: 1,
    });
    gsap.to(models[i].object.scale, {
      z: 0.3,
      duration: 1,
    });
  }
  console.log(`Click ${models[i].name}`);
  buttons1.classList.add("hidden");
  buttons2.classList.remove("hidden");
  statusText.innerText = models[i].name;
};
selectionZoomIn = () => {
  zoomBtn.innerText = "Alejar";
  gsap.to(models[selection].object.scale, {
    x: 0.6,
    duration: 1,
  });
  gsap.to(models[selection].object.scale, {
    y: 0.6,
    duration: 1,
  });
  gsap.to(models[selection].object.scale, {
    z: 0.6,
    duration: 1,
  });
  gsap.to(models[selection].object.position, {
    z: 0.5,
    duration: 1,
  });
};
selectionZoomOut = () => {
  zoomBtn.innerText = "Acercar";
  gsap.to(models[selection].object.scale, {
    x: 0.2,
    duration: 1,
  });
  gsap.to(models[selection].object.scale, {
    y: 0.2,
    duration: 1,
  });
  gsap.to(models[selection].object.scale, {
    z: 0.2,
    duration: 1,
  });
  gsap.to(models[selection].object.position, {
    z: 0.05,
    duration: 1,
  });
};
rotateSelection = () => {
  gsap.to(models[selection].object.rotation, {
    y: models[selection].object.rotation.y + Math.PI * 2,
    duration: 10,
  });
};

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

        // Model Button Click
        _model.button.addEventListener("click", () => {
          // UI status update
          clickSelection(_model.i);

          // Play animation
          animations.forEach((clip) => {
            const action = _model.mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
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

// Lights
const environmentLight = new THREE.AmbientLight("#FFFFFF", 3);
scene.add(environmentLight);
// rollerScene.add(environmentLight);

// Load
models.forEach((_model) => {
  loadModel(_model);
});

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
        statusText.innerText = "Selecciona un inhalador";
        backingTargetFound = true;
      }
    } else {
      if (!backingAnchor.visible) {
        statusText.innerText = "Mira el backing con tu cámara";
        backingTargetFound = false;
      }
    }
  });
};
start();
