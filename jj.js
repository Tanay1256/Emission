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

    // Before any reductions
    let co2eFromElectricityBefore = co2eFromElectricity;
    let co2eFromMethaneBefore = methaneEmissions * 25;
    let co2eFromExplosives = explosivesUsed * 0.12 / 1000; // kg CO2/kg to tons

    // Apply reductions
    if (useMethaneCapture) {
        capturedMethane = methaneEmissions * 0.7;
        emittedMethane = methaneEmissions * 0.3;
        co2eFromMethane = capturedMethane + emittedMethane * 25;
    } else {
        co2eFromMethane = co2eFromMethaneBefore;
    }

    if (useEVs) {
        co2eFromElectricity += coalProduction * 10 / 1000; // additional electricity for EVs
    } else {
        co2eFromElectricity += coalProduction * 25 / 1000; // assuming diesel instead of EVs
    }

    const totalEmissionsBefore = co2eFromMethaneBefore + co2eFromElectricityBefore + co2eFromExplosives;
    const totalEmissionsAfter = co2eFromMethane + co2eFromElectricity + co2eFromExplosives;

    document.getElementById('result').innerText = `Total Emissions Before: ${totalEmissionsBefore.toFixed(2)} tons CO2e\nTotal Emissions After: ${totalEmissionsAfter.toFixed(2)} tons CO2e`;

    // Show the result section
    document.getElementById('resultSection').style.display = 'block';

    // Update the emissions comparison graph
    updateComparisonGraph(co2eFromMethaneBefore, co2eFromElectricityBefore, co2eFromExplosives, co2eFromMethane, co2eFromElectricity, co2eFromExplosives);
}

function updateComparisonGraph(methaneBefore, electricityBefore, explosives, methaneAfter, electricityAfter, explosivesAfter) {
    const ctx = document.getElementById('emissionsComparisonChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Methane', 'Electricity', 'Explosives'],
            datasets: [
                {
                    label: 'Before Reduction (tons)',
                    data: [methaneBefore, electricityBefore, explosives],
                    backgroundColor: '#e74c3c'
                },
                {
                    label: 'After Reduction (tons)',
                    data: [methaneAfter, electricityAfter, explosivesAfter],
                    backgroundColor: '#27ae60'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function predictEmissions() {
    const data = {
        production_level: parseFloat(document.getElementById('productionLevel').value),
        equipment_usage: parseFloat(document.getElementById('equipmentUsage').value),
        external_factors: parseFloat(document.getElementById('externalFactors').value)
    };

    fetch('http://localhost:5000/predict_emission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('emissionPredictionResult').innerText = `Predicted Emissions: ${data.predicted_emissions} units`;
    })
    .catch(error => console.error('Error:', error));
}
