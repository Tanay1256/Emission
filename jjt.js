

// Function to handle the form submission and AI recommendation request
function calculateEmissions() {
    // ... existing code to calculate emissions ...

    const userInputData = {
        coalProduction: parseFloat(document.getElementById('coalProduction').value),
        electricityUsage: parseFloat(document.getElementById('electricityUsage').value),
        explosivesUsed: parseFloat(document.getElementById('explosivesUsed').value),
        methaneEmissionFactor: parseFloat(document.getElementById('methaneEmissionFactor').value),
        useEVs: document.getElementById('useEVs').checked,
        useMethaneCapture: document.getElementById('useMethaneCapture').checked,
    };

    // Get AI recommendations based on user input
    getAIRecommendations(userInputData);

    // ... existing code to update the graph ...
}

// Add a section in your HTML to display AI recommendations
/*
<div id="aiRecommendations"></div>
*/

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
    calculateCarbonCredits(useEVs, useMethaneCapture);
}

function updateComparisonGraph(methaneBefore, electricityBefore, explosives, methaneAfter, electricityAfter, explosivesAfter) {
    const ctx = document.getElementById('emissionsComparisonChart').getContext('2d');

    // Check if the chart already exists and destroy it to avoid duplicate charts
    if (window.emissionsChart) {
        window.emissionsChart.destroy();
    }

    window.emissionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Methane', 'Electricity', 'Explosives'],
            datasets: [
                {
                    label: 'Before Reduction (tons)',
                    data: [methaneBefore, electricityBefore, explosives],
                    backgroundColor: '#e74c3c',
                    borderColor: '#c0392b',
                    borderWidth: 1
                },
                {
                    label: 'After Reduction (tons)',
                    data: [methaneAfter, electricityAfter, explosivesAfter],
                    backgroundColor: '#27ae60',
                    borderColor: '#1e8449',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'logarithmic',
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2); // Show 2 decimal places
                        }
                    }
                }
            }
            
            ,
    
        
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)} tons`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: '#000',
                    anchor: 'end',
                    align: 'top',
                    formatter: function(value, context) {
                        return value.toFixed(2);
                    }
                }
            }
        }
            
    });
}

function calculateCarbonCredits(useEVs, useMethaneCapture) {
    let carbonCredits = 0;

    if (useMethaneCapture) {
        carbonCredits += 5; // Example: 5 credits for methane capture
    }

    if (useEVs) {
        carbonCredits += 10; // Example: 10 credits for EV usage
    }

    document.getElementById('carbonCreditsValue').innerText = carbonCredits;
}

function setCustomPlaceholder() {
    // Wait until the Google Custom Search Engine is loaded
    setTimeout(function() {
        var searchBox = document.querySelector('.gsc-input');
        if (searchBox) {
            searchBox.setAttribute('placeholder', 'Search your query here...');
        }
    }, 1000); // Adjust the timeout as needed
}

// Call the function after Google CSE script has been loaded
window.onload = setCustomPlaceholder;