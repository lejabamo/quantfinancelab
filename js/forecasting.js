// QuantFinance Lab - Module: Forecasting (Regression Models & Class Example)

window.ForecastingModule = (function() {
    let regressionChart = null;

    // Default data points
    let dataPoints = [
        { year: 2020, value: 3100 },
        { year: 2021, value: 3600 },
        { year: 2022, value: 4300 },
        { year: 2023, value: 4100 },
        { year: 2024, value: 4800 }
    ];

    function init() {
        renderTable();
        bindEvents();
        calculateRegressions();
    }

    function bindEvents() {
        const addBtn = document.getElementById("btn-add-datapoint");
        if (addBtn) {
            const newAddBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newAddBtn, addBtn);
            newAddBtn.addEventListener("click", addDataPoint);
        }

        const runBtn = document.getElementById("btn-run-forecast");
        if (runBtn) {
            const newRunBtn = runBtn.cloneNode(true);
            runBtn.parentNode.replaceChild(newRunBtn, runBtn);
            newRunBtn.addEventListener("click", calculateRegressions);
        }

        const classExampleBtn = document.getElementById("btn-load-class-example");
        if (classExampleBtn) {
            const newClassBtn = classExampleBtn.cloneNode(true);
            classExampleBtn.parentNode.replaceChild(newClassBtn, classExampleBtn);
            newClassBtn.addEventListener("click", loadClassExample);
        }
    }

    function loadClassExample() {
        dataPoints = [
            { year: 2015, value: 40 },
            { year: 2016, value: 35 },
            { year: 2017, value: 30 },
            { year: 2018, value: 40 },
            { year: 2019, value: 70 },
            { year: 2020, value: 120 },
            { year: 2021, value: 130 }
        ];

        // Update the form year input for the next add action
        const yearInput = document.getElementById("input-add-year");
        if (yearInput) yearInput.value = 2022;

        renderTable();
        calculateRegressions();
    }

    function renderTable() {
        const tbody = document.getElementById("forecast-data-tbody");
        if (!tbody) return;

        dataPoints.sort((a, b) => a.year - b.year);

        tbody.innerHTML = dataPoints.map((pt, idx) => `
            <tr>
                <td class="font-monospace">${pt.year}</td>
                <td class="font-monospace">$${pt.value.toLocaleString()}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm py-0 px-2 btn-delete-pt" data-idx="${idx}">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            </tr>
        `).join("");

        // Bind delete buttons
        document.querySelectorAll(".btn-delete-pt").forEach(btn => {
            btn.addEventListener("click", function() {
                const idx = parseInt(this.dataset.idx);
                dataPoints.splice(idx, 1);
                renderTable();
                calculateRegressions();
            });
        });
    }

    function addDataPoint() {
        const yearInput = document.getElementById("input-add-year");
        const valInput = document.getElementById("input-add-value");
        
        const year = parseInt(yearInput.value);
        const value = parseFloat(valInput.value);

        if (isNaN(year) || isNaN(value)) {
            alert("Por favor ingrese valores numéricos válidos.");
            return;
        }

        const exists = dataPoints.some(pt => pt.year === year);
        if (exists) {
            alert("El año ingresado ya tiene un valor de datos registrado.");
            return;
        }

        dataPoints.push({ year, value });
        yearInput.value = year + 1;
        
        renderTable();
        calculateRegressions();
    }

    function calculateRegressions() {
        const n = dataPoints.length;
        if (n < 3) {
            alert("Se requieren al menos 3 puntos de datos para calcular todos los modelos de regresión.");
            return;
        }

        const x = dataPoints.map(pt => pt.year);
        const y = dataPoints.map(pt => pt.value);
        
        const meanY = y.reduce((sum, val) => sum + val, 0) / n;
        const ssTot = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
        
        const lastYear = Math.max(...x);
        const nextYear1 = lastYear + 1;
        const nextYear2 = lastYear + 2;

        // Dynamic table header updates
        const th1 = document.getElementById("th-pred-1");
        const th2 = document.getElementById("th-pred-2");
        if (th1) th1.innerText = `Pron. ${nextYear1}`;
        if (th2) th2.innerText = `Pron. ${nextYear2}`;

        // --- 1. Linear Regression (y = ax + b) ---
        const linModel = solveLinear(x, y, meanY, ssTot, nextYear1, nextYear2);

        // --- 2. Quadratic Regression (y = ax^2 + bx + c) ---
        const quadModel = solveQuadratic(x, y, meanY, ssTot, nextYear1, nextYear2);

        // --- 3. Exponential Regression (y = a * e^(bx)) ---
        const expModel = solveExponential(x, y, meanY, ssTot, nextYear1, nextYear2);

        // Highlight best model
        highlightBestModel([
            { id: 'linear', r2: linModel.r2 },
            { id: 'quadratic', r2: quadModel.r2 },
            { id: 'exponential', r2: expModel.r2 }
        ]);

        // Render Values
        renderModelResults('linear', linModel);
        renderModelResults('quadratic', quadModel);
        renderModelResults('exponential', expModel);

        // Render comparative table
        renderResultsTable(linModel, quadModel, expModel);

        // Plot Curves
        plotCurves(x, y, linModel, quadModel, expModel, nextYear2);
    }

    function solveLinear(x, y, meanY, ssTot, nextX1, nextX2) {
        const n = x.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumXX += x[i] * x[i];
        }

        const a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const b = (sumY - a * sumX) / n;

        let ssRes = 0;
        for (let i = 0; i < n; i++) {
            const yPred = a * x[i] + b;
            ssRes += Math.pow(y[i] - yPred, 2);
        }
        
        const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
        const nextVal1 = a * nextX1 + b;
        const nextVal2 = a * nextX2 + b;
        
        const equation = `y = ${a.toFixed(3)}x ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(1)}`;

        return { name: "Lineal", a, b, r2, nextVal1, nextVal2, equation, eval: (val) => a * val + b };
    }

    function solveQuadratic(x, y, meanY, ssTot, nextX1, nextX2) {
        const n = x.length;
        let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
        let sumY = 0, sumXY = 0, sumX2Y = 0;

        for (let i = 0; i < n; i++) {
            const xi = x[i];
            const yi = y[i];
            const xi2 = xi * xi;

            sumX += xi;
            sumX2 += xi2;
            sumX3 += xi2 * xi;
            sumX4 += xi2 * xi2;

            sumY += yi;
            sumXY += xi * yi;
            sumX2Y += xi2 * yi;
        }

        const m = [
            [sumX4, sumX3, sumX2],
            [sumX3, sumX2, sumX],
            [sumX2, sumX, n]
        ];
        const constants = [sumX2Y, sumXY, sumY];

        const detD = det3x3(m);
        if (Math.abs(detD) < 0.000001) {
            return { name: "Cuadrática", r2: -1, nextVal1: 0, nextVal2: 0, equation: "Indeterminado" };
        }

        const m1 = m.map((row, r) => [constants[r], row[1], row[2]]);
        const m2 = m.map((row, r) => [row[0], constants[r], row[2]]);
        const m3 = m.map((row, r) => [row[0], row[1], constants[r]]);

        const a = det3x3(m1) / detD;
        const b = det3x3(m2) / detD;
        const c = det3x3(m3) / detD;

        let ssRes = 0;
        for (let i = 0; i < n; i++) {
            const yPred = a * x[i] * x[i] + b * x[i] + c;
            ssRes += Math.pow(y[i] - yPred, 2);
        }

        const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
        const nextVal1 = a * nextX1 * nextX1 + b * nextX1 + c;
        const nextVal2 = a * nextX2 * nextX2 + b * nextX2 + c;
        
        const equation = `y = ${a.toFixed(4)}x² ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(2)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c).toFixed(0)}`;

        return { name: "Cuadrática", a, b, c, r2, nextVal1, nextVal2, equation, eval: (val) => a * val * val + b * val + c };
    }

    function det3x3(m) {
        return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
               m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
               m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    }

    function solveExponential(x, y, meanY, ssTot, nextX1, nextX2) {
        const n = x.length;
        const allPositive = y.every(val => val > 0);
        if (!allPositive) {
            return { name: "Exponencial", r2: -1, nextVal1: 0, nextVal2: 0, equation: "Requiere Y > 0", eval: () => 0 };
        }

        const lnY = y.map(val => Math.log(val));
        
        let sumX = 0, sumLNY = 0, sumXLNY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumLNY += lnY[i];
            sumXLNY += x[i] * lnY[i];
            sumXX += x[i] * x[i];
        }

        const B = (n * sumXLNY - sumX * sumLNY) / (n * sumXX - sumX * sumX);
        const A_prime = (sumLNY - B * sumX) / n;
        
        const a = Math.exp(A_prime);
        const b = B;

        let ssRes = 0;
        for (let i = 0; i < n; i++) {
            const yPred = a * Math.exp(b * x[i]);
            ssRes += Math.pow(y[i] - yPred, 2);
        }

        const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
        const nextVal1 = a * Math.exp(b * nextX1);
        const nextVal2 = a * Math.exp(b * nextX2);
        
        const equation = `y = ${a.toFixed(2)} · e^(${b.toFixed(4)}x)`;

        return { name: "Exponencial", a, b, r2, nextVal1, nextVal2, equation, eval: (val) => a * Math.exp(b * val) };
    }

    function renderModelResults(id, model) {
        document.getElementById(`eq-${id}`).innerText = model.equation;
        document.getElementById(`eq-${id}`).title = model.equation;
        document.getElementById(`r2-${id}`).innerText = model.r2 < 0 ? 'N/A' : model.r2.toFixed(4);
        document.getElementById(`pred-${id}`).innerText = model.r2 < 0 ? 'N/A' : `$${model.nextVal1.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }

    function highlightBestModel(models) {
        let bestModel = null;
        let maxR2 = -Infinity;

        models.forEach(m => {
            if (m.r2 >= 0 && m.r2 <= 1.0 && m.r2 > maxR2) {
                maxR2 = m.r2;
                bestModel = m;
            }
        });

        models.forEach(m => {
            const card = document.getElementById(`card-reg-${m.id}`);
            const badge = document.getElementById(`best-badge-${m.id}`);
            if (card && badge) {
                if (bestModel && m.id === bestModel.id) {
                    card.className = "card bg-dark border-emerald p-2 h-100 transition-smooth";
                    card.style.boxShadow = "0 0 12px rgba(16, 185, 129, 0.2)";
                    badge.classList.remove("d-none");
                } else {
                    card.className = "card bg-dark border-secondary p-2 h-100 transition-smooth";
                    card.style.boxShadow = "none";
                    badge.classList.add("d-none");
                }
            }
        });
    }

    function renderResultsTable(lin, quad, exp) {
        const tbody = document.getElementById("regression-results-tbody");
        if (!tbody) return;

        const models = [lin, quad, exp];
        const maxR2 = Math.max(...models.map(m => m.r2));

        tbody.innerHTML = models.map(m => {
            const isBest = m.r2 >= 0 && Math.abs(m.r2 - maxR2) < 0.00001;
            const rowStyle = isBest ? 'style="background-color: rgba(16, 185, 129, 0.15); font-weight: bold;"' : '';
            return `
                <tr ${rowStyle}>
                    <td class="text-start text-white">${m.name} ${isBest ? '🏆' : ''}</td>
                    <td class="text-secondary small text-truncate" style="max-width: 150px;" title="${m.equation}">${m.equation}</td>
                    <td class="${isBest ? 'text-emerald' : 'text-cyan'}">${m.r2 < 0 ? 'N/A' : m.r2.toFixed(4)}</td>
                    <td>${m.r2 < 0 ? '-' : '$' + m.nextVal1.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                    <td>${m.r2 < 0 ? '-' : '$' + m.nextVal2.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                </tr>
            `;
        }).join("");
    }

    function plotCurves(x, y, lin, quad, exp, nextX2) {
        const ctx = document.getElementById("forecastingChart");
        if (!ctx) return;

        if (regressionChart) {
            regressionChart.destroy();
        }

        const xMin = Math.min(...x);
        const xMax = nextX2;
        const range = xMax - xMin;
        const steps = 50;
        
        const linCurve = [];
        const quadCurve = [];
        const expCurve = [];

        for (let i = 0; i <= steps; i++) {
            const currX = xMin + (range * i) / steps;
            
            if (lin.r2 >= 0) linCurve.push({ x: currX, y: lin.eval(currX) });
            if (quad.r2 >= 0) quadCurve.push({ x: currX, y: quad.eval(currX) });
            if (exp.r2 >= 0) expCurve.push({ x: currX, y: exp.eval(currX) });
        }

        const scatterPoints = x.map((val, idx) => ({ x: val, y: y[idx] }));

        regressionChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Datos Históricos',
                        data: scatterPoints,
                        backgroundColor: '#06b6d4',
                        borderColor: '#ffffff',
                        borderWidth: 1.5,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        order: 1
                    },
                    {
                        label: `Línea de Tendencia (R²: ${lin.r2.toFixed(3)})`,
                        data: linCurve,
                        showLine: true,
                        fill: false,
                        borderColor: 'rgba(245, 158, 11, 0.75)',
                        borderWidth: 2,
                        pointRadius: 0,
                        order: 2
                    },
                    {
                        label: `Reg. Cuadrática (R²: ${quad.r2.toFixed(3)})`,
                        data: quadCurve,
                        showLine: true,
                        fill: false,
                        borderColor: 'rgba(16, 185, 129, 0.75)',
                        borderWidth: 2.5,
                        pointRadius: 0,
                        order: 2
                    },
                    {
                        label: exp.r2 >= 0 ? `Reg. Exponencial (R²: ${exp.r2.toFixed(3)})` : 'Exp (Invalida)',
                        data: expCurve,
                        showLine: true,
                        fill: false,
                        borderColor: 'rgba(99, 102, 241, 0.75)',
                        borderWidth: 2,
                        pointRadius: 0,
                        order: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Año', color: '#94a3b8' },
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8', stepSize: 1, callback: v => v.toFixed(0) }
                    },
                    y: {
                        title: { display: true, text: 'Valor ($)', color: '#94a3b8' },
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc' }
                    }
                }
            }
        });
    }

    return {
        init: init
    };
})();
