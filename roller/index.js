// Imports
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

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

// Lights
const environmentLight = new THREE.AmbientLight("#FFFFFF", 3);
scene.add(environmentLight);

const start = async () => {
  await backingMindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
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
