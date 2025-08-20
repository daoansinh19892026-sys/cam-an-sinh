// File: script.js
let video;
let totalCount = 0;
let currentCount = 0;
let streaming = false;

function onOpenCvReady() {
    console.log('OpenCV.js is ready.');
    video = document.getElementById('videoInput');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            streaming = true;
            processVideo();
        })
        .catch(err => console.error('Error accessing camera:', err));
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin' && password === '0000') {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
    } else {
        alert('Invalid credentials');
    }
}

function logout() {
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function captureTotal() {
    const count = detectCircles();
    totalCount = count > 300 ? count : 0; // Assume >300 as valid
    document.getElementById('total-count').textContent = totalCount;
    calculateLost();
}

function captureCurrent() {
    const count = detectCircles();
    currentCount = count;
    calculateLost();
}

function calculateLost() {
    const lost = Math.max(0, totalCount - currentCount);
    document.getElementById('lost-count').textContent = lost;
}

function calculateDivide() {
    const result = totalCount / 4;
    document.getElementById('divide-result').textContent = result.toFixed(2);
}

function toggleFullscreen() {
    const video = document.getElementById('videoInput');
    const canvas = document.getElementById('canvasOutput');
    if (!document.fullscreenElement) {
        video.classList.add('fullscreen');
        canvas.classList.add('fullscreen');
        document.body.requestFullscreen();
    } else {
        video.classList.remove('fullscreen');
        canvas.classList.remove('fullscreen');
        document.exitFullscreen();
    }
}

function processVideo() {
    if (!streaming) return;
    setTimeout(processVideo, 100); // Adjust for FPS
}

function detectCircles() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let src = cv.imread(canvas);
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.medianBlur(gray, gray, 5);

    let circles = new cv.Mat();
    // Tuned for ~2.3cm diameter (~20-50px, adjust per device resolution)
    cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, 20, 50, 30, 10, 30);

    let count = circles.cols; // Basic count

    // Improve for occluded/stacked grains using contour analysis
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
        let area = cv.contourArea(contours.get(i));
        if (area > 100 && area < 5000) { // Filter small/large noise
            count += Math.floor(area / 314); // Approx area of one grain (pi*r^2, r~10px)
        }
    }

    // Draw circles on output
    let color = new cv.Scalar(255, 0, 0, 255);
    for (let i = 0; i < circles.cols; ++i) {
        let x = circles.data32F[i * 3];
        let y = circles.data32F[i * 3 + 1];
        let radius = circles.data32F[i * 3 + 2];
        let center = new cv.Point(x, y);
        cv.circle(src, center, radius, color, 3);
    }
    cv.imshow('canvasOutput', src);

    src.delete();
    gray.delete();
    circles.delete();
    contours.delete();
    hierarchy.delete();

    return count;
}