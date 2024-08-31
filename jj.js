document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculatorForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
    });
});

function calculateEmissions() {
    const coalProduction = parseFloat(document.getElementById('coalProduction').value);
    const electricityUsage = parseFloat(document.getElementById('electricityUsage').value);
    const explosivesUsed = parseFloat(document.getElementById('explosivesUsed').value);
    const methaneEmissionFactor = parseFloat(document.getElementById('methaneEmissionFactor').value);

    const useEVs = document.getElementById('useEVs').checked;
    const useMethaneCapture = document.getElementById('useMethaneCapture').checked;

    let methaneEmissions = coalProduction * methaneEmissionFactor;
    let emittedMethane = methaneEmissions;
    let capturedMethane = 0;
    let co2eFromMethane = 0;
    let co2eFromElectricity = electricityUsage * 0.85 / 1000; // kg CO2/kWh to tons

    // Reduction calculations
    if (useMethaneCapture) {
        capturedMethane = methaneEmissions * 0.5; // Assume 50% capture
    }

    co2eFromMethane = (emittedMethane - capturedMethane) * 25; // Methane has a global warming potential of 25 times CO2
    if (useEVs) {
        co2eFromElectricity *= 0.7; // Assume 30% reduction
    }

    const co2eFromExplosives = explosivesUsed * 0.12 / 1000; // kg CO2/kg to tons

    const totalEmissions = co2eFromMethane + co2eFromElectricity + co2eFromExplosives;

    document.getElementById('result').innerText = `Total CO2 Emissions: ${totalEmissions.toFixed(2)} tons`;

    // Update progress bars
    document.getElementById('progressMethane').style.width = `${Math.min((emittedMethane - capturedMethane) / methaneEmissions * 100, 100)}%`;
    document.getElementById('progressElectricity').style.width = `${(1 - co2eFromElectricity / (electricityUsage * 0.85 / 1000)) * 100}%`;
}

function predictEmissions() {
    const productionLevel = parseFloat(document.getElementById('coalProduction').value);
    const equipmentUsage = parseFloat(document.getElementById('electricityUsage').value);
    const externalFactors = parseFloat(document.getElementById('explosivesUsed').value);

    fetch('/predict_emission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            production_level: productionLevel,
            equipment_usage: equipmentUsage,
            external_factors: externalFactors
        })
    })
    .then(response => response.json())
    .then(data => {
        const predictedEmissions = data.predicted_emissions;
        document.getElementById('emissionPredictionResult').innerText = `Predicted Emissions: ${predictedEmissions.toFixed(2)} tons`;

        // Create chart
        const ctx = document.getElementById('emissionsComparisonChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Actual Emissions', 'Predicted Emissions'],
                datasets: [{
                    label: 'Emissions (tons)',
                    data: [
                        parseFloat(document.getElementById('result').innerText.split(': ')[1].replace(' tons', '')),
                        predictedEmissions
                    ],
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
