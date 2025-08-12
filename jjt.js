// jjt.js

// --- Event Listeners for Sliders ---
document.addEventListener('DOMContentLoaded', () => {
    // Sliders for Calculator Page
    const methaneSlider = document.getElementById('methaneCapturePercentage');
    const methaneValue = document.getElementById('methaneCaptureValue');
    if (methaneSlider) {
        methaneSlider.oninput = () => {
            methaneValue.textContent = methaneSlider.value + '%';
        };
    }

    const evSlider = document.getElementById('evAdoptionPercentage');
    const evValue = document.getElementById('evAdoptionValue');
    if (evSlider) {
        evSlider.oninput = () => {
            evValue.textContent = evSlider.value + '%';
        };
    }
});

// --- Main Calculation Function ---
function calculateEmissions() {
    // --- Get User Inputs ---
    const coalProduction = parseFloat(document.getElementById('coalProduction').value) || 0;
    const electricityUsage = parseFloat(document.getElementById('electricityUsage').value) || 0;
    const methaneFactor = parseFloat(document.getElementById('methaneEmissionFactor').value) || 0;

    // --- Get Reduction Percentages ---
    const methaneCapturePercent = parseFloat(document.getElementById('methaneCapturePercentage').value) / 100;
    const evAdoptionPercent = parseFloat(document.getElementById('evAdoptionPercentage').value) / 100;

    // --- Constants (CO2e conversion factors) ---
    const METHANE_GWP = 28; // Global Warming Potential over 100 years
    const METHANE_DENSITY = 0.000678; // tons per m³
    const GRID_EMISSION_FACTOR = 0.00085; // tons CO2e/kWh
    const DIESEL_EMISSION_FACTOR = 0.00268; // tons CO2e/liter
    const DIESEL_PER_TON_COAL = 1.5; // Liters of diesel used per ton of coal mined
    const EV_KWH_PER_TON_COAL = 2.0; // kWh needed by EVs per ton of coal mined

    // --- BASELINE EMISSIONS (Before Reductions) ---
    // Methane emissions
    const totalMethaneVolume = coalProduction * methaneFactor; // in m³
    const totalMethaneTons = totalMethaneVolume * METHANE_DENSITY; // in tons
    const co2eFromMethaneBefore = totalMethaneTons * METHANE_GWP;

    // Electricity emissions
    const co2eFromElectricityBefore = electricityUsage * GRID_EMISSION_FACTOR;
    
    // Vehicle emissions (assuming 100% diesel fleet)
    const totalDieselUsage = coalProduction * DIESEL_PER_TON_COAL; // in liters
    const co2eFromVehiclesBefore = totalDieselUsage * DIESEL_EMISSION_FACTOR;

    const totalEmissionsBefore = co2eFromMethaneBefore + co2eFromElectricityBefore + co2eFromVehiclesBefore;

    // --- EMISSIONS AFTER REDUCTIONS ---
    // Methane emissions
    const capturedMethaneTons = totalMethaneTons * methaneCapturePercent;
    const emittedMethaneTonsAfter = totalMethaneTons - capturedMethaneTons;
    const co2eFromMethaneAfter = emittedMethaneTonsAfter * METHANE_GWP;

    // Vehicle & Electricity emissions
    const dieselFleetPercent = 1 - evAdoptionPercent;
    const co2eFromVehiclesAfter = (totalDieselUsage * dieselFleetPercent) * DIESEL_EMISSION_FACTOR;
    
    // Additional electricity for EVs
    const evElectricityUsage = (coalProduction * evAdoptionPercent) * EV_KWH_PER_TON_COAL;
    const totalElectricityUsageAfter = electricityUsage + evElectricityUsage;
    const co2eFromElectricityAfter = totalElectricityUsageAfter * GRID_EMISSION_FACTOR;
    
    const totalEmissionsAfter = co2eFromMethaneAfter + co2eFromElectricityAfter + co2eFromVehiclesAfter;

    // --- Display Results ---
    document.getElementById('result').innerText = 
        `Baseline Emissions: ${totalEmissionsBefore.toFixed(2)} tons CO2e/year\n` +
        `Emissions After Reduction: ${totalEmissionsAfter.toFixed(2)} tons CO2e/year\n` +
        `Total Reduction: ${(totalEmissionsBefore - totalEmissionsAfter).toFixed(2)} tons CO2e/year`;

    document.getElementById('resultSection').style.display = 'block';

    // --- Update Chart & Carbon Credits ---
    updateComparisonGraph(
        [co2eFromMethaneBefore, co2eFromElectricityBefore, co2eFromVehiclesBefore],
        [co2eFromMethaneAfter, co2eFromElectricityAfter, co2eFromVehiclesAfter]
    );
    calculateCarbonCredits(capturedMethaneTons, evAdoptionPercent);
}

// --- Chart Update Function ---
function updateComparisonGraph(beforeData, afterData) {
    const ctx = document.getElementById('emissionsComparisonChart').getContext('2d');
    if (window.emissionsChart) {
        window.emissionsChart.destroy();
    }
    window.emissionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Methane', 'Electricity', 'Vehicles'],
            datasets: [{
                label: 'Baseline Emissions (tons CO2e)',
                data: beforeData,
                backgroundColor: '#e74c3c',
            }, {
                label: 'After Reduction (tons CO2e)',
                data: afterData,
                backgroundColor: '#2ecc71',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Tons of CO2 Equivalent'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)} tons`
                    }
                }
            }
        }
    });
}

// --- Carbon Credit Calculation ---
function calculateCarbonCredits(capturedMethane, evPercent) {
    // Example values: 1 credit per ton of methane captured, 0.1 credit per % of EV adoption
    const creditsFromMethane = capturedMethane * 1;
    const creditsFromEVs = (evPercent * 100) * 0.1; 
    const totalCredits = creditsFromMethane + creditsFromEVs;
    document.getElementById('carbonCreditsValue').innerText = totalCredits.toFixed(2);
}
