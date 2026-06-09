// QuantFinance Lab - Module: Resource Optimization (Linear Programming)

window.OptimizationModule = (function() {
    let lpChart = null;

    function init() {
        bindEvents();
        solveLP();
    }

    function bindEvents() {
        const inputs = [
            "lp-price-a", "lp-price-b",
            "lp-c11", "lp-c12", "lp-r1",
            "lp-c21", "lp-c22", "lp-r2"
        ];
        
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", solveLP);
            }
        });

        const runBtn = document.getElementById("btn-run-optimization");
        if (runBtn) {
            runBtn.addEventListener("click", solveLP);
        }
    }

    function solveLP() {
        // 1. Get Input values
        const Pa = parseFloat(document.getElementById("lp-price-a").value) || 0;
        const Pb = parseFloat(document.getElementById("lp-price-b").value) || 0;
        
        const c11 = parseFloat(document.getElementById("lp-c11").value) || 0;
        const c12 = parseFloat(document.getElementById("lp-c12").value) || 0;
        const R1  = parseFloat(document.getElementById("lp-r1").value) || 0;

        const c21 = parseFloat(document.getElementById("lp-c21").value) || 0;
        const c22 = parseFloat(document.getElementById("lp-c22").value) || 0;
        const R2  = parseFloat(document.getElementById("lp-r2").value) || 0;

        // 2. Identify candidate vertices
        const candidates = [];

        // Point 1: Origin (0, 0)
        candidates.push({ x: 0, y: 0, origin: "Origen (0,0)" });

        // Point 2: R1 intersection with Y-axis (X = 0)
        if (c12 !== 0) candidates.push({ x: 0, y: R1 / c12, origin: "R1 con Eje Y" });

        // Point 3: R1 intersection with X-axis (Y = 0)
        if (c11 !== 0) candidates.push({ x: R1 / c11, y: 0, origin: "R1 con Eje X" });

        // Point 4: R2 intersection with Y-axis (X = 0)
        if (c22 !== 0) candidates.push({ x: 0, y: R2 / c22, origin: "R2 con Eje Y" });

        // Point 5: R2 intersection with X-axis (Y = 0)
        if (c21 !== 0) candidates.push({ x: R2 / c21, y: 0, origin: "R2 con Eje X" });

        // Point 6: Intersection of R1 & R2
        const det = c11 * c22 - c12 * c21;
        if (Math.abs(det) > 0.00001) {
            const xInt = (R1 * c22 - R2 * c12) / det;
            const yInt = (c11 * R2 - c21 * R1) / det;
            candidates.push({ x: xInt, y: yInt, origin: "Intersección R1 & R2" });
        }

        // 3. Evaluate feasibility and objective value
        let maxZ = -1;
        let optX = 0;
        let optY = 0;
        
        const checkedVertices = [];

        candidates.forEach(pt => {
            // Check if point is mathematically valid
            if (isNaN(pt.x) || isNaN(pt.y) || !isFinite(pt.x) || !isFinite(pt.y)) {
                return;
            }

            // Rounding checks to avoid floating point precision errors
            const isNonNegative = pt.x >= -0.0001 && pt.y >= -0.0001;
            const satisfiesR1 = (c11 * pt.x + c12 * pt.y) <= (R1 + 0.0001);
            const satisfiesR2 = (c21 * pt.x + c22 * pt.y) <= (R2 + 0.0001);
            
            const isFeasible = isNonNegative && satisfiesR1 && satisfiesR2;
            
            // Clean negative values very close to zero
            const cleanX = pt.x < 0 ? 0 : pt.x;
            const cleanY = pt.y < 0 ? 0 : pt.y;

            const Z = Pa * cleanX + Pb * cleanY;

            // Avoid duplicate vertices in checked list
            const isDuplicate = checkedVertices.some(v => Math.abs(v.x - cleanX) < 0.001 && Math.abs(v.y - cleanY) < 0.001);
            if (!isDuplicate) {
                checkedVertices.push({
                    x: cleanX,
                    y: cleanY,
                    origin: pt.origin,
                    feasible: isFeasible,
                    zValue: Z
                });

                if (isFeasible && Z > maxZ) {
                    maxZ = Z;
                    optX = cleanX;
                    optY = cleanY;
                }
            }
        });

        // 4. Render outputs
        document.getElementById("lp-opt-x").innerText = optX.toFixed(2);
        document.getElementById("lp-opt-y").innerText = optY.toFixed(2);
        document.getElementById("lp-opt-z").innerText = `$${maxZ.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // 5. Render procedure details in the table
        const tbody = document.getElementById("lp-procedure-tbody");
        if (tbody) {
            tbody.innerHTML = checkedVertices.map(v => {
                const badgeClass = v.feasible ? "bg-emerald text-white px-2 py-1 rounded small" : "bg-danger text-white px-2 py-1 rounded small";
                const badgeText = v.feasible ? "Sí" : "No";
                const isOptimal = v.feasible && Math.abs(v.zValue - maxZ) < 0.001;
                const rowStyle = isOptimal ? 'style="background-color: rgba(16, 185, 129, 0.15); font-weight: bold;"' : '';
                
                return `
                    <tr ${rowStyle}>
                        <td>(${v.x.toFixed(1)}, ${v.y.toFixed(1)})</td>
                        <td class="text-secondary small">${v.origin}</td>
                        <td><span class="${badgeClass}">${badgeText}</span></td>
                        <td class="${v.feasible ? 'text-white' : 'text-muted'}">${v.feasible ? '$' + v.zValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'} ${isOptimal ? '🏆' : ''}</td>
                    </tr>
                `;
            }).join("");
        }

        // 6. Plot constraints and Feasible Region
        plotFeasibleRegion(c11, c12, R1, c21, c22, R2, checkedVertices, optX, optY);
    }

    function plotFeasibleRegion(c11, c12, R1, c21, c22, R2, vertices, optX, optY) {
        const ctx = document.getElementById("lpFeasibleChart");
        if (!ctx) return;

        if (lpChart) {
            lpChart.destroy();
        }

        // Determine axis limits (max values + padding)
        const maxXVal = Math.max(
            c11 > 0 ? R1 / c11 : 0,
            c21 > 0 ? R2 / c21 : 0,
            optX
        ) * 1.25 || 100;

        const maxYVal = Math.max(
            c12 > 0 ? R1 / c12 : 0,
            c22 > 0 ? R2 / c22 : 0,
            optY
        ) * 1.25 || 100;

        // Restriction 1 line data
        const r1Points = [];
        if (c12 > 0) {
            r1Points.push({ x: 0, y: R1 / c12 });
            r1Points.push({ x: c11 > 0 ? R1 / c11 : maxXVal, y: 0 });
        } else if (c11 > 0) {
            r1Points.push({ x: R1 / c11, y: 0 });
            r1Points.push({ x: R1 / c11, y: maxYVal });
        }

        // Restriction 2 line data
        const r2Points = [];
        if (c22 > 0) {
            r2Points.push({ x: 0, y: R2 / c22 });
            r2Points.push({ x: c21 > 0 ? R2 / c21 : maxXVal, y: 0 });
        } else if (c21 > 0) {
            r2Points.push({ x: R2 / c21, y: 0 });
            r2Points.push({ x: R2 / c21, y: maxYVal });
        }

        // Order the feasible vertices to build a filled polygon
        const feasible = vertices.filter(v => v.feasible);
        
        // Sort vertices counter-clockwise around their centroid
        if (feasible.length > 0) {
            const cx = feasible.reduce((sum, v) => sum + v.x, 0) / feasible.length;
            const cy = feasible.reduce((sum, v) => sum + v.y, 0) / feasible.length;
            feasible.sort((a, b) => {
                return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);
            });
        }
        
        // Add first vertex at the end to close the polygon loop
        const polygonPoints = feasible.map(v => ({ x: v.x, y: v.y }));
        if (polygonPoints.length > 0) {
            polygonPoints.push({ x: polygonPoints[0].x, y: polygonPoints[0].y });
        }

        lpChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    // Feasible Region Polygon Area
                    {
                        label: 'Región Factible',
                        data: polygonPoints,
                        showLine: true,
                        fill: true,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)', // Emerald translucent
                        borderColor: 'rgba(16, 185, 129, 0.4)',
                        borderWidth: 1,
                        pointRadius: 0,
                        tension: 0,
                        order: 3
                    },
                    // Restriction 1 Line
                    {
                        label: 'Restricción 1',
                        data: r1Points,
                        showLine: true,
                        fill: false,
                        borderColor: '#f59e0b', // Amber
                        borderWidth: 2,
                        pointRadius: 4,
                        order: 2
                    },
                    // Restriction 2 Line
                    {
                        label: 'Restricción 2',
                        data: r2Points,
                        showLine: true,
                        fill: false,
                        borderColor: '#6366f1', // Indigo
                        borderWidth: 2,
                        pointRadius: 4,
                        order: 2
                    },
                    // Optimal Solution point
                    {
                        label: 'Solución Óptima',
                        data: [{ x: optX, y: optY }],
                        backgroundColor: '#10b981', // Emerald star/circle
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        pointRadius: 9,
                        pointHoverRadius: 11,
                        pointStyle: 'rectRot',
                        order: 1
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
                        min: 0,
                        max: maxXVal,
                        title: { display: true, text: 'Cantidad Producto A (X)', color: '#94a3b8' },
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        type: 'linear',
                        min: 0,
                        max: maxYVal,
                        title: { display: true, text: 'Cantidad Producto B (Y)', color: '#94a3b8' },
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: (${context.raw.x.toFixed(1)}, ${context.raw.y.toFixed(1)})`;
                            }
                        }
                    }
                }
            }
        });
    }

    return {
        init: init
    };
})();
