import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function CheckersBoard3D({ 
  position, 
  onSquareClick, 
  selectedSquare, 
  validMoves,
  lastMove,
  colorScheme = 'classic',
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
    classic: { light: 0xF0D9B5, dark: 0xB58863, red: 0xCC0000, black: 0x333333 },
    modern: { light: 0xE8EAF6, dark: 0x5C6BC0, red: 0xFF1744, black: 0x1A237E },
    neon: { light: 0x00FF88, dark: 0x00AAFF, red: 0xFF006E, black: 0x00FFF5 },
    wood: { light: 0xDEB887, dark: 0x8B4513, red: 0x8B0000, black: 0x2F1B0C }
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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
    updatePieces(sceneRef.current, position, colors);
  }, [position, colors]);

  const createBoard = (scene, colors, materialProps) => {
    const boardGroup = new THREE.Group();
    
    // Base
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

    // Squares
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const isDark = (row + col) % 2 === 1;
        const geometry = new THREE.BoxGeometry(SQUARE_SIZE - 0.02, 0.1, SQUARE_SIZE - 0.02);
        const material = new THREE.MeshStandardMaterial({
          color: isDark ? colors.dark : colors.light,
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

        // Highlight valid moves
        if (validMoves && validMoves.includes(square.userData.square)) {
          const highlightGeometry = new THREE.RingGeometry(0.2, 0.3, 32);
          const highlightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.6 
          });
          const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
          highlight.rotation.x = -Math.PI / 2;
          highlight.position.set(square.position.x, 0.11, square.position.z);
          boardGroup.add(highlight);
        }

        // Highlight selected square
        if (selectedSquare === square.userData.square) {
          const selectGeometry = new THREE.BoxGeometry(SQUARE_SIZE - 0.05, 0.12, SQUARE_SIZE - 0.05);
          const selectMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.4 
          });
          const selectHighlight = new THREE.Mesh(selectGeometry, selectMaterial);
          selectHighlight.position.set(square.position.x, 0.11, square.position.z);
          boardGroup.add(selectHighlight);
        }

        // Highlight last move
        if (lastMove && (lastMove.from === square.userData.square || lastMove.to === square.userData.square)) {
          const lastMoveGeometry = new THREE.BoxGeometry(SQUARE_SIZE - 0.05, 0.12, SQUARE_SIZE - 0.05);
          const lastMoveMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00aaff, 
            transparent: true, 
            opacity: 0.3 
          });
          const lastMoveHighlight = new THREE.Mesh(lastMoveGeometry, lastMoveMaterial);
          lastMoveHighlight.position.set(square.position.x, 0.11, square.position.z);
          boardGroup.add(lastMoveHighlight);
        }
      }
    }

    scene.add(boardGroup);
    boardRef.current = boardGroup;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      if (animating) return;
      
      const tapDuration = Date.now() - touchStartTimeRef.current;
      if (tapDuration > 300) return;
      
      const touch = event.touches ? event.touches[0] : event;
      if (!mountRef.current) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(boardGroup.children);

      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        if (clicked.userData.square) {
          onSquareClick(clicked.userData.square);
        }
      }
    };

    mountRef.current?.addEventListener('click', onClick);
    mountRef.current?.addEventListener('touchend', onClick);
  };

  const createPiece = (color, isKing, colors) => {
    const group = new THREE.Group();
    const pieceColor = color === 'red' ? colors.red : colors.black;

    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: pieceColor,
      metalness: 0.4,
      roughness: 0.6
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    group.add(base);

    if (isKing) {
      // Crown for king
      const crownGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 32);
      const crown = new THREE.Mesh(crownGeometry, baseMaterial);
      crown.position.y = 0.125;
      crown.castShadow = true;
      group.add(crown);

      // Crown top
      const topGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const top = new THREE.Mesh(topGeometry, new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        metalness: 0.8,
        roughness: 0.2
      }));
      top.position.y = 0.25;
      top.castShadow = true;
      group.add(top);
    }

    return group;
  };

  const updatePieces = (scene, position, colors) => {
    Object.values(piecesRef.current).forEach(piece => scene.remove(piece));
    piecesRef.current = {};

    Object.entries(position).forEach(([square, piece]) => {
      if (piece) {
        const col = square.charCodeAt(0) - 97;
        const row = 8 - parseInt(square[1]);
        const isKing = piece.includes('King');
        const color = isKing ? piece.replace('King', '') : piece;
        
        const pieceMesh = createPiece(color, isKing, colors);
        pieceMesh.position.set(
          (col - 3.5) * SQUARE_SIZE,
          0.15,
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
        minHeight: '400px',
        height: '100%',
        touchAction: 'none',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab' 
      }}
    />
  );
}