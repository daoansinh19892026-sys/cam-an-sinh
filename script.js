/ JS cho mô hình thấu kính và độ lệch
function calculateLens() {
    const hc = 3; // mm
    const a = 11.5; // mm
    const Rs = (a**2 + hc**2) / (2 * hc); // Bán kính cầu
    const Vcap = Math.PI * hc**2 * (Rs - hc / 3); // Thể tích một nắp
    const Vlens = 2 * Vcap; // Thể tích thấu kính
    const dMax = 11.5; // Độ lệch tối đa d <= R

    // Hiển thị kết quả (bao gồm nhiều vật thể nếu thêm)
    document.getElementById('result').innerHTML = `
        Thể tích thấu kính: ${Vlens.toFixed(2)} mm³ (≈ ${(Vlens / 1000).toFixed(3)} cm³)<br>
        Độ lệch tâm tối đa: ${dMax} mm<br>
        (Nguyên lý: d ≤ R cho hai mảnh tròn giống hệt).
    `;
}

// Cập nhật vật thể mới (thêm nhiều vật thể)
let objects = []; // Mảng lưu nhiều vật thể
function addObject() {
    const newHc = prompt("Nhập chiều cao mới cho vật thể (mm):") || 3;
    const newA = prompt("Nhập bán kính đáy mới (mm):") || 11.5;
    objects.push({ hc: newHc, a: newA });
    let result = 'Vật thể mới: ';
    objects.forEach(obj => {
        const Rs = (obj.a**2 + obj.hc**2) / (2 * obj.hc);
        const Vlens = 2 * Math.PI * obj.hc**2 * (Rs - obj.hc / 3);
        result += `V_lens ≈ ${Vlens.toFixed(2)} mm³<br>`;
    });
    document.getElementById('result').innerHTML += result;
}

// JS cho camera mô phỏng (WebRTC cho web, overlay chú thích cho "Android camera")
function startCamera() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error('Lỗi camera:', err));

    // Overlay chú thích (giả lập đếm hạt)
    setInterval(() => {
        context.drawImage(video, 0, 0, 320, 240);
        const totalParticles = Math.floor(Math.random() * 100); // Giả lập
        const lostParticles = Math.floor(Math.random() * 20);
        const lostDiv4 = (lostParticles / 4).toFixed(2);

        context.fillStyle = 'white';
        context.font = '16px Arial';
        context.fillText(`Tổng số hạt đã đếm: ${totalParticles}`, 10, 20);
        context.fillText(`Tổng số hạt mất: ${lostParticles}`, 10, 40);
        context.fillText(`Số hạt mất chia 4: ${lostDiv4}`, 10, 60);
    }, 1000); // Cập nhật mỗi giây
}

// Xử lý form (demo, không gửi thật)
document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Đăng nhập thành công!');
});
document.getElementById('registerForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Đăng ký thành công! Liên hệ 0584226789 hoặc Zalo.');
});