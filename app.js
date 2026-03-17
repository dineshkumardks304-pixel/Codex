const userImageInput = document.getElementById('userImageInput');
const clothImageInput = document.getElementById('clothImageInput');
const scaleInput = document.getElementById('scale');
const opacityInput = document.getElementById('opacity');
const rotationInput = document.getElementById('rotation');
const centerBtn = document.getElementById('centerBtn');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('tryOnCanvas');
const ctx = canvas.getContext('2d');

const state = {
  userImage: null,
  clothImage: null,
  clothX: canvas.width / 2,
  clothY: canvas.height / 2,
  clothScale: 1,
  clothOpacity: 0.9,
  clothRotation: 0,
  isDragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
};

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function updateImage(event, key) {
  const [file] = event.target.files;
  if (!file) return;

  const image = await readImage(file);
  state[key] = image;

  if (key === 'clothImage') {
    state.clothX = canvas.width / 2;
    state.clothY = canvas.height * 0.52;
  }

  draw();
}

function drawBackgroundGrid() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawUserImage() {
  if (!state.userImage) return;

  const img = state.userImage;
  const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
  const drawWidth = img.width * ratio;
  const drawHeight = img.height * ratio;
  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;

  ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

function drawClothImage() {
  if (!state.clothImage) return;

  const img = state.clothImage;
  const baseWidth = canvas.width * 0.45;
  const ratio = img.height / img.width;
  const drawWidth = baseWidth * state.clothScale;
  const drawHeight = drawWidth * ratio;

  ctx.save();
  ctx.globalAlpha = state.clothOpacity;
  ctx.translate(state.clothX, state.clothY);
  ctx.rotate(state.clothRotation);
  ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

function drawPlaceholders() {
  if (state.userImage) return;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 38px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Upload your photo to start', canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = '24px Inter, sans-serif';
  ctx.fillText('Then upload a cloth image and drag to adjust', canvas.width / 2, canvas.height / 2 + 26);
}

function draw() {
  drawBackgroundGrid();
  drawUserImage();
  drawClothImage();
  drawPlaceholders();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function startDrag(event) {
  if (!state.clothImage) return;

  const point = canvasPoint(event);
  state.isDragging = true;
  state.dragOffsetX = point.x - state.clothX;
  state.dragOffsetY = point.y - state.clothY;
  canvas.classList.add('dragging');
}

function drag(event) {
  if (!state.isDragging) return;
  const point = canvasPoint(event);
  state.clothX = point.x - state.dragOffsetX;
  state.clothY = point.y - state.dragOffsetY;
  draw();
}

function endDrag() {
  state.isDragging = false;
  canvas.classList.remove('dragging');
}

userImageInput.addEventListener('change', (event) => updateImage(event, 'userImage'));
clothImageInput.addEventListener('change', (event) => updateImage(event, 'clothImage'));

scaleInput.addEventListener('input', () => {
  state.clothScale = Number(scaleInput.value) / 100;
  draw();
});

opacityInput.addEventListener('input', () => {
  state.clothOpacity = Number(opacityInput.value) / 100;
  draw();
});

rotationInput.addEventListener('input', () => {
  state.clothRotation = (Number(rotationInput.value) * Math.PI) / 180;
  draw();
});

centerBtn.addEventListener('click', () => {
  state.clothX = canvas.width / 2;
  state.clothY = canvas.height * 0.52;
  draw();
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'virtual-try-on.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', drag);
window.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseleave', endDrag);

draw();
