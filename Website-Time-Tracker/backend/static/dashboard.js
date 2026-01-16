fetch("/api/weekly-data")
  .then((response) => response.json())
  .then((data) => {
    const pieCtx = document.getElementById("pieChart").getContext("2d");
    const barCtx = document.getElementById("barChart").getContext("2d");

    new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Productive", "Unproductive", "Neutral"],
        datasets: [
          {
            data: [data.productive, data.unproductive, data.neutral],
            backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
          },
        ],
      },
    });

    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Productive", "Unproductive", "Neutral"],
        datasets: [
          {
            label: "Time Spent (seconds)",
            data: [data.productive, data.unproductive, data.neutral],
            backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  });
