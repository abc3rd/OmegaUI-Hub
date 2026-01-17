
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';




import {
  Cuboid,
  Circle, // Changed from Sphere to Circle
  Cylinder,
  Pyramid,
  Download,
  Save,
  Lightbulb,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Undo,
  Redo,
  Camera,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

// Simple OrbitControls implementation - moved outside component for stability
class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enableDamping = true;
    this.dampingFactor = 0.05;

    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();
    this.scale = 1;
    this.panOffset = new THREE.Vector3();

    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();

    this.panStart = new THREE.Vector2();
    this.panEnd = new THREE.Vector2();
    this.panDelta = new THREE.Vector2();

    this.dollyStart = new THREE.Vector2();
    this.dollyEnd = new THREE.Vector2();
    this.dollyDelta = new THREE.Vector2();

    this.target = new THREE.Vector3();
    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.isRotating = false;
    this.isPanning = false;
    this.isDollying = false;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);

    this.domElement.addEventListener('mousedown', this.onMouseDown);
    this.domElement.addEventListener('wheel', this.onMouseWheel);
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  onMouseDown(event) {
    event.preventDefault();

    if (event.button === 0) { // Left click for rotation
      this.isRotating = true;
      this.rotateStart.set(event.clientX, event.clientY);
    } else if (event.button === 2) { // Right click for panning
      this.isPanning = true;
      this.panStart.set(event.clientX, event.clientY);
    }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove(event) {
    if (this.isRotating) {
      this.rotateEnd.set(event.clientX, event.clientY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

      const element = this.domElement;
      this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / element.clientHeight;
      this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / element.clientHeight;

      this.rotateStart.copy(this.rotateEnd);
    }

    if (this.isPanning) {
      this.panEnd.set(event.clientX, event.clientY);
      this.panDelta.subVectors(this.panEnd, this.panStart);
      this.pan(this.panDelta.x, this.panDelta.y);
      this.panStart.copy(this.panEnd);
    }
  }

  onMouseUp() {
    this.isRotating = false;
    this.isPanning = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  onMouseWheel(event) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.scale /= 0.95;
    } else {
      this.scale *= 0.95;
    }
  }

  pan(deltaX, deltaY) {
    const element = this.domElement;
    const targetDistance = this.camera.position.distanceTo(this.target);

    let x = (2 * deltaX) / element.clientHeight;
    let y = (2 * deltaY) / element.clientHeight;

    x *= targetDistance * Math.tan((this.camera.fov / 2) * Math.PI / 180);
    y *= targetDistance * Math.tan((this.camera.fov / 2) * Math.PI / 180);

    const v = new THREE.Vector3();
    v.setFromMatrixColumn(this.camera.matrix, 0); // Get X axis from camera matrix
    v.multiplyScalar(-x);
    this.panOffset.add(v);

    v.setFromMatrixColumn(this.camera.matrix, 1); // Get Y axis from camera matrix
    v.multiplyScalar(y);
    this.panOffset.add(v);
  }

  update() {
    const position = this.camera.position;
    const offset = new THREE.Vector3();

    offset.copy(position).sub(this.target);
    this.spherical.setFromVector3(offset);

    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;
    this.spherical.radius *= this.scale;

    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

    this.target.add(this.panOffset);
    offset.setFromSpherical(this.spherical);
    position.copy(this.target).add(offset);

    this.camera.lookAt(this.target);

    if (this.enableDamping) {
      this.sphericalDelta.theta *= (1 - this.dampingFactor);
      this.sphericalDelta.phi *= (1 - this.dampingFactor);
      this.panOffset.multiplyScalar(1 - this.dampingFactor);
      this.scale = 1 + (this.scale - 1) * (1 - this.dampingFactor);
    } else {
      this.sphericalDelta.set(0, 0, 0);
      this.panOffset.set(0, 0, 0);
      this.scale = 1;
    }
  }

  dispose() {
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.domElement.removeEventListener('wheel', this.onMouseWheel);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }
}

