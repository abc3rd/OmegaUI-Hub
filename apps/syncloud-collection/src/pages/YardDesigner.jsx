import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Zap, Flame, Save } from 'lucide-react';
import { toast } from 'sonner';

// OrbitControls for Three.js - using a more compatible approach
class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = true;
    
    // Mouse state
    this.mouseButtons = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };
    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.8;
    
    // Spherical coordinates
    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();
    
    // Pan
    this.panOffset = new THREE.Vector3();
    
    // Target
    this.target = new THREE.Vector3();
    
    // State
    this.state = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2 };
    this.currentState = this.state.NONE;
    
    // Mouse positions
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();
    
    this.panStart = new THREE.Vector2();
    this.panEnd = new THREE.Vector2();
    this.panDelta = new THREE.Vector2();
    
    this.dollyStart = new THREE.Vector2();
    this.dollyEnd = new THREE.Vector2();
    this.dollyDelta = new THREE.Vector2();
    
    this.init();
  }
  
  init() {
    // Set up initial camera position
    this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
    
    // Event listeners
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this));
  }
  
  onMouseDown(event) {
    if (!this.enabled) return;
    
    event.preventDefault();
    
    switch (event.button) {
      case this.mouseButtons.LEFT:
        this.currentState = this.state.ROTATE;
        this.rotateStart.set(event.clientX, event.clientY);
        break;
      case this.mouseButtons.MIDDLE:
        this.currentState = this.state.DOLLY;
        this.dollyStart.set(event.clientX, event.clientY);
        break;
      case this.mouseButtons.RIGHT:
        this.currentState = this.state.PAN;
        this.panStart.set(event.clientX, event.clientY);
        break;
    }
    
    if (this.currentState !== this.state.NONE) {
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
      document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
  }
  
  onMouseMove(event) {
    if (!this.enabled) return;
    
    event.preventDefault();
    
    switch (this.currentState) {
      case this.state.ROTATE:
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
        
        this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / this.domElement.clientHeight;
        this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight;
        
        this.rotateStart.copy(this.rotateEnd);
        break;
        
      case this.state.PAN:
        this.panEnd.set(event.clientX, event.clientY);
        this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);
        this.pan(this.panDelta.x, this.panDelta.y);
        this.panStart.copy(this.panEnd);
        break;
        
      case this.state.DOLLY:
        this.dollyEnd.set(event.clientX, event.clientY);
        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
        
        if (this.dollyDelta.y > 0) {
          this.dollyIn(this.getZoomScale());
        } else if (this.dollyDelta.y < 0) {
          this.dollyOut(this.getZoomScale());
        }
        
        this.dollyStart.copy(this.dollyEnd);
        break;
    }
    
    this.update();
  }
  
  onMouseUp() {
    if (!this.enabled) return;
    
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    
    this.currentState = this.state.NONE;
  }
  
  onMouseWheel(event) {
    if (!this.enabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    if (event.deltaY < 0) {
      this.dollyOut(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyIn(this.getZoomScale());
    }
    
    this.update();
  }
  
  onContextMenu(event) {
    if (!this.enabled) return;
    event.preventDefault();
  }
  
  getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed);
  }
  
  dollyIn(dollyScale) {
    this.spherical.radius *= dollyScale;
  }
  
  dollyOut(dollyScale) {
    this.spherical.radius /= dollyScale;
  }
  
  pan(deltaX, deltaY) {
    const offset = new THREE.Vector3();
    
    const position = this.camera.position;
    offset.copy(position).sub(this.target);
    
    let targetDistance = offset.length();
    targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
    
    const panLeft = new THREE.Vector3();
    panLeft.setFromMatrixColumn(this.camera.matrix, 0);
    panLeft.multiplyScalar(-2 * deltaX * targetDistance / this.domElement.clientHeight);
    
    const panUp = new THREE.Vector3();
    panUp.setFromMatrixColumn(this.camera.matrix, 1);
    panUp.multiplyScalar(2 * deltaY * targetDistance / this.domElement.clientHeight);
    
    this.panOffset.copy(panLeft).add(panUp);
  }
  
  update() {
    const offset = new THREE.Vector3();
    
    const position = this.camera.position;
    
    offset.copy(position).sub(this.target);
    
    this.spherical.setFromVector3(offset);
    
    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;
    
    this.spherical.phi = Math.max(0.000001, Math.min(Math.PI - 0.000001, this.spherical.phi));
    
    this.spherical.radius = Math.max(1, Math.min(1000, this.spherical.radius));
    
    this.target.add(this.panOffset);
    
    offset.setFromSpherical(this.spherical);
    
    position.copy(this.target).add(offset);
    
    this.camera.lookAt(this.target);
    
    this.sphericalDelta.set(0, 0, 0);
    this.panOffset.set(0, 0, 0);
    
    return true;
  }
  
  dispose() {
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.domElement.removeEventListener('wheel', this.onMouseWheel);
    
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }
}

