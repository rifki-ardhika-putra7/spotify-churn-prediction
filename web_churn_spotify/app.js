document.addEventListener("DOMContentLoaded", () => {
  const churnForm = document.getElementById("churnForm");
  const hasilDiv = document.getElementById("hasil");

  // Pastikan port-nya 8001
  const API_URL = "http://127.0.0.1:8001/predict_churn";

  churnForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hasilDiv.style.display = "none";

    // 2. Ambil semua data dari form BARU
    const dataPelanggan = {
      avg_daily_minutes: parseFloat(
        document.getElementById("avg_daily_minutes").value
      ),
      number_of_playlists: parseInt(
        document.getElementById("number_of_playlists").value
      ),
      skips_per_day: parseInt(document.getElementById("skips_per_day").value),
      support_tickets: parseInt(
        document.getElementById("support_tickets").value
      ),
      days_since_last_login: parseInt(
        document.getElementById("days_since_last_login").value
      ),
      subscription_type: document.getElementById("subscription_type").value,
      country: document.getElementById("country").value,
      top_genre: document.getElementById("top_genre").value,
    };

    console.log("Mengirim data:", dataPelanggan);

    // 3. Kirim data ke API (Kodenya sama persis)
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataPelanggan),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("Menerima data:", data);

        // 4. Tampilkan hasil (Kodenya sama persis)
        hasilDiv.style.display = "block";
        const keyakinan = (data.skor_keyakinan * 100).toFixed(2);

        if (data.prediksi === "Potensi Churn") {
          hasilDiv.className = "churn";
          hasilDiv.innerHTML = `<strong>Prediksi: ${data.prediksi}</strong> (Keyakinan: ${keyakinan}%)`;
        } else {
          hasilDiv.className = "aman";
          hasilDiv.innerHTML = `<strong>Prediksi: ${data.prediksi}</strong> (Keyakinan: ${keyakinan}%)`;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        hasilDiv.style.display = "block";
        hasilDiv.className = "churn";
        hasilDiv.innerText =
          "Error: Gagal terhubung ke API. Pastikan API sudah jalan.";
      });
  });
});
