import * as THREE from "three";
import { Mesh } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); // antialias 扛锯齿
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

class GameScene extends THREE.Scene {
  // 相机： 视角、宽高比、近裁剪面、远裁剪面
  // fov — Camera frustum vertical field of view. Default value is 50.
  // aspect — Camera frustum aspect ratio. Default value is 1.
  // near — Camera frustum near plane. Default value is 0.1.
  // far — Camera frustum far plane. Default value is 2000.
  // zNear 和 zFar 是近裁剪面和远裁剪面的距离，这两个值越小，就越接近真实世界，越大，就越远离真实世界。
  // 如果 zNear 和 zFar 的值相同，那么相机就是一个正交相机。就没有近大远小的效果了
  // zNear 和 zFar之间的距离就是相机的视角。
  // zFar 一定要大于 zNear，否则会出现渲染问题。
  static camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // 让场景可以随着相机移动、旋转
  static controls = new OrbitControls(GameScene.camera, renderer.domElement);
  static mixer: THREE.AnimationMixer;
  // 创建射线发生器
  public raycaster = new THREE.Raycaster();
  // 定义一个鼠标位置点
  public pointer = new THREE.Vector2();

  public box: Mesh;
  public clickNum: number = 0;
  constructor() {
    super();
    // 设置相机位置
    GameScene.camera.position.z = 3;
    // 把相机添加到场景中
    this.add(GameScene.camera);
    this.box = this.addBox();
    this.createLight();
    // this.loadModles();
    this.createGround();
  }
  createLight() {
    this.add(new THREE.AmbientLight(0xffffff, 0.5)); // 环境光，颜色，强度
    const light = new THREE.DirectionalLight(0xffffff, 3); // 平行光，颜色，强度
    light.position.set(3, 0, 3);
    light.castShadow = true; // 平行光设置 投影

    light.shadow.mapSize.width = 512; // 平行光投影 的 宽度
    light.shadow.mapSize.height = 512; // 平行光投影 的 长度
    light.shadow.radius = 2;

    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 30;

    light.shadow.camera.visible = true;
    // 添加灯光到场景
    this.add(light);
    // 灯光helper
    // const helper = new THREE.DirectionalLightHelper(light);
    // this.add(helper);
    // // camerraHeaper
    // const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    // this.add(cameraHelper);
  }
  addBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true; //  消费投影
    cube.position.z = 1.5;
    gsap.to(cube.rotation, {
      duration: 3,
      z: Math.PI * 2,
      repeat: -1,
      yoyo: true,
      ease: "linear",
    });
    this.add(cube);
    // 绑定click 事件
    this.bindEvent(cube, "click", (intersect) => {
      this.clickNum++;
      console.log("cube click", intersect, this.clickNum);
      if (intersect.length > 0) {
        intersect.forEach((item) => {
          // 可以根据这个id去判断是点击的哪一个mesh
          if (item.object.id === 15) {
            if (this.clickNum % 2 === 0) {
              item.object.material.color.set(0x00ff00);
            } else {
              item.object.material.color.set(0xff0000);
            }
          } else {
            if (this.clickNum % 2 === 0) {
              item.object.material.color.set(0x0000ff);
            } else {
              item.object.material.color.set(0xff6000);
            }
          }
        });
      }
    });
    return cube;
  }
  createGround() {
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial());
    plane.position.y = 0;
    plane.receiveShadow = true;
    this.add(plane);
  }
  loadModles() {
    const loader = new GLTFLoader();
    // loader.loadAsync 也可以
    loader.load(
      "http://www.cutefcc.com:81/raccoon_non-_commercial/scene.gltf",
      (gltf) => {
        gltf.scene.castShadow = true; //  消费投影
        gltf.scene.scale.set(5, 5, 5); // 缩放
        gltf.scene.position.z = 0.5;
        console.log("动画", gltf.animations);
        this.add(gltf.scene);
        // 去播放动画
        const mixer = new THREE.AnimationMixer(gltf.scene);
        // 播放某一个动画
        // mixer.clipAction(gltf.animations[0]).play();
        mixer
          .clipAction(
            THREE.AnimationClip.findByName(gltf.animations, "nyi_loop")
          )
          .play();

        GameScene.mixer = mixer;
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  }
  // 更新射线 发射射线
  updateRaycaster() {
    this.raycaster.setFromCamera(this.pointer, GameScene.camera);
  }
  bindEvent<T extends THREE.Object3D>(
    target: T,
    type: string,
    callback: (intersect: THREE.Intersection<T>[]) => void
  ) {
    renderer.domElement.addEventListener(type, () => {
      // 单个 判断射线是否与我们的mesh相交
      // const intersects = this.raycaster.intersectObject<T>(target);
      // 多个
      const intersects = this.raycaster.intersectObjects<T>(scene.children);
      // scene.children 是一个数组，里面存放的是所有的mesh
      if (intersects.length > 0) {
        callback(intersects);
      }
    });
  }
}
const scene = new GameScene();
// 理解为轨道相机
GameScene.controls.update();
const clock = new THREE.Clock();
function animate() {
  GameScene.controls.update();
  // 更新动画
  GameScene.mixer?.update(clock.getDelta());
  scene.updateRaycaster();
  renderer.render(scene, GameScene.camera);
  requestAnimationFrame(animate);
}

animate();
renderer.domElement.addEventListener("pointermove", (event) => {
  // 计算一个 -1 到 1的值，pointer 就能实时取到我们光标的位置
  scene.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  scene.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
