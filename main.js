const submitBtn = document.getElementById('submitBtn');
const resultDiv = document.getElementById('result');
const coordinatesP = document.getElementById('coordinates');
const canvas = document.getElementById('compass');
const ctx = canvas.getContext('2d');

submitBtn.addEventListener('click', () => {
    const form = document.getElementById('quizForm');
    const q1 = parseInt(form.q1.value); // economic control
    const q2 = parseInt(form.q2.value); // personal freedom
    const q3 = parseInt(form.q3.value); // wealth distribution
    const q4 = parseInt(form.q4.value); // government interference

    // Compute X (left-right economic) and Y (authoritarian-libertarian)
    const x = ((q1 + q3) / 2 - 3) * 50; // -100 to 100
    const y = ((q2 + q4) / 2 - 3) * 50; // -100 to 100

    resultDiv.style.display = 'block';
    coordinatesP.textContent = `Coordinates: (${x}, ${y})`;

    // Draw compass
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Draw cross lines
    ctx.moveTo(100, 200); ctx.lineTo(300, 200);
    ctx.moveTo(200, 100); ctx.lineTo(200, 300);
    ctx.strokeStyle = 'gray';
    ctx.stroke();

    // Draw player point
    ctx.beginPath();
    ctx.arc(200 + x, 200 - y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
});
