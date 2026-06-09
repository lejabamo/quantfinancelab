// QuantFinance Lab - Module: Decision Making (Scenario Analysis & Black-Scholes Calculator)

window.DecisionsModule = (function() {
    let scenarioChart = null;

    function init() {
        bindEvents();
        calculateScenarios();
        calculateBlackScholes();
    }

    function bindEvents() {
        // Scenarios inputs
        const inputs = [
            "prob-bull", "ret-bull",
            "prob-base", "ret-base",
            "prob-bear", "ret-bear"
        ];
        
        inputs.forEach(id => {
            document.getElementById(id).addEventListener("input", calculateScenarios);
        });

        // Black-Scholes inputs
        const bsInputs = ["bs-s", "bs-k", "bs-t", "bs-r", "bs-v"];
        bsInputs.forEach(id => {
            document.getElementById(id).addEventListener("input", calculateBlackScholes);
        });
    }

    // --- Scenario Analysis Logic ---
    function calculateScenarios() {
        const pBull = parseFloat(document.getElementById("prob-bull").value) / 100;
        const rBull = parseFloat(document.getElementById("ret-bull").value) / 100;
        
        const pBase = parseFloat(document.getElementById("prob-base").value) / 100;
        const rBase = parseFloat(document.getElementById("ret-base").value) / 100;
        
        const pBear = parseFloat(document.getElementById("prob-bear").value) / 100;
        const rBear = parseFloat(document.getElementById("ret-bear").value) / 100;

        // Check probability sum
        const sumProb = pBull + pBase + pBear;
        const alertBox = document.getElementById("scenario-warning");
        if (Math.abs(sumProb - 1.0) > 0.001) {
            alertBox.innerText = `Atención: Las probabilidades suman ${(sumProb * 100).toFixed(1)}%. Deben sumar exactamente 100%.`;
            alertBox.classList.remove("d-none");
        } else {
            alertBox.classList.add("d-none");
        }

        // Expected Value
        const expectedReturn = (pBull * rBull) + (pBase * rBase) + (pBear * rBear);

        // Standard Deviation of Returns (Risk)
        const variance = pBull * Math.pow(rBull - expectedReturn, 2) +
                         pBase * Math.pow(rBase - expectedReturn, 2) +
                         pBear * Math.pow(rBear - expectedReturn, 2);
        const stdDev = Math.sqrt(variance);

        // Display outcomes
        document.getElementById("scen-expected-return").innerText = `${(expectedReturn * 100).toFixed(2)}%`;
        document.getElementById("scen-risk").innerText = `${(stdDev * 100).toFixed(2)}%`;

        // Recommendation engine
        let recommendation = "";
        let recClass = "";
        if (expectedReturn >= 0.12) {
            recommendation = "COMPRA FUERTE (Crecimiento Robusto)";
            recClass = "text-emerald";
        } else if (expectedReturn >= 0.05) {
            recommendation = "COMPRA MODERADA (Retorno Positivo)";
            recClass = "text-cyan";
        } else if (expectedReturn >= 0.0) {
            recommendation = "MANTENER / NEUTRAL";
            recClass = "text-amber";
        } else {
            recommendation = "VENTA / COBERTURA (Riesgo de Pérdida)";
            recClass = "text-rose";
        }
        
        const recEl = document.getElementById("scen-recommendation");
        recEl.innerText = recommendation;
        recEl.className = `${recClass} fw-bold fs-5`;

        plotScenarioChart([rBull * 100, rBase * 100, rBear * 100, expectedReturn * 100]);
    }

    function plotScenarioChart(data) {
        const ctx = document.getElementById("scenarioChart");
        if (!ctx) return;

        if (scenarioChart) {
            scenarioChart.destroy();
        }

        scenarioChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Alcista', 'Base', 'Bajista', 'Valor Esperado'],
                datasets: [{
                    label: 'Retorno %',
                    data: data,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.6)', // Emerald
                        'rgba(6, 182, 212, 0.6)',  // Cyan
                        'rgba(244, 63, 94, 0.6)',  // Rose
                        'rgba(99, 102, 241, 0.85)' // Indigo
                    ],
                    borderColor: [
                        '#10b981',
                        '#06b6d4',
                        '#f43f5e',
                        '#6366f1'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        title: { display: true, text: 'Retorno %', color: '#94a3b8' },
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }


    // --- Black-Scholes Pricing Logic ---
    function calculateBlackScholes() {
        const S = parseFloat(document.getElementById("bs-s").value);
        const K = parseFloat(document.getElementById("bs-k").value);
        const T = parseFloat(document.getElementById("bs-t").value);
        const r = parseFloat(document.getElementById("bs-r").value) / 100;
        const v = parseFloat(document.getElementById("bs-v").value) / 100;

        if (isNaN(S) || isNaN(K) || isNaN(T) || isNaN(r) || isNaN(v) || T <= 0 || v <= 0) {
            return;
        }

        const d1 = (Math.log(S / K) + (r + (v * v) / 2) * T) / (v * Math.sqrt(T));
        const d2 = d1 - v * Math.sqrt(T);

        const Nd1 = stdNormalCDF(d1);
        const Nd2 = stdNormalCDF(d2);
        const N_d1 = stdNormalCDF(-d1);
        const N_d2 = stdNormalCDF(-d2);

        // Option Prices
        const callPrice = S * Nd1 - K * Math.exp(-r * T) * Nd2;
        const putPrice = K * Math.exp(-r * T) * N_d2 - S * N_d1;

        // Standard Normal PDF
        const nd1 = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-d1 * d1 / 2);

        // Greeks
        const deltaCall = Nd1;
        const deltaPut = Nd1 - 1;
        
        const gamma = nd1 / (S * v * Math.sqrt(T));
        
        const vega = S * Math.sqrt(T) * nd1 / 100; // per 1% change in vol

        // Theta (daily)
        const thetaCall = (-(S * nd1 * v) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * Nd2) / 365;
        const thetaPut = (-(S * nd1 * v) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * N_d2) / 365;

        // Render Values
        document.getElementById("bs-call-price").innerText = `$${callPrice.toFixed(3)}`;
        document.getElementById("bs-put-price").innerText = `$${putPrice.toFixed(3)}`;

        // Render Greeks
        document.getElementById("bs-call-delta").innerText = deltaCall.toFixed(4);
        document.getElementById("bs-put-delta").innerText = deltaPut.toFixed(4);
        
        document.getElementById("bs-gamma").innerText = gamma.toFixed(4);
        
        document.getElementById("bs-vega").innerText = vega.toFixed(4);
        
        document.getElementById("bs-call-theta").innerText = thetaCall.toFixed(4);
        document.getElementById("bs-put-theta").innerText = thetaPut.toFixed(4);
    }

    // Normal Cumulative Distribution Function approximation
    function stdNormalCDF(x) {
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989422804 * Math.exp(-x * x / 2);
        const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
        return x >= 0 ? 1 - p : p;
    }

    return {
        init: init
    };
})();
