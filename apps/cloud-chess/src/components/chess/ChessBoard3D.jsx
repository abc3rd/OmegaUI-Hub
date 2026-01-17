import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ChessBoard3D({ 
  position, 
  onSquareClick, 
  selectedSquare, 
  validMoves,
  lastMove,
  colorScheme = 'classic',
  pieceStyle = 'standard',
  boardMaterial = 'wood',
  animating 
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const piecesRef = useRef({});
  const boardRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousTouchRef = useRef({ x: 0, y: 0 });
  const touchStartTimeRef = useRef(0);

  const SQUARE_SIZE = 1;
  const BOARD_SIZE = 8;

  const COLOR_SCHEMES = {
    classic: { light: 0xF0D9B5, dark: 0xB58863, white: 0xFFFFFF, black: 0x333333 },
    modern: { light: 0xE8EAF6, dark: 0x5C6BC0, white: 0xFFFFFF, black: 0x1A237E },
    neon: { light: 0x00FF88, dark: 0x00AAFF, white: 0x00FFF5, black: 0xFF006E },
    wood: { light: 0xDEB887, dark: 0x8B4513, white: 0xFFFAF0, black: 0x2F1B0C },
    marble: { light: 0xF5F5F5, dark: 0x708090, white: 0xFFFFFF, black: 0x2F4F4F },
    ocean: { light: 0xB0E0E6, dark: 0x4682B4, white: 0xF0F8FF, black: 0x191970 },
    forest: { light: 0x90EE90, dark: 0x228B22, white: 0xF5F5DC, black: 0x2F4F2F },
    sunset: { light: 0xFFDAB9, dark: 0xFF6347, white: 0xFFF8DC, black: 0x8B0000 }
  };

  const MATERIAL_EFFECTS = {
    wood: { metalness: 0.1, roughness: 0.9 },
    marble: { metalness: 0.3, roughness: 0.4 },
    glass: { metalness: 0.9, roughness: 0.1 },
    metal: { metalness: 0.8, roughness: 0.2 }
  };

  const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.classic;
  const materialProps = MATERIAL_EFFECTS[boardMaterial] || MATERIAL_EFFECTS.wood;

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    createBoard(scene, colors, materialProps);

    // Touch and Mouse controls
    const handleStart = (e) => {
      isDraggingRef.current = true;
      touchStartTimeRef.current = Date.now();
      const touch = e.touches ? e.touches[0] : e;
      previousTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleMove = (e) => {
      if (!isDraggingRef.current || !cameraRef.current) return;
      
      const touch = e.touches ? e.touches[0] : e;
      const deltaX = touch.clientX - previousTouchRef.current.x;
      const deltaY = touch.clientY - previousTouchRef.current.y;

      const rotationSpeed = 0.005;
      const radius = Math.sqrt(
        Math.pow(cameraRef.current.position.x, 2) + 
        Math.pow(cameraRef.current.position.z, 2)
      );

      const angle = Math.atan2(cameraRef.current.position.z, cameraRef.current.position.x);
      const newAngle = angle - deltaX * rotationSpeed;

      cameraRef.current.position.x = radius * Math.cos(newAngle);
      cameraRef.current.position.z = radius * Math.sin(newAngle);
      cameraRef.current.position.y = Math.max(5, cameraRef.current.position.y - deltaY * 0.05);

      cameraRef.current.lookAt(0, 0, 0);
      previousTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (cameraRef.current) {
        const zoomSpeed = 0.001;
        const distance = Math.sqrt(
          Math.pow(cameraRef.current.position.x, 2) + 
          Math.pow(cameraRef.current.position.y, 2) + 
          Math.pow(cameraRef.current.position.z, 2)
        );
        
        const newDistance = Math.max(8, Math.min(20, distance + e.deltaY * zoomSpeed * distance));
        const ratio = newDistance / distance;
        
        cameraRef.current.position.multiplyScalar(ratio);
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart, { passive: true });
    canvas.addEventListener('touchmove', handleMove, { passive: true });
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
      canvas.removeEventListener('wheel', handleWheel);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [colorScheme, boardMaterial]);

  useEffect(() => {
    if (!sceneRef.current) return;
    updatePieces(sceneRef.current, position, colors, pieceStyle);
  }, [position, colors, pieceStyle]);

  const createBoard = (scene, colors, materialProps) => {
    const boardGroup = new THREE.Group();
    
    const baseGeometry = new THREE.BoxGeometry(BOARD_SIZE * SQUARE_SIZE + 0.5, 0.3, BOARD_SIZE * SQUARE_SIZE + 0.5);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a, 
      metalness: materialProps.metalness, 
      roughness: materialProps.roughness 
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.2;
    base.receiveShadow = true;
    boardGroup.add(base);

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const isLight = (row + col) % 2 === 0;
        const geometry = new THREE.BoxGeometry(SQUARE_SIZE - 0.02, 0.1, SQUARE_SIZE - 0.02);
        const material = new THREE.MeshStandardMaterial({
          color: isLight ? colors.light : colors.dark,
          metalness: materialProps.metalness,
          roughness: materialProps.roughness
        });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(
          (col - 3.5) * SQUARE_SIZE,
          0,
          (row - 3.5) * SQUARE_SIZE
        );
        square.receiveShadow = true;
        square.userData = { row, col, square: `${String.fromCharCode(97 + col)}${8 - row}` };
        boardGroup.add(square);
      }
    }

    scene.add(boardGroup);
    boardRef.current = boardGroup;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleBoardClick = (event) => {
      if (animating) return;
      
      // Check if it was a quick tap (not a drag)
      const tapDuration = Date.now() - touchStartTimeRef.current;
      if (isDraggingRef.current && tapDuration > 200) return;
      
      const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
      const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
      
      if (!mountRef.current || !cameraRef.current || !clientX || !clientY) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(boardGroup.children, true);

      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        if (clicked.userData && clicked.userData.square) {
          onSquareClick(clicked.userData.square);
        }
      }
    };

    rendererRef.current.domElement.addEventListener('click', handleBoardClick);
    rendererRef.current.domElement.addEventListener('touchend', handleBoardClick);
    
    return () => {
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener('click', handleBoardClick);
        rendererRef.current.domElement.removeEventListener('touchend', handleBoardClick);
      }
    };
  };

  const createPiece = (type, color, colors, style) => {
    const group = new THREE.Group();
    const isWhite = color === 'w';
    const pieceColor = isWhite ? colors.white : colors.black;

    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: pieceColor, 
      metalness: style === 'metallic' ? 0.8 : 0.4, 
      roughness: style === 'glossy' ? 0.2 : 0.6 
    });

    // Base
    const baseSize = style === 'modern' ? 0.22 : 0.25;
    const baseGeometry = new THREE.CylinderGeometry(baseSize, 0.3, 0.1, 16);
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    group.add(base);

    // Body based on piece type
    let bodyGeometry;
    const heightMultiplier = style === 'tall' ? 1.3 : 1;
    
    switch (type) {
      case 'P':
        bodyGeometry = style === 'modern' 
          ? new THREE.ConeGeometry(0.18, 0.5 * heightMultiplier, 8)
          : new THREE.SphereGeometry(0.2, 16, 16);
        break;
      case 'N':
        bodyGeometry = style === 'modern'
          ? new THREE.BoxGeometry(0.3, 0.6 * heightMultiplier, 0.2)
          : new THREE.ConeGeometry(0.25, 0.6 * heightMultiplier, 4);
        break;
      case 'B':
        bodyGeometry = new THREE.ConeGeometry(0.2, 0.7 * heightMultiplier, style === 'modern' ? 6 : 16);
        break;
      case 'R':
        bodyGeometry = style === 'modern'
          ? new THREE.CylinderGeometry(0.25, 0.25, 0.6 * heightMultiplier, 4)
          : new THREE.BoxGeometry(0.4, 0.6 * heightMultiplier, 0.4);
        break;
      case 'Q':
        bodyGeometry = new THREE.ConeGeometry(0.25, 0.8 * heightMultiplier, style === 'modern' ? 6 : 8);
        break;
      case 'K':
        bodyGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.8 * heightMultiplier, style === 'modern' ? 6 : 16);
        break;
      default:
        bodyGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    }

    const body = new THREE.Mesh(bodyGeometry, baseMaterial);
    body.position.y = 0.4 * heightMultiplier;
    body.castShadow = true;
    group.add(body);

    // Top decorations
    if (type === 'K') {
      const crossGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
      const cross = new THREE.Mesh(crossGeometry, baseMaterial);
      cross.position.y = 0.95 * heightMultiplier;
      cross.castShadow = true;
      group.add(cross);
    } else if (type === 'Q') {
      const spikeCount = style === 'modern' ? 4 : 8;
      for (let i = 0; i < spikeCount; i++) {
        const spike = new THREE.ConeGeometry(0.05, 0.2, 4);
        const spikeMesh = new THREE.Mesh(spike, baseMaterial);
        const angle = (i * Math.PI * 2) / spikeCount;
        spikeMesh.position.set(
          Math.cos(angle) * 0.15,
          0.9 * heightMultiplier,
          Math.sin(angle) * 0.15
        );
        spikeMesh.castShadow = true;
        group.add(spikeMesh);
      }
    }

    return group;
  };

  const updatePieces = (scene, position, colors, style) => {
    Object.values(piecesRef.current).forEach(piece => scene.remove(piece));
    piecesRef.current = {};

    Object.entries(position).forEach(([square, piece]) => {
      if (piece) {
        const col = square.charCodeAt(0) - 97;
        const row = 8 - parseInt(square[1]);
        const [color, type] = piece.split('');
        
        const pieceMesh = createPiece(type, color, colors, style);
        pieceMesh.position.set(
          (col - 3.5) * SQUARE_SIZE,
          0.05,
          (row - 3.5) * SQUARE_SIZE
        );
        
        scene.add(pieceMesh);
        piecesRef.current[square] = pieceMesh;
      }
    });
  };

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full rounded-xl overflow-hidden bg-slate-950"
      style={{ 
        minHeight: '500px',
        height: '100%',
        touchAction: 'none',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    />
  );
}