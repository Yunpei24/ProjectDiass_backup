document.addEventListener("DOMContentLoaded", function() {
    
    // Fonction pour récupérer les données du formulaire
    function getFormData(Date, Heure, meteoIrradiance, ensoleillement) {
        const prTotalCompteurs = parseFloat(document.getElementById('prTotalCompteurs').value);
        const prReference = parseFloat(document.getElementById('prReference').value);
        const nombrePanneau = parseInt(document.getElementById('nombrePanneau').value);
        const nombreOnduleur = parseInt(document.getElementById('nombreOnduleur').value);
    
        // Retourne les données du formulaire avec les paramètres supplémentaires
        return {
            Date,               // Date passée en paramètre
            Heure,              // Heure passée en paramètre
            meteoIrradiance,    // Irradiance météo passée en paramètre
            prTotalCompteurs,
            ensoleillement,
            prReference,
            nombrePanneau,
            nombreOnduleur
        };
    }
    

    // Fonction pour envoyer une requête POST à l'API et récupérer les données
    async function fetchPredictedEnergy(data) {
        try {
            const response = await fetch('http://127.0.0.1:8000/predict/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Date: data.Date,
                    Heures: data.Heure,
                    Meteo_Irradience: data.meteoIrradiance,
                    PR_Total_Compteurs: data.prTotalCompteurs,
                    Ensoleillement: data.ensoleillement,
                    PR_Reference: data.prReference,
                    Nombre_Panneau: data.nombrePanneau,
                    Nombre_Onduleur: data.nombreOnduleur
                })
            });

            let predictedEnergyArray = [];

            const resultData = await response.json();
            predictedEnergyArray.push({
                PredictedEnergy: resultData.predicted_energy, // Predicted energy from API
                Time: resultData.Time           // Time of prediction
            });
            return predictedEnergyArray;

        } catch (error) {
            console.error('Error fetching predicted energy:', error);
            return null;
        }
    }

    // Fonction pour afficher le résultat dans le DOM
    // function displayPredictionResult(predictedEnergy) {
    //     const result = document.getElementById('predictedEnergy');
    //     result.textContent = `Énergie prédite: ${predictedEnergy} kWh`;
    // }

    // Fonction pour afficher la section des graphiques
    function showChartsSection() {
        const chartsSection = document.getElementById('chartsSection');
        chartsSection.style.display = 'block';
    }

    // Fonction pour dessiner le graphique
    function drawChart(dataPoints) {
        const ctx = document.getElementById('energyCurve').getContext('2d');
        const labels = [];
        const energyValues = [];

        dataPoints.forEach(point => {
            labels.push(point[0].Time);
            energyValues.push(point[0].PredictedEnergy);
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, // Labels for the chart
                datasets: [{
                    label: 'Énergie (kWh)',
                    data: energyValues, // Les données provenant de l'API
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: true,
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

    function getCurrentDate() {
        const today = new Date();
    
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');  // Ajouter un zéro pour les mois 1 à 9
        const day = String(today.getDate()).padStart(2, '0');         // Ajouter un zéro pour les jours 1 à 9
    
        return `${year}-${month}-${day}`;
    }

    // Fonction principale qui est exécutée lors du clic du bouton
    async function handlePrediction(event) {
        event.preventDefault();  // Empêcher le rechargement de la page

        let data_complete = [
            ['08:00:00', 150, 1.2], 
            ['09:00:00', 250, 2.0],
            ['10:00:00', 400, 3.0],
            ['11:00:00', 600, 4.5],
            ['12:00:00', 800, 5.8],
            ['13:00:00', 750, 5.2],
            ['14:00:00', 600, 4.5],
            ['15:00:00', 400, 3.0],
            ['16:00:00', 300, 2.0],
            ['17:00:00', 200, 1.0]
        ];
        let dataForChart = []
        for (let subArray of data_complete) {
            let time = subArray[0];
            let meteo_Irradiance = subArray[1];
            let ensoleillement = subArray[2];
            let date = getCurrentDate();

            // 1. Récupérer les données du formulaire
            const formData = getFormData(date, time, meteo_Irradiance, ensoleillement);

            // 2. Envoyer les données à l'API et obtenir la prédiction
            const predictedEnergy = await fetchPredictedEnergy(formData);

            // 3. Afficher la prédiction dans la page
            if (predictedEnergy !== null) {
                dataForChart.push(predictedEnergy);
            } else {
                console.error("Impossible de prédire l'énergie.");
            }
        }

        // 4. Afficher la section des graphiques
        showChartsSection();

        // 5. Dessiner le graphique avec les données prédites
        drawChart(dataForChart);
    }

    // Attacher l'événement de clic au formulaire
    const form = document.getElementById('predictionForm');
    form.addEventListener('submit', handlePrediction);
});
