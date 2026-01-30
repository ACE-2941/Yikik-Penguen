const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");

canvas.width = 360;
canvas.height = 640;

let score = 0;
let gameActive = true;
const penguinImg = new Image();
penguinImg.src = "assets/penguin.png";

const penguin = {
    x: 148,
    y: 540,
    w: 64, h: 64, // Senin resminin kare boyutu
    frameX: 0, 
    frameY: 0, // 0:Yürüme, 1:Tekil, 2:Zıplama, 3:Aksesuarlı
    maxFrames: 5, // İlk satırda 5 penguen var
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
        penguin.frameY = 2; // Resmindeki 3. satıra (zıplama) geç
        penguin.maxFrames = 2; // O satırda sadece 2 kare var
    }
}

function update() {
    if (!gameActive) return;

    // Hareket ve Yerçekimi
    penguin.x += moveDir * 8;
    penguin.y += penguin.velocityY;
    penguin.velocityY += penguin.gravity;

    // Zemin Kontrolü
    if (penguin.y > 540) {
        penguin.y = 540;
        penguin.isJumping = false;
        penguin.velocityY = 0;
        penguin.frameY = 0; // Yürümeye geri dön
        penguin.maxFrames = 5;
    }

    // Ekran Sınırı
    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w) penguin.x = canvas.width - penguin.w;

    // Engeller
    if (++timer > 50) {
        obstacles.push({ x: Math.random() * 320, y: -40, s: 40 + Math.random() * 20 });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += 6 + (score / 10);
        if (o.y > canvas.height) { obstacles.splice(i, 1); score++; scoreBoard.innerText = "SKOR: " + score; }
        
        // Hassas Çarpışma
        if (penguin.x + 15 < o.x + o.s && penguin.x + 45 > o.x && 
            penguin.y + 10 < o.y + o.s && penguin.y + 55 > o.y) {
            gameActive = false;
            alert("EYVAH! SKORUN: " + score);
            location.reload();
        }
    });

    // Animasyon hızı
    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) {
        penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (penguinImg.complete) {
        // Resmindeki 64x64'lük kareleri milimetrik keser
        ctx.drawImage(
            penguinImg,
            penguin.frameX * 64, penguin.frameY * 40, // X ve Y koordinatları (Resmine özel Y-offset 40)
            64, 40, // Kaynak boyut (Resmindeki penguenlerin boyu yaklaşık 40px)
            penguin.x, penguin.y, 
            64, 64 // Ekranda çizim boyutu
        );
    }
let score = 0;
const scoreBoard = document.getElementById("scoreBoard");

function update() {
    if (!gameActive) return;

    // ... (Penguen hareket kodları)

    // Engelleri Güncelleme ve Puan Artışı
    obstacles.forEach((o, i) => {
        o.y += 6 + (score / 15); // Oyun zorlaştıkça hız biraz artar

        // ENGEL GEÇİLDİ Mİ?
        if (o.y > canvas.height) {
            obstacles.splice(i, 1); // Engeli listeden sil
            score++; // PUANI ARTIR
            scoreBoard.innerText = "SKOR: " + score; // EKRANA YAZ
        }

        // Çarpışma Kontrolü
        if (penguin.x + 20 < o.x + o.s && penguin.x + 44 > o.x && 
            penguin.y + 20 < o.y + o.s && penguin.y + 60 > o.y) {
            gameActive = false;
            alert("OYUN BİTTİ! TOPLAM SKORUN: " + score);
            location.reload();
        }
    });
    // Engeller (Koyu Kırmızı)
    ctx.fillStyle = "#800000";
    obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y, o.s, o.s);
        ctx.strokeStyle = "white";
        ctx.strokeRect(o.x, o.y, o.s, o.s);
    });
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

penguinImg.onload = gameLoop;
