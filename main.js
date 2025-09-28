const submitBtn = document.getElementById('submitBtn');
const resultDiv = document.getElementById('result');
const coordinatesP = document.getElementById('coordinates');
const labelP = document.getElementById('label');
const canvas = document.getElementById('compass');
const ctx = canvas.getContext('2d');

// Draw compass grid
function drawCompass() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer circle
    ctx.beginPath();
    ctx.arc(200, 200, 150, 0, Math.PI * 2);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(50, 200); ctx.lineTo(350, 200); // X-axis
    ctx.moveTo(200, 50); ctx.lineTo(200, 350); // Y-axis
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Animate marker
function animateMarker(targetX, targetY) {
    let x = 200, y = 200; // Start at center
    const steps = 30;
    let step = 0;

    function animate() {
        step++;
        let currentX = x + (targetX - x) * (step / steps);
        let currentY = y - (targetY - y) * (step / steps); // Y axis inverted
        drawCompass();
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();

        if(step < steps) requestAnimationFrame(animate);
    }
    animate();
}

// Determine label based on coordinates
function getLabel(x, y) {
    if(x < 0 && y > 0) return 'Authoritarian Left';
    if(x > 0 && y > 0) return 'Authoritarian Right';
    if(x < 0 && y < 0) return 'Libertarian Left';
    if(x > 0 && y < 0) return 'Libertarian Right';
    return 'Centrist';
}

// Event listener
submitBtn.addEventListener('click', () => {
    const form = document.getElementById('quizForm');
    const values = [];
    for(let i=1; i<=10; i++){
        values.push(parseInt(form['q'+i].value));
    }

    // Compute X (economic) and Y (authority)
    const x = ((values[0]+values[2]+values[5]-3*3)/6)*150; // -150 to 150
    const y = ((values[1]+values[3]+values[4]-3*3)/6)*150; // -150 to 150

    // Show result
    resultDiv.style.display = 'block';
    coordinatesP.textContent = `Coordinates: (${x.toFixed(0)}, ${y.toFixed(0)})`;
    labelP.textContent = `Position: ${getLabel(x, y)}`;

    // Animate marker to position
    animateMarker(x, y);
});

// Initial compass
drawCompass();
