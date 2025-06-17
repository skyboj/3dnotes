// Инициализация Three.js
console.log('Initializing Three.js scene...');

// Constants
const ROOM_SIZE = 10;
const CORRIDOR_WIDTH = 4;
const LIVING_ROOM_SIZE = ROOM_SIZE * 2;
const WALL_HEIGHT = 4;
const WALL_THICKNESS = 0.2; // Add wall thickness
const PLAYER_HEIGHT = 1.2;
const PLAYER_SPEED = 0.1;
const JUMP_HEIGHT = 1;
const JUMP_SPEED = 0.1;
const CAMERA_FOV = 75;
const MIN_FOV = 60;
const MAX_FOV = 90;
const MOUSE_SENSITIVITY = 0.002;

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const container = document.getElementById('3d-scene-container');
console.log('Container:', container);

// Initialize renderer first to ensure proper size
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1a1a1a);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Add crosshair
const crosshair = document.createElement('div');
crosshair.style.position = 'absolute';
crosshair.style.left = '50%';
crosshair.style.top = '50%';
crosshair.style.transform = 'translate(-50%, -50%)';
crosshair.style.width = '20px';
crosshair.style.height = '20px';
crosshair.style.pointerEvents = 'none';
crosshair.innerHTML = '+';
crosshair.style.color = 'white';
crosshair.style.fontSize = '20px';
crosshair.style.textAlign = 'center';
crosshair.style.lineHeight = '20px';
container.appendChild(crosshair);

// Initialize camera with proper aspect ratio
const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
// Position camera inside the room, slightly offset from center
camera.position.set(0, PLAYER_HEIGHT, -ROOM_SIZE/2 + 2);
camera.lookAt(0, PLAYER_HEIGHT, -ROOM_SIZE/2 + 3);

// Create materials
const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.1
});

const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.1
});

const noteMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffff00,
    roughness: 0.5,
    metalness: 0.2
});

// Create edge material for walls
const edgeMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000,
    linewidth: 2
});

// Create geometries
const wallGeometry = new THREE.BoxGeometry(ROOM_SIZE, WALL_HEIGHT, WALL_THICKNESS);
const floorGeometry = new THREE.BoxGeometry(ROOM_SIZE, 0.1, ROOM_SIZE);
const noteGeometry = new THREE.PlaneGeometry(1, 1);

// Function to create edges for a box
function createEdges(geometry, material) {
    const edges = new THREE.EdgesGeometry(geometry);
    return new THREE.LineSegments(edges, edgeMaterial);
}

// Create rooms
function createRoom(x, z, rotation = 0) {
    const room = new THREE.Group();
    
    // Floor
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -WALL_HEIGHT/2;
    floor.receiveShadow = true;
    room.add(floor);
    
    // Walls
    const walls = [
        { pos: [0, 0, -ROOM_SIZE/2], rot: [0, 0, 0] },
        { pos: [0, 0, ROOM_SIZE/2], rot: [0, Math.PI, 0] },
        { pos: [-ROOM_SIZE/2, 0, 0], rot: [0, Math.PI/2, 0] },
        { pos: [ROOM_SIZE/2, 0, 0], rot: [0, -Math.PI/2, 0] }
    ];
    
    walls.forEach(({ pos, rot }) => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(...pos);
        wall.rotation.set(...rot);
        wall.castShadow = true;
        wall.receiveShadow = true;
        room.add(wall);
        
        // Add edges
        const edges = createEdges(wallGeometry);
        edges.position.set(...pos);
        edges.rotation.set(...rot);
        room.add(edges);
    });
    
    // Add sample notes
    const notePositions = [
        { pos: [-ROOM_SIZE/2 + 1, 0, -ROOM_SIZE/2 + 1], rot: [0, Math.PI/2, 0] },
        { pos: [ROOM_SIZE/2 - 1, 0, -ROOM_SIZE/2 + 1], rot: [0, -Math.PI/2, 0] },
        { pos: [-ROOM_SIZE/2 + 1, 0, ROOM_SIZE/2 - 1], rot: [0, Math.PI/2, 0] },
        { pos: [ROOM_SIZE/2 - 1, 0, ROOM_SIZE/2 - 1], rot: [0, -Math.PI/2, 0] }
    ];
    
    notePositions.forEach(({ pos, rot }) => {
        const note = new THREE.Mesh(noteGeometry, noteMaterial);
        note.position.set(...pos);
        note.rotation.set(...rot);
        note.castShadow = true;
        room.add(note);
    });
    
    room.position.set(x, 0, z);
    room.rotation.y = rotation;
    return room;
}

