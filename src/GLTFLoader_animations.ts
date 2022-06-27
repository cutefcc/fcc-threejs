import * as THREE from "three";
import { Mesh } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
const canvas = document.querySelector<HTMLCanvasElement>("#canvas");

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

  public box: Mesh;
  constructor() {
    super();
    // 设置相机位置
    GameScene.camera.position.z = 3;
    // 把相机添加到场景中
    this.add(GameScene.camera);
    // this.box = this.addBox();
    this.createLight();
    this.loadModles();
    this.createGround();
  }
  createLight() {
    this.add(new THREE.AmbientLight(0xffffff, 0.5)); // 环境光，颜色，强度
    const light = new THREE.DirectionalLight(0xffffff, 3); // 平行光，颜色，强度
    // const light = new THREE.PointLight(0xff34ff, 0.5); // 平行光，颜色，强度
    light.position.set(3, 3, 6);
    light.castShadow = true; // 平行光设置 投影
    light.shadow.mapSize.width = 1024; // 平行光投影 的 宽度
    light.shadow.mapSize.height = 1024; // 平行光投影 的 长度
    light.shadow.radius = 2;

    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 1000;

    light.shadow.camera.visible = true;
    light.shadow.camera.top = light.shadow.camera.right = 1000;
    light.shadow.camera.bottom = light.shadow.camera.left = -1000;
    // light.shadow.camera.near = 1;
    // light.shadow.camera.far = 400000000;
    this.add(light); // 平行光，才能有光影
    this.add(new THREE.DirectionalLightHelper(light, 10));
  }
  addBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.add(cube);
    cube.castShadow = true; //  消费投影
    gsap.to(cube.rotation, {
      duration: 3,
      y: Math.PI * 2,
      repeat: -1,
      yoyo: true,
      ease: "linear",
    });

    return cube;
  }
  createGround() {
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
    });
    // const planeMat = new THREE.ShadowMaterial({
    //   color: 0xfff5ff,
    //   side: THREE.DoubleSide,
    // });
    // planeMat.opacity = 0.5;
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    // plane.position.y = -0.5;
    plane.receiveShadow = true; // 接收投影
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
        console.log("动画", gltf.animations);
        this.add(gltf.scene);
        // 去播放动画
        const mixer = new THREE.AnimationMixer(gltf.scene);
        mixer.clipAction(gltf.animations[0]).play();

        GameScene.mixer = mixer;
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  }
}
const scene = new GameScene();
// 理解为轨道相机
//
GameScene.controls.update();
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  //   scene.box.rotation.x += 0.01;
  //   scene.box.rotation.y += 0.01;
  GameScene.controls.update();
  GameScene.mixer?.update(clock.getDelta());
  renderer.render(scene, GameScene.camera);
}

animate();
