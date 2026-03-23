import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { state } from "./state.js";

export class MiniPlayerModel {
    constructor(xPos, yPos) {

        const canvasX = state.scale * 49;
        const canvasY = state.scale * 70;

        // Create foreign html element to store rendered element
        const foreignObject = state.svg.append('foreignObject')
            .attr('class', 'playerModelContainer')
            .attr('pointer-events', 'none')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('x', xPos)
            .attr('y', yPos)

        // Create renderer
        const renderer = new THREE.WebGLRenderer( {antialias: false});
        renderer.setSize(canvasX, canvasY);
        foreignObject.node().appendChild(renderer.domElement);
        
        // Create camera
        const fov = 70; const aspect = canvasX / canvasY; const near = 0.1; const far = 100;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 2.0; camera.position.y = 1.25;
        
        // Create scene
        const scene = new THREE.Scene();

        // Create & Load player model
        let object = null;
        const loader = new GLTFLoader();
        loader.load(
            './src/assets/models/MinecraftPlayer/Slim/Untitled.gltf',
            (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        // child.material.side = THREE.DoubleSide;
                        child.material.depthWrite = true;
                        // child.renderOrder = 0;
                    }
                });
                // If file is loaded, add it to scene
                object = gltf.scene;
                scene.add(object);
            }, null ,
            (error) => {
                // If there is an error, log it
                console.log(error);
            }
        )

        // Start the render loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();


        // Add lights to the scene
        const topLight = new THREE.DirectionalLight(0xffffff, 4);
        topLight.position.set(-500, 500, 100) // Top Right
        scene.add(topLight);
        const ambientLight = new THREE.AmbientLight(0x333333, 13);
        scene.add(ambientLight);

        // Add callback for model animation
        state.svg.node().addEventListener('mousemove', (event) => {
            if (object != null) {
                const a = 1.3;
                const x = (state.mouseX - xPos - canvasX / 2) / 500
                const y = (state.mouseY - yPos + canvasY / 2) / 2000
                const bellX = 1 / (1 + ((x / a)*(x / a)));
                const bellY = 1 / (1 + ((y / a)*(y / a)));
                object.rotation.y = x * bellX;
                object.rotation.x = y * bellY;
            }
        })

        renderer.render(scene, camera);
    }
}
