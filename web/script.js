document.getElementById('predictionForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const response = await fetch('http://127.0.0.1:8000/predict/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Date: document.getElementById('date').value,
            Heures: document.getElementById('hours').value,
            Meteo_Irradience: parseFloat(document.getElementById('meteoIrradience').value),
            PR_Total_Compteurs: parseFloat(document.getElementById('prTotalCompteurs').value),
            Ensoleillement: parseFloat(document.getElementById('ensoleillement').value),
            PR_Reference: parseFloat(document.getElementById('prReference').value),
            Nombre_Panneau: parseInt(document.getElementById('nombrePanneau').value),
            Nombre_Onduleur: parseInt(document.getElementById('nombreOnduleur').value),
        }),
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById('predictedEnergy').innerText = `${data.predicted_energy} kWh`;
    } else {
        document.getElementById('predictedEnergy').innerText = 'Error occurred.';
    }
});

/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// Function to fetch energy data from the backend server
async function fetchEnergyData() {
    try {
        // Step 1: Fetch data from the `/energyData` endpoint
        const response = await fetch('http://localhost:3000/energyData'); // Update with your server's endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Step 2: Parse the JSON response (array of rows)
        const data = await response.json();

        // Step 3: For each observation, send a request to the `/predict/` API and collect the results
        let predictedEnergyArray = [];

        for (let observation of data) {
            try {
                // Make the API call for each observation
                const predictionResponse = await fetch('http://127.0.0.1:8000/predict/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        Date: observation.Date,
                        Heures: observation.Heures,
                        Meteo_Irradience: observation.Meteo_Irradience,
                        PR_Total_Compteurs: observation.PR_Total_Compteurs,
                        Ensoleillement: observation.Ensoleillement,
                        PR_Reference: observation.PR_Reference,
                        Nombre_Panneau: observation.Nombre_Panneau,
                        Nombre_Onduleur: observation.Nombre_Onduleur
                    })
                });

                // Parse the prediction response (expected structure: {"predicted_energy": predicted_energy, "Time": heure})
                const predictionData = await predictionResponse.json();

                // Collect the predicted energy and other results in the array
                predictedEnergyArray.push({
                    PredictedEnergy: predictionData.predicted_energy, // Predicted energy from API
                    Time: predictionData.Time           // Time of prediction
                });

            } catch (error) {
                console.error('Error making prediction:', error);
            }
        }
        
        return predictedEnergyArray;

    } catch (error) {
        console.error('Error fetching energy data:', error);
    }
}

// Example function to handle chart rendering (optional)
async function createChart() {
    const predictedData = await fetchEnergyData();
    
    if (!predictedData || predictedData.length === 0) {
        console.error('No predicted energy data available.');
        return;
    }

    // Extract labels and values for the chart (only the first 12 elements)
    const first12Data = predictedData.slice(0, 12); // Get the first 12 elements

    const labels = first12Data.map(row => row.Time); // Labels for the x-axis (first 12 times)
    const energyValues = first12Data.map(row => row.PredictedEnergy); // Predicted energy values (first 12 predictions)

    // Render the chart using the collected predictions
    const ctxHistogram = document.getElementById('energyHistogram').getContext('2d');
    const energyHistogram = new Chart(ctxHistogram, {
        type: 'bar',
        data: {
            labels: labels, // Date and time as labels
            datasets: [{
                label: 'Predicted Energy (kWh)', // Label for the chart
                data: energyValues,              // Predicted energy values
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true, // Ensure x-axis starts at 0
                    title: {
                        display: true, // Show x-axis label
                        text: 'Time (Hours)', // Label text for x-axis
                        font: {
                            size: 14 // Font size for x-axis label
                        }
                    }
                },
                y: {
                    beginAtZero: true, // Ensure y-axis starts at 0
                    title: {
                        display: true, // Show y-axis label
                        text: 'Energy (kWh)', // Label text for y-axis
                        font: {
                            size: 14 // Font size for y-axis label
                        }
                    }
                }
            }
        }
    });
}

// Trigger the chart creation when the page loads
document.addEventListener('DOMContentLoaded', createChart);


////////////////////////////////////////////////////////////////////////////////////////


async function createChartEvolution() {
    const predictedData = await fetchEnergyData();
    
    if (!predictedData || predictedData.length === 0) {
        console.error('No predicted energy data available.');
        return;
    }

    // Extract labels and values for the chart (only the first 12 elements)
    const first12Data = predictedData.slice(0, 12); // Get the first 12 elements

    const labels = first12Data.map(row => row.Time); // Labels for the x-axis (first 12 times)
    const energyValues = first12Data.map(row => row.PredictedEnergy); // Predicted energy values (first 12 predictions)

    // Render the chart using the collected predictions
    const ctxCurve = document.getElementById('energyCurve').getContext('2d');
    const energyCurve = new Chart(ctxCurve, {
        type: 'line',
        data: {
            labels: labels, // Date and time as labels
            datasets: [{
                label: 'Predicted Energy (kWh)', // Label for the chart
                data: energyValues,              // Predicted energy values
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true, // Ensure x-axis starts at 0
                    title: {
                        display: true, // Show x-axis label
                        text: 'Time (Hours)', // Label text for x-axis
                        font: {
                            size: 14 // Font size for x-axis label
                        }
                    }
                },
                y: {
                    beginAtZero: true, // Ensure y-axis starts at 0
                    title: {
                        display: true, // Show y-axis label
                        text: 'Energy (kWh)', // Label text for y-axis
                        font: {
                            size: 14 // Font size for y-axis label
                        }
                    }
                }
            }
        }
    });
}

// Trigger the chart creation when the page loads
document.addEventListener('DOMContentLoaded', createChartEvolution);