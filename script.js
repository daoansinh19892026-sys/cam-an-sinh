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
    // Adjusted for smaller objects (diameter 2.5-3.5 mm, ~10-15px depending on resolution)
    cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, 15, 50, 20, 5, 15);

    let count = circles.cols;
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
        let area = cv.contourArea(contours.get(i));
        if (area > 20 && area < 200) { // Adjusted for smaller objects
            count += Math.floor(area / 60); // Approx area of one grain (π*(1.25-1.75)^2)
        }
    }

    let color = new cv.Scalar(255, 0, 0, 255);
    for (let i = 0; i < circles.cols; ++i) {
        let x = circles.data32F[i * 3];
        let y = circles.data32F[i * 3 + 1];
        let radius = circles.data32F[i * 3 + 2];
        let center = new cv.Point(x, y);
        cv.circle(src, center, radius, color, 2);
    }
    cv.imshow('canvasOutput', src);

    src.delete(); gray.delete(); circles.delete();
    contours.delete(); hierarchy.delete();
    return count;
}

// Update processVideo to reflect real-time changes
function processVideo() {
    if (!streaming) return;
    const count = detectCircles();
    currentCount = count;
    const lost = Math.max(0, totalCount - currentCount);
    const lostDiv4 = lost % 4;

    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('lost-count').textContent = lost;
    document.getElementById('divide-result').textContent = lostDiv4;

    setTimeout(processVideo, 500); // Update every 0.5 seconds
}