// Create corridor
function createCorridor(x, z, rotation = 0) {
    const corridor = new THREE.Group();
    
    // Floor
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(CORRIDOR_WIDTH, 0.1, ROOM_SIZE),
        floorMaterial
    );
    floor.position.y = -WALL_HEIGHT/2;
    floor.receiveShadow = true;
    corridor.add(floor);
    
    // Walls
    const walls = [
        { pos: [0, 0, -ROOM_SIZE/2], rot: [0, 0, 0] },
        { pos: [0, 0, ROOM_SIZE/2], rot: [0, Math.PI, 0] },
        { pos: [-CORRIDOR_WIDTH/2, 0, 0], rot: [0, Math.PI/2, 0] },
        { pos: [CORRIDOR_WIDTH/2, 0, 0], rot: [0, -Math.PI/2, 0] }
    ];
    
    walls.forEach(({ pos, rot }) => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(...pos);
        wall.rotation.set(...rot);
        wall.castShadow = true;
        wall.receiveShadow = true;
        corridor.add(wall);
    });
    
    corridor.position.set(x, 0, z);
    corridor.rotation.y = rotation;
    return corridor;
}

// Create living room
function createLivingRoom(x, z, rotation = 0) {
    const livingRoom = new THREE.Group();
    
    // Floor
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(LIVING_ROOM_SIZE, 0.1, LIVING_ROOM_SIZE),
        floorMaterial
    );
    floor.position.y = -WALL_HEIGHT/2;
    floor.receiveShadow = true;
    livingRoom.add(floor);
    
    // Walls
    const walls = [
        { pos: [0, 0, -LIVING_ROOM_SIZE/2], rot: [0, 0, 0] },
        { pos: [0, 0, LIVING_ROOM_SIZE/2], rot: [0, Math.PI, 0] },
        { pos: [-LIVING_ROOM_SIZE/2, 0, 0], rot: [0, Math.PI/2, 0] },
        { pos: [LIVING_ROOM_SIZE/2, 0, 0], rot: [0, -Math.PI/2, 0] }
    ];
    
    walls.forEach(({ pos, rot }) => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(...pos);
        wall.rotation.set(...rot);
        wall.castShadow = true;
        wall.receiveShadow = true;
        livingRoom.add(wall);
    });
    
    // Add more sample notes
    const notePositions = [
        { pos: [-LIVING_ROOM_SIZE/2 + 1, 0, -LIVING_ROOM_SIZE/2 + 1], rot: [0, Math.PI/2, 0] },
        { pos: [LIVING_ROOM_SIZE/2 - 1, 0, -LIVING_ROOM_SIZE/2 + 1], rot: [0, -Math.PI/2, 0] },
        { pos: [-LIVING_ROOM_SIZE/2 + 1, 0, LIVING_ROOM_SIZE/2 - 1], rot: [0, Math.PI/2, 0] },
        { pos: [LIVING_ROOM_SIZE/2 - 1, 0, LIVING_ROOM_SIZE/2 - 1], rot: [0, -Math.PI/2, 0] }
    ];
    
    notePositions.forEach(({ pos, rot }) => {
        const note = new THREE.Mesh(noteGeometry, noteMaterial);
        note.position.set(...pos);
        note.rotation.set(...rot);
        note.castShadow = true;
        livingRoom.add(note);
    });
    
    livingRoom.position.set(x, 0, z);
    livingRoom.rotation.y = rotation;
    return livingRoom;
}

// Add rooms to scene
const room1 = createRoom(-ROOM_SIZE - CORRIDOR_WIDTH/2, 0);
const room2 = createRoom(ROOM_SIZE + CORRIDOR_WIDTH/2, 0, Math.PI);
const corridor = createCorridor(0, 0);
const livingRoom = createLivingRoom(0, -ROOM_SIZE - CORRIDOR_WIDTH/2, Math.PI/2);

scene.add(room1);
scene.add(room2);
scene.add(corridor);
scene.add(livingRoom);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3); // Reduced directional light
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.bias = -0.001;
scene.add(directionalLight);

// Mouse look controls
let mouseX = 0;
let mouseY = 0;
let isPointerLocked = false;

// Handle pointer lock
container.addEventListener('click', () => {
    container.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === container;
});

document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
        mouseX -= event.movementX * MOUSE_SENSITIVITY;
        mouseY -= event.movementY * MOUSE_SENSITIVITY;
        
        // Limit vertical look angle
        mouseY = Math.max(-Math.PI/2, Math.min(Math.PI/2, mouseY));
    }
});

// Player movement variables
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false
};

let isJumping = false;
let jumpVelocity = 0;
let playerPosition = new THREE.Vector3(0, PLAYER_HEIGHT, 0);
let playerDirection = new THREE.Vector3(0, 0, -1);
let playerRotation = 0;

