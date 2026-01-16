document.getElementById("load").addEventListener("click", async () => {
    let response = await fetch("http://127.0.0.1:5000/weekly-report");
    let data = await response.json();

    let reportDiv = document.getElementById("report");
    reportDiv.innerHTML = "";

    for (let key in data) {
        reportDiv.innerHTML += `<p><b>${key}</b>: ${data[key]} seconds</p>`;
    }
});
