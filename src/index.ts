import * as THREE from "three";
import { Mesh } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const canvas = document.querySelector<HTMLCanvasElement>("#canvas");

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

class GameScene extends THREE.Scene {
  // 相机： 视角、宽高比、近裁剪面、远裁剪面
  // fov — Camera frustum vertical field of view. Default value is 50.
  // aspect — Camera frustum aspect ratio. Default value is 1.
  // near — Camera frustum near plane. Default value is 0.1.
  // far — Camera frustum far plane. Default value is 2000.
  // zNear 和 zFar 是近裁剪面和远裁剪面的距离，这两个值越小，就越接近真实世界，越大，就越远离真实世界。
  // 如果 zNear 和 zFar 的值相同，那么相机就是一个正交相机。
  // zNear 和 zFar之间的距离就是相机的视角。
  // zFar 一定要大于 zNear，否则会出现渲染问题。
  static camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  public box: Mesh;
  constructor() {
    super();
    // 设置相机位置
    GameScene.camera.position.z = 3;
    // 把相机添加到场景中
    this.add(GameScene.camera);
    this.box = this.addBox();
    this.add(new THREE.AmbientLight(0xffffff, 0.5));
    this.add(new THREE.DirectionalLight(0xffffff, 0.5));
  }
  addBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.add(cube);
    return cube;
  }
}
const scene = new GameScene();
// 理解为轨道相机
const controls = new OrbitControls(GameScene.camera, renderer.domElement);
controls.update();
function animate() {
  requestAnimationFrame(animate);
  scene.box.rotation.x += 0.01;
  scene.box.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, GameScene.camera);
}

animate();