// Improved collision detection
function checkCollision(newPosition) {
    const margin = 0.5; // Safety margin from walls
    
    // Define room boundaries with proper margins
    const room1Bounds = {
        minX: -ROOM_SIZE - CORRIDOR_WIDTH/2 + margin,
        maxX: -CORRIDOR_WIDTH/2 - margin,
        minZ: -ROOM_SIZE/2 + margin,
        maxZ: ROOM_SIZE/2 - margin
    };
    
    const room2Bounds = {
        minX: CORRIDOR_WIDTH/2 + margin,
        maxX: ROOM_SIZE + CORRIDOR_WIDTH/2 - margin,
        minZ: -ROOM_SIZE/2 + margin,
        maxZ: ROOM_SIZE/2 - margin
    };
    
    const corridorBounds = {
        minX: -CORRIDOR_WIDTH/2 + margin,
        maxX: CORRIDOR_WIDTH/2 - margin,
        minZ: -ROOM_SIZE - CORRIDOR_WIDTH/2 + margin,
        maxZ: ROOM_SIZE + CORRIDOR_WIDTH/2 - margin
    };
    
    // Check if position is within any valid area
    const isInRoom1 = (
        newPosition.x >= room1Bounds.minX && 
        newPosition.x <= room1Bounds.maxX && 
        newPosition.z >= room1Bounds.minZ && 
        newPosition.z <= room1Bounds.maxZ
    );
    
    const isInRoom2 = (
        newPosition.x >= room2Bounds.minX && 
        newPosition.x <= room2Bounds.maxX && 
        newPosition.z >= room2Bounds.minZ && 
        newPosition.z <= room2Bounds.maxZ
    );
    
    const isInCorridor = (
        newPosition.x >= corridorBounds.minX && 
        newPosition.x <= corridorBounds.maxX && 
        newPosition.z >= corridorBounds.minZ && 
        newPosition.z <= corridorBounds.maxZ
    );
    
    // If position is not in any valid area, it's a collision
    return !(isInRoom1 || isInRoom2 || isInCorridor);
}

// Handle keyboard input
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

// Handle mouse wheel for FOV
window.addEventListener('wheel', (e) => {
    const newFOV = camera.fov + e.deltaY * 0.1;
    camera.fov = Math.max(MIN_FOV, Math.min(MAX_FOV, newFOV));
    camera.updateProjectionMatrix();
});

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log('Window resized:', width, height);
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Handle movement
    const moveDirection = new THREE.Vector3();
    
    if (keys.ArrowUp) {
        moveDirection.z = -1;
    }
    if (keys.ArrowDown) {
        moveDirection.z = 1;
    }
    if (keys.ArrowLeft) {
        moveDirection.x = -1;
    }
    if (keys.ArrowRight) {
        moveDirection.x = 1;
    }
    
    if (moveDirection.length() > 0) {
        moveDirection.normalize();
        
        // Apply rotation from mouse look
        const rotatedDirection = moveDirection.clone();
        rotatedDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseX);
        
        // Calculate new position
        const newPosition = playerPosition.clone().add(
            rotatedDirection.multiplyScalar(PLAYER_SPEED)
        );
        
        // Check collision before updating position
        if (!checkCollision(newPosition)) {
            playerPosition.copy(newPosition);
        }
    }
    
    // Handle jumping
    if (keys[' '] && !isJumping) {
        isJumping = true;
        jumpVelocity = JUMP_SPEED;
    }
    
    if (isJumping) {
        playerPosition.y += jumpVelocity;
        jumpVelocity -= 0.01; // gravity
        
        if (playerPosition.y <= PLAYER_HEIGHT) {
            playerPosition.y = PLAYER_HEIGHT;
            isJumping = false;
            jumpVelocity = 0;
        }
    }
    
    // Update camera position
    camera.position.copy(playerPosition);
    
    // Apply mouse look rotation using quaternions
    camera.quaternion.setFromEuler(new THREE.Euler(mouseY, mouseX, 0, 'YXZ'));
    
    renderer.render(scene, camera);
}

console.log('Starting animation loop...');
animate();

// Функция для создания текстуры с текстом
function createTextTexture(text, width = 512, height = 256) {
    // Создаем canvas для рендеринга текста
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // Настраиваем фон
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, width, height);

    // Настраиваем текст
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'left';
    context.textBaseline = 'top';

    // Разбиваем текст на строки и отрисовываем
    const words = text.split(' ');
    let line = '';
    let y = 20;
    const lineHeight = 30;
    const maxWidth = width - 40;

    words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = context.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
            context.fillText(line, 20, y);
            line = word + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    });
    context.fillText(line, 20, y);

    // Создаем текстуру из canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
}

// Функция для создания плоскости с текстом
function createTextPlane(text, width = 2, height = 1) {
    const texture = createTextTexture(text);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const geometry = new THREE.PlaneGeometry(width, height);
    const plane = new THREE.Mesh(geometry, material);
    
    return plane;
}

// Пример использования: создаем плоскость с текстом
const textPlane = createTextPlane('Это пример текста на 3D плоскости. Он будет отображаться с полупрозрачным фоном и белым текстом.');
textPlane.position.set(0, 0, -4.9); // Размещаем перед задней стеной
scene.add(textPlane); 