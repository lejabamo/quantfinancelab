// QuantFinance Lab - Main Application & Router

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});

const App = (function() {
    let dashboardPerformanceChart = null;
    let dashboardAllocationChart = null;

    // Simulated market data for the ticker
    const marketAssets = [
        { symbol: "BTC/USD", price: 67342.50, change: 1.45 },
        { symbol: "ETH/USD", price: 3482.20, change: -0.85 },
        { symbol: "AAPL", price: 178.52, change: 0.35 },
        { symbol: "MSFT", price: 415.60, change: 1.20 },
        { symbol: "GLD", price: 218.40, change: -0.12 },
        { symbol: "SPX", price: 5120.30, change: 0.65 },
        { symbol: "EUR/USD", price: 1.0825, change: -0.05 }
    ];

    function init() {
        initRouting();
        initTicker();
        initDashboard();
        
        // Handle Sidebar Toggle on Mobile
        const toggleBtn = document.getElementById("sidebar-toggle");
        const sidebar = document.querySelector(".sidebar");
        const overlay = document.querySelector(".sidebar-toggle-overlay");
        
        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("show");
            });
            overlay.addEventListener("click", () => {
                sidebar.classList.remove("show");
            });
        }
    }

    // --- Vanilla SPA Routing ---
    function initRouting() {
        const menuItems = document.querySelectorAll(".menu-item");
        const sections = document.querySelectorAll("main section");

        menuItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                
                const targetId = item.getAttribute("data-target");
                if (!targetId) return;

                // Close mobile menu if open
                document.querySelector(".sidebar").classList.remove("show");

                // Update active link
                menuItems.forEach(mi => mi.classList.remove("active"));
                item.classList.add("active");

                // Show target section, hide others
                sections.forEach(sec => {
                    if (sec.id === targetId) {
                        sec.classList.remove("d-none");
                        sec.classList.add("fade-in-slide");
                        
                        // Initialize module when switching to its view
                        triggerModuleInit(targetId);
                    } else {
                        sec.classList.add("d-none");
                        sec.classList.remove("fade-in-slide");
                    }
                });
            });
        });
    }

    function triggerModuleInit(moduleId) {
        // Yield execution context to let DOM settle, then init/refresh charts
        setTimeout(() => {
            if (moduleId === "optimization-section" && window.OptimizationModule) {
                window.OptimizationModule.init();
            } else if (moduleId === "forecasting-section" && window.ForecastingModule) {
                window.ForecastingModule.init();
            } else if (moduleId === "decisions-section" && window.DecisionsModule) {
                window.DecisionsModule.init();
            } else if (moduleId === "dashboard-section") {
                initDashboard();
            }
        }, 50);
    }

    // --- Market Ticker Logic ---
    function initTicker() {
        const tickerContainer = document.getElementById("ticker-container");
        if (!tickerContainer) return;

        // Double the array to ensure smooth continuous infinite scrolling loop
        const displayItems = [...marketAssets, ...marketAssets];
        
        renderTickerHTML(displayItems);

        // Periodically simulate price changes
        setInterval(() => {
            marketAssets.forEach(asset => {
                const percentChange = (Math.random() - 0.49) * 0.3; // Slight positive bias
                asset.price += asset.price * (percentChange / 100);
                asset.change += percentChange;
            });
            renderTickerHTML([...marketAssets, ...marketAssets]);
        }, 3000);
    }

    function renderTickerHTML(items) {
        const tickerContainer = document.getElementById("ticker-container");
        if (!tickerContainer) return;

        tickerContainer.innerHTML = items.map(item => {
            const isPositive = item.change >= 0;
            const icon = isPositive ? "bi-arrow-up-right" : "bi-arrow-down-left";
            const textClass = isPositive ? "text-emerald" : "text-rose";
            
            return `
                <div class="ticker-item">
                    <span class="text-light">${item.symbol}</span>
                    <span class="text-white">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                    <span class="${textClass} d-flex align-items-center gap-1">
                        <i class="bi ${icon}"></i>
                        ${isPositive ? '+' : ''}${item.change.toFixed(2)}%
                    </span>
                </div>
            `;
        }).join("");
    }

    // --- Dashboard Specific Charts & Logic ---
    function initDashboard() {
        initDashboardPerformanceChart();
        initDashboardAllocationChart();
    }

    function initDashboardPerformanceChart() {
        const ctx = document.getElementById("dashboardPerformanceChart");
        if (!ctx) return;

        if (dashboardPerformanceChart) {
            dashboardPerformanceChart.destroy();
        }

        // Mock 12 months performance
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const values = [100000, 102500, 101800, 105200, 109000, 107500, 112000, 115000, 113800, 118400, 122100, 126500];

        dashboardPerformanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Valor de Cartera (USD)',
                    data: values,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#06b6d4'
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
                        grid: { color: '#334155' },
                        ticks: {
                            color: '#94a3b8',
                            callback: value => `$${(value / 1000).toFixed(0)}k`
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function initDashboardAllocationChart() {
        const ctx = document.getElementById("dashboardAllocationChart");
        if (!ctx) return;

        if (dashboardAllocationChart) {
            dashboardAllocationChart.destroy();
        }

        dashboardAllocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Tecnología', 'Bonos', 'Oro', 'Criptomonedas'],
                datasets: [{
                    data: [50, 25, 15, 10],
                    backgroundColor: ['#06b6d4', '#6366f1', '#f59e0b', '#10b981'],
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
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
