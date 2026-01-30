const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;
const penguinImg = new Image();
penguinImg.src = "assets/penguin.png";

const penguin = {
    x: 148,
    y: 540,
    w: 64, h: 64, 
    frameX: 0, 
    frameY: 0, 
    maxFrames: 5, 
    fps: 0,
    stagger: 8,
    velocityY: 0,
    gravity: 0.8,
    isJumping: false
};

let obstacles = [];
let timer = 0;
let moveDir = 0;

// Kontroller
window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
    if (e.key === " " || e.key === "ArrowUp") jump();
};
window.onkeyup = () => moveDir = 0;

// Mobil Dokunmatik
canvas.ontouchstart = (e) => {
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;
    if (ty < window.innerHeight / 2) jump();
    else moveDir = tx < window.innerWidth / 2 ? -1 : 1;
};
canvas.ontouchend = () => moveDir = 0;

function jump() {
    if (!penguin.isJumping) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 2; 
        penguin.maxFrames = 2; 
    }
}

function update() {
    if (!gameActive) return;

    penguin.x += moveDir * 8;
    penguin.y += penguin.velocityY;
    penguin.velocityY += penguin.gravity;

    if (penguin.y > 540) {
        penguin.y = 540;
        penguin.isJumping = false;
        penguin.velocityY = 0;
        penguin.frameY = 0; 
        penguin.maxFrames = 5;
    }

    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w) penguin.x = canvas.width - penguin.w;

    if (++timer > 55) {
        obstacles.push({ 
            x: Math.random() * (canvas.width - 40), 
            y: -40, 
            s: 40 + Math.random() * 20 
        });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += 6 + (puan / 20); 

        // Engel geçilince Puan Artışı
        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
        }
        
        // Çarpışma
        if (penguin.x + 15 < o.x + o.s && penguin.x + 45 > o.x && 
            penguin.y + 10 < o.y + o.s && penguin.y + 55 > o.y) {
            gameActive = false;
            alert("OYUN BİTTİ! PUANIN: " + puan);
            location.reload();
        }
    });

    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) {
        penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Penguen Çizimi
    if (penguinImg.complete) {
        ctx.drawImage(
            penguinImg,
            penguin.frameX * 64, penguin.frameY * 40, 
            64, 40, 
            penguin.x, penguin.y, 
            64, 64 
        );
    }

    // Engelleri Çiz
    ctx.fillStyle = "#800000";
    obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y, o.s, o.s);
        ctx.strokeStyle = "white";
        ctx.strokeRect(o.x, o.y, o.s, o.s);
    });

    // PUAN TABLOSU (Mavi ekranın sol üstüne çizer)
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText("PUAN: " + puan, 20, 40);
    ctx.shadowBlur = 0; // Diğer çizimleri etkilemesin
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

penguinImg.onload = gameLoop;
