const submitBtn = document.getElementById('submitBtn');
const resultDiv = document.getElementById('result');
const coordinatesP = document.getElementById('coordinates');
const labelP = document.getElementById('label');
const canvas = document.getElementById('compass');
const ctx = canvas.getContext('2d');

submitBtn.addEventListener('click', () => {
    const form = document.getElementById('quizForm');
    const values = [];
    for (let i=1; i<=10; i++){
        values.push(parseInt(form['q'+i].value));
    }

    // Compute X (economic) and Y (authority)
    const x = ((values[0]+values[2]+values[5]-3*3)/6)*200; // -100 to 100 scaled
    const y = ((values[1]+values[3]+values[4]-3*3)/6)*200; // -100 to 100 scaled

    resultDiv.style.display = 'block';
    coordinatesP.textContent = `Coordinates: (${x.toFixed(0)}, ${y.toFixed(0)})`;

    // Determine label
    let label = '';
    if(x<0 && y>0) label = 'Authoritarian Left';
    else if(x>0 && y>0) label = 'Authoritarian Right';
    else if(x<0 && y<0) label = 'Libertarian Left';
    else if(x>0 && y<0) label = 'Libertarian Right';
    else label = 'Centrist';
    labelP.textContent = `Position: ${label}`;

    // Draw compass
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='gray';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.arc(200,200,150,0,Math.PI*2);
    ctx.stroke();

    // Draw cross
    ctx.moveTo(50,200); ctx.lineTo(350,200);
    ctx.moveTo(200,50); ctx.lineTo(200,350);
    ctx.stroke();

    // Draw point
    ctx.beginPath();
    ctx.arc(200 + x, 200 - y, 8,0,Math.PI*2);
    ctx.fillStyle='red';
    ctx.fill();
});