const lineMaterials = {
    sprinkler: new THREE.LineBasicMaterial({ color: 0x0000ff }), // Blue
    electrical: new THREE.LineBasicMaterial({ color: 0xffa500 }), // Orange
    gas: new THREE.LineBasicMaterial({ color: 0xffff00 }), // Yellow
};

const iconTextures = {
    sprinkler: new THREE.TextureLoader().load('https://img.icons8.com/ios-filled/50/0000ff/sprinkler.png'),
    electrical: new THREE.TextureLoader().load('https://img.icons8.com/ios-filled/50/ffa500/lightning-bolt.png'),
    gas: new THREE.TextureLoader().load('https://img.icons8.com/ios-filled/50/ffff00/gas.png'),
};

export default function YardDesigner() {
    const mountRef = useRef(null);
    const [mode, setMode] = useState(null); // 'sprinkler', 'electrical', 'gas'
    const [sceneObjects, setSceneObjects] = useState([]);
    const sceneRef = useRef(new THREE.Scene());
    const controlsRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        const scene = sceneRef.current;
        scene.background = new THREE.Color(0x87ceeb);

        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 50, 50);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controlsRef.current = controls;

        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22, side: THREE.DoubleSide });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(50, 50, 50);
        scene.add(directionalLight);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);
        
        const handleCanvasClick = (event) => {
            if (!mode) return;

            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            mouse.x = (event.offsetX / currentMount.clientWidth) * 2 - 1;
            mouse.y = -(event.offsetY / currentMount.clientHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(ground);

            if (intersects.length > 0) {
                const point = intersects[0].point;
                const iconSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTextures[mode], color: 0xffffff }));
                iconSprite.position.set(point.x, 1, point.z);
                iconSprite.scale.set(3, 3, 3);
                scene.add(iconSprite);
                setSceneObjects(prev => [...prev, {type: mode, x: point.x, y: point.z}]);
                toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} marker added.`);
            }
        };
        currentMount.addEventListener('click', handleCanvasClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeEventListener('click', handleCanvasClick);
                if (renderer.domElement && currentMount.contains(renderer.domElement)) {
                    currentMount.removeChild(renderer.domElement);
                }
            }
            if (controls) {
                controls.dispose();
            }
            if (renderer) {
                renderer.dispose();
            }
        };
    }, [mode]);

    return (
        <div className="p-6 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">3D Yard Designer</h1>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader><CardTitle>Tools</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">Select a tool and click on the map to place markers.</p>
                            <Button 
                                className="w-full justify-start gap-2" 
                                variant={mode === 'sprinkler' ? 'secondary' : 'outline'} 
                                onClick={() => setMode('sprinkler')}
                            >
                                <Droplets className="w-4 h-4" /> Add Sprinkler Head
                            </Button>
                            <Button 
                                className="w-full justify-start gap-2" 
                                variant={mode === 'electrical' ? 'secondary' : 'outline'} 
                                onClick={() => setMode('electrical')}
                            >
                                <Zap className="w-4 h-4" /> Map Electrical Line
                            </Button>
                            <Button 
                                className="w-full justify-start gap-2" 
                                variant={mode === 'gas' ? 'secondary' : 'outline'} 
                                onClick={() => setMode('gas')}
                            >
                                <Flame className="w-4 h-4" /> Map Gas Line
                            </Button>
                            <Button className="w-full justify-start gap-2 mt-4">
                                <Save className="w-4 h-4" /> Save Layout
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3 h-[70vh]">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Virtual Layout</CardTitle>
                        </CardHeader>
                        <CardContent className="h-full w-full p-0">
                           <div ref={mountRef} className="h-full w-full rounded-b-lg overflow-hidden" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}