export default function DesignStudio() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const selectedObjectRef = useRef(null);
  const animationIdRef = useRef(null);

  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [mode, setMode] = useState('select'); // select, move, rotate, scale
  const [showGrid, setShowGrid] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(0.4);
  const [directionalLightIntensity, setDirectionalLightIntensity] = useState(0.8);
  const [cameraPosition, setCameraPosition] = useState({ x: 5, y: 5, z: 5 });
  const [showWireframe, setShowWireframe] = useState(false);
  const [renderQuality, setRenderQuality] = useState('high');
  const [isRendering, setIsRendering] = useState(false);

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(renderQuality === 'high' ? window.devicePixelRatio : 1);
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, directionalLightIntensity);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Grid
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
      scene.add(gridHelper);
    }

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Mouse events for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshObjects = scene.children.filter(obj => obj.type === 'Mesh' && obj.userData.selectable);
      const intersects = raycaster.intersectObjects(meshObjects);

      if (intersects.length > 0) {
        const newlySelected = intersects[0].object;

        // If an object was previously selected, restore its material
        if (selectedObjectRef.current && selectedObjectRef.current.userData.originalMaterial) {
          selectedObjectRef.current.material = selectedObjectRef.current.userData.originalMaterial;
          delete selectedObjectRef.current.userData.originalMaterial; // Clean up
        }

        // Select the new object
        setSelectedObject(newlySelected.userData.id);
        selectedObjectRef.current = newlySelected;
        
        // Highlight the newly selected object
        // Store a clone of the original material *before* applying highlight
        newlySelected.userData.originalMaterial = newlySelected.material.clone();
        
        const highlightMaterial = newlySelected.material.clone();
        highlightMaterial.emissive.setHex(0x333333); // A subtle highlight
        newlySelected.material = highlightMaterial;

      } else { // Clicked on empty space
        if (selectedObjectRef.current && selectedObjectRef.current.userData.originalMaterial) {
          // Restore material of the previously selected object
          selectedObjectRef.current.material = selectedObjectRef.current.userData.originalMaterial;
          delete selectedObjectRef.current.userData.originalMaterial; // Clean up
        }
        setSelectedObject(null);
        selectedObjectRef.current = null;
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.domElement.removeEventListener('click', onMouseClick);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [backgroundColor, ambientLightIntensity, directionalLightIntensity, cameraPosition, showGrid, renderQuality]);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addPrimitive = (type) => {
    if (!sceneRef.current) return;

    let geometry;
    const material = new THREE.MeshPhongMaterial({ 
      color: Math.random() * 0xffffff,
      wireframe: showWireframe
    });

    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 4,
      Math.random() * 2,
      (Math.random() - 0.5) * 4
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    const id = `${type}_${Date.now()}`;
    mesh.userData = { 
      id, 
      type, 
      selectable: true,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${objects.length + 1}`
    };

    sceneRef.current.add(mesh);
    
    setObjects(prev => [...prev, {
      id,
      type,
      name: mesh.userData.name,
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      scale: mesh.scale.clone(),
      visible: true
    }]);

    toast.success(`Added ${type} to scene`);
  };

  const deleteSelectedObject = () => {
    if (!selectedObjectRef.current || !sceneRef.current) return;

    // Restore original material if it was highlighted
    if (selectedObjectRef.current.userData.originalMaterial) {
      selectedObjectRef.current.material = selectedObjectRef.current.userData.originalMaterial;
      delete selectedObjectRef.current.userData.originalMaterial;
    }

    sceneRef.current.remove(selectedObjectRef.current);
    const objectId = selectedObjectRef.current.userData.id;
    
    setObjects(prev => prev.filter(obj => obj.id !== objectId));
    setSelectedObject(null);
    selectedObjectRef.current = null;
    
    toast.success('Object deleted');
  };

  const duplicateSelectedObject = () => {
    if (!selectedObjectRef.current || !sceneRef.current) return;

    const original = selectedObjectRef.current;
    
    // Ensure we duplicate the actual material, not the highlight one
    const materialToClone = original.userData.originalMaterial || original.material;

    const clonedGeometry = original.geometry.clone();
    const clonedMaterial = materialToClone.clone(); // Clone the actual material
    const clonedMesh = new THREE.Mesh(clonedGeometry, clonedMaterial);

    clonedMesh.position.copy(original.position);
    clonedMesh.position.x += 1; // Offset duplicated object
    clonedMesh.rotation.copy(original.rotation);
    clonedMesh.scale.copy(original.scale);
    clonedMesh.castShadow = true;
    clonedMesh.receiveShadow = true;

    const id = `${original.userData.type}_${Date.now()}`;
    clonedMesh.userData = { 
      id, 
      type: original.userData.type, 
      selectable: true,
      name: `${original.userData.name} Copy`
    };

    sceneRef.current.add(clonedMesh);
    
    setObjects(prev => [...prev, {
      id,
      type: original.userData.type,
      name: clonedMesh.userData.name,
      position: clonedMesh.position.clone(),
      rotation: clonedMesh.rotation.clone(),
      scale: clonedMesh.scale.clone(),
      visible: true
    }]);

    toast.success('Object duplicated');
  };

  const toggleObjectVisibility = (objectId) => {
    if (!sceneRef.current) return;

    const mesh = sceneRef.current.children.find(obj => obj.userData.id === objectId);
    if (mesh) {
      mesh.visible = !mesh.visible;
      setObjects(prev => 
        prev.map(obj => 
          obj.id === objectId ? { ...obj, visible: mesh.visible } : obj
        )
      );
    }
  };

  const exportScene = async () => {
    if (!rendererRef.current) return;

    try {
      setIsRendering(true);
      
      // Render at high quality
      const originalPixelRatio = rendererRef.current.getPixelRatio();
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio * 2, 4)); // Render at 2x or 4x device pixel ratio for higher quality
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Get image data
      const canvas = rendererRef.current.domElement;
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `3d-design-${Date.now()}.png`;
          document.body.appendChild(a); // Append to body to make it clickable
          a.click();
          document.body.removeChild(a); // Clean up
          URL.revokeObjectURL(url);
          
          toast.success('Scene exported successfully!');
        } else {
          toast.error('Failed to create image blob.');
        }
      }, 'image/png');
      
      // Restore original pixel ratio
      rendererRef.current.setPixelRatio(originalPixelRatio);
    } catch (error) {
      console.error('Failed to export scene:', error);
      toast.error('Failed to export scene');
    } finally {
      setIsRendering(false);
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(5, 5, 5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      setCameraPosition({ x: 5, y: 5, z: 5 });
    }
  };

  return (
    <div className="w-full h-full flex overflow-hidden">
      {/* Left Sidebar - Tools */}
      <div className="w-80 bg-card border-r border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cuboid className="w-5 h-5 text-primary" />
            3D Design Studio
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Professional 3D modeling and rendering
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Primitives */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add Primitives</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPrimitive('cube')}
                className="flex flex-col gap-1 h-16"
              >
                <Cuboid className="w-4 h-4" />
                Cube
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPrimitive('sphere')}
                className="flex flex-col gap-1 h-16"
              >
                <Circle className="w-4 h-4" /> {/* Changed icon to Circle */}
                Sphere
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPrimitive('cylinder')}
                className="flex flex-col gap-1 h-16"
              >
                <Cylinder className="w-4 h-4" />
                Cylinder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPrimitive('cone')}
                className="flex flex-col gap-1 h-16"
              >
                <Pyramid className="w-4 h-4" />
                Cone
              </Button>
            </CardContent>
          </Card>

          {/* Scene Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Scene Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedObject}
                  disabled={!selectedObject}
                  className="flex-1"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={duplicateSelectedObject}
                  disabled={!selectedObject}
                  className="flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Duplicate
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="grid"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="grid" className="text-sm">Show Grid</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wireframe"
                  checked={showWireframe}
                  onChange={(e) => setShowWireframe(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="wireframe" className="text-sm">Wireframe Mode</Label>
              </div>
            </CardContent>
          </Card>

          {/* Lighting */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Lighting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Ambient Light</Label>
                <Slider
                  value={[ambientLightIntensity]}
                  onValueChange={([value]) => setAmbientLightIntensity(value)}
                  max={2}
                  min={0}
                  step={0.1}
                  className="mt-1"
                />
                <span className="text-xs text-muted-foreground">{ambientLightIntensity.toFixed(1)}</span>
              </div>
              
              <div>
                <Label className="text-xs">Directional Light</Label>
                <Slider
                  value={[directionalLightIntensity]}
                  onValueChange={([value]) => setDirectionalLightIntensity(value)}
                  max={3}
                  min={0}
                  step={0.1}
                  className="mt-1"
                />
                <span className="text-xs text-muted-foreground">{directionalLightIntensity.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Camera */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetCamera}
                className="w-full"
              >
                Reset Position
              </Button>
              
              <div>
                <Label className="text-xs">Render Quality</Label>
                <Select value={renderQuality} onValueChange={setRenderQuality}>
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Export */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Export</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={exportScene}
                disabled={isRendering}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                {isRendering ? 'Exporting...' : 'Export PNG'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Objects: {objects.length}
            </Badge>
            {selectedObject && (
              <Badge variant="outline" className="text-xs">
                Selected: {objects.find(obj => obj.id === selectedObject)?.name}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-2" />
            <Button variant="ghost" size="sm">
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 bg-background relative overflow-hidden">
          <div
            ref={mountRef}
            className="w-full h-full"
            style={{ background: backgroundColor }}
          />
          
          {/* Viewport Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2">
              <div className="text-xs text-muted-foreground mb-1">View Controls</div>
              <div className="text-xs space-y-1">
                <div>Left Click: Rotate</div>
                <div>Right Click: Pan</div>
                <div>Scroll: Zoom</div>
                <div>Click Object: Select</div>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isRendering && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-card rounded-lg p-4 flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Rendering...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Object Properties */}
      <div className="w-64 bg-card border-l border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Scene Objects
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {objects.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No objects in scene.
              Add some primitives to get started!
            </div>
          ) : (
            <div className="space-y-1">
              {objects.map((obj) => (
                <div
                  key={obj.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
                    selectedObject === obj.id 
                      ? 'bg-primary/20 text-primary' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => {
                    const mesh = sceneRef.current?.children.find(child => child.userData.id === obj.id);
                    if (mesh) {
                      // Simulate a click event for selection logic if it's not already selected
                      // Or directly update selection state and highlight if needed
                      if (selectedObjectRef.current && selectedObjectRef.current.userData.originalMaterial) {
                        selectedObjectRef.current.material = selectedObjectRef.current.userData.originalMaterial;
                        delete selectedObjectRef.current.userData.originalMaterial;
                      }

                      setSelectedObject(obj.id);
                      selectedObjectRef.current = mesh;

                      // Apply highlight to the newly selected object
                      if (mesh.userData.originalMaterial === undefined) { // Only store if not already highlighted
                         mesh.userData.originalMaterial = mesh.material.clone();
                      }
                      const highlightMaterial = mesh.material.clone();
                      highlightMaterial.emissive.setHex(0x333333);
                      mesh.material = highlightMaterial;
                    }
                  }}
                >
                  <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                    {obj.type === 'cube' && <Cuboid className="w-3 h-3" />}
                    {obj.type === 'sphere' && <Circle className="w-3 h-3" />} {/* Changed icon to Circle */}
                    {obj.type === 'cylinder' && <Cylinder className="w-3 h-3" />}
                    {obj.type === 'cone' && <Pyramid className="w-3 h-3" />}
                  </div>
                  <span className="flex-1 truncate">{obj.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleObjectVisibility(obj.id);
                    }}
                  >
                    {obj.visible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedObject && (
          <div className="p-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">Object Properties</h4>
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={objects.find(obj => obj.id === selectedObject)?.name || ''}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setObjects(prev => 
                      prev.map(obj => 
                        obj.id === selectedObject ? { ...obj, name: newName } : obj
                      )
                    );
                    if (selectedObjectRef.current) {
                      selectedObjectRef.current.userData.name = newName;
                    }
                  }}
                  className="h-7 mt-1"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedObjectRef.current?.position.x.toFixed(2) || '0'}
                    onChange={(e) => {
                      if (selectedObjectRef.current) {
                        selectedObjectRef.current.position.x = parseFloat(e.target.value) || 0;
                        // Force update objects state to reflect position change in UI
                        setObjects(prev => prev.map(obj => 
                          obj.id === selectedObject ? { ...obj, position: selectedObjectRef.current.position.clone() } : obj
                        ));
                      }
                    }}
                    className="h-6 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedObjectRef.current?.position.y.toFixed(2) || '0'}
                    onChange={(e) => {
                      if (selectedObjectRef.current) {
                        selectedObjectRef.current.position.y = parseFloat(e.target.value) || 0;
                        setObjects(prev => prev.map(obj => 
                          obj.id === selectedObject ? { ...obj, position: selectedObjectRef.current.position.clone() } : obj
                        ));
                      }
                    }}
                    className="h-6 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Z</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedObjectRef.current?.position.z.toFixed(2) || '0'}
                    onChange={(e) => {
                      if (selectedObjectRef.current) {
                        selectedObjectRef.current.position.z = parseFloat(e.target.value) || 0;
                        setObjects(prev => prev.map(obj => 
                          obj.id === selectedObject ? { ...obj, position: selectedObjectRef.current.position.clone() } : obj
                        ));
                      }
                    }}
                    className="h-6 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
