import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
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
        // renderer.setClearColor( 0x88ffff, 1 );
        foreignObject.node().appendChild(renderer.domElement);
        
        const scale = 57.5 * state.scale;
        const camera = new THREE.OrthographicCamera(canvasX / -scale, canvasX / scale, canvasY / scale, canvasY / -scale, 1, 3);
        camera.position.z = 2.0; camera.position.y = -0.05;
        
        // Create scene
        const scene = new THREE.Scene();

        // Create & Load player model
        let object = null;
        let head = null;
        let left_arm = null;
        let right_arm = null;
        const loader = new GLTFLoader();
        loader.load(
            './src/assets/models/MinecraftPlayer/Slim/Untitled.gltf',
            (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.material.depthWrite = true;
                        child.renderOrder = 1;
                    }
                    if (child.name == "Head")
                        head = child;
                    if (child.name == "ArmLeftUpper")
                        left_arm = child;
                    if (child.name == "ArmRightUpper")
                        right_arm = child;
                    console.log(child.name)
                });
                // If file is loaded, add it to scene
                object = gltf.scene;
                // const modifier = new TessellateModifier( 8, 8 );
                // object = modifier.modify(object);
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

            if (right_arm != null && left_arm != null) {
                const d = new Date();
                let time = d.getSeconds() * 1000 + d.getMilliseconds();
                left_arm.rotation.z = (Math.sin(time / 750) - 1) / 15;
                right_arm.rotation.z = (Math.sin(time / 750) - 1) / -15;
            };
            renderer.render(scene, camera);
        };
        animate();


        // Add lights to the scene
        const topLight = new THREE.DirectionalLight(0xffffff, 7);
        topLight.position.set(-500, 500, 0) // Top Right
        scene.add(topLight);
        const ambientLight = new THREE.AmbientLight(0x333333, 40);
        scene.add(ambientLight);

        // Add callback for model animation
        state.svg.node().addEventListener('mousemove', (event) => {
            if (object != null) {
                const ax = 0.8; // Bell function height at x = 0
                const ay = 1.0;
                const x = Math.max(Math.min((state.mouseX - xPos - canvasX / 2) / 500, ax), -ax);
                const y = Math.max(Math.min((state.mouseY - yPos - canvasY / 4) / 500, ay), -ay);
                const bellX = 1 / (1 + ((x / ax)*(x / ax)));
                const bellY = 1 / (1 + ((y / ay)*(y / ay)));
                object.rotation.y = x * bellX;
                object.rotation.x = y * bellY;
                head.rotation.y = x * bellX;
                head.rotation.x = y * bellY;
                // console.log("mouse x = " + x + "   \t rotation x = " + x * bellX );
            }
        })

        renderer.render(scene, camera);
    }
}
