const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJNFhKw_SPAgVhZgYkcCZ3utTkelY2VQBnvcgepMawQG4hCHSUH5pZLCiYqk0pEIMrEw/exec"; 

const listSurah = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Thaha",
  "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qashash", "Al-Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fathir", "Yasin", "As-Shaffat", "Shad", "Az-Zumar", "Ghafir",
  "Fushshilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adz-Dzariyat", "Ath-Thur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hasyr", "Al-Mumtahanah",
  "As-Shaff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "Ath-Thalaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddatstsir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infitar", "Al-Muthaffifin", "Al-Insyiqaq", "Al-Buruj", "Ath-Thariq", "Al-A'la", "Al-Ghasyiyah", "Al-Fajr", "Al-Balad",
  "Asy-Syams", "Al-Lail", "Ad-Dhuha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
  "Al-Qari'ah", "At-Takasur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nashr",
  "Al-Lahab", "Al-Ikhlash", "Al-Falaq", "An-Nas"
];

document.addEventListener("DOMContentLoaded", function() {
    populateSurahDropdown();
    ambilDataDariSheet();
});

function populateSurahDropdown() {
    const selectEl = document.getElementById("surahInput");
    listSurah.forEach((surah, index) => {
        const option = document.createElement("option");
        option.value = `${index + 1}. ${surah}`;
        option.textContent = `${index + 1}. ${surah}`;
        selectEl.appendChild(option);
    });
}

// Mengambil data baris terakhir & 10 log terakhir dari Google Sheets
function ambilDataDariSheet() {
    const payload = { action: "ambil" };

    fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(res => {
        if (res.status === "success") {
            const data = res.data;
            
            // 1. Tampilkan data terakhir di kotak hijau atas
            document.getElementById("lastSurah").innerText = data.surah;
            document.getElementById("lastAyat").innerText = data.ayat !== "-" ? "Ayat " + data.ayat : "-";
            document.getElementById("lastJuz").innerText = data.juz !== "-" ? "Juz " + data.juz : "-";
            document.getElementById("lastUpdated").innerText = data.waktu;
            
            // 2. Tampilkan 10 Log Terakhir ke tabel
            tampilkanTabelLog(res.logs);
        } else {
            console.error("Gagal memuat data:", res.message);
        }
    })
    .catch(error => {
        console.error("Error Fetch data:", error);
    });
}

function tampilkanTabelLog(logs) {
    const tbody = document.getElementById("logTableBody");
    tbody.innerHTML = ""; // Bersihkan loading text

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-log">Belum ada riwayat membaca.</td></tr>`;
        return;
    }

    logs.forEach(log => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${log.waktu}</td>
            <td><strong>${log.surah}</strong></td>
            <td>Ayat ${log.ayat}</td>
            <td>Juz ${log.juz}</td>
        `;
        tbody.appendChild(tr);
    });
}

function simpanProgres() {
    const surah = document.getElementById("surahInput").value;
    const ayat = document.getElementById("ayatInput").value.trim();
    const juz = document.getElementById("juzInput").value.trim() || "-";
    const btn = document.getElementById("btnSimpan");
    
    if (!surah) {
        alert("Mohon pilih Nama Surah terlebih dahulu!");
        return;
    }
    if (!ayat) {
        alert("Mohon isi Ayat Terakhir yang selesai dibaca!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Menyimpan ke Cloud...";

    const payload = {
        action: "simpan",
        data: {
            surah: surah,
            ayat: ayat,
            juz: juz
        }
    };

    fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(res => {
        btn.disabled = false;
        btn.innerText = "Simpan Progres";
        
        if (res.status === "success") {
            document.getElementById("surahInput").value = "";
            document.getElementById("ayatInput").value = "";
            document.getElementById("juzInput").value = "";
            
            alert(res.message);
            ambilDataDariSheet(); // Segarkan tampilan dashboard dan tabel log
        } else {
            alert("Error: " + res.message);
        }
    })
    .catch(error => {
        btn.disabled = false;
        btn.innerText = "Simpan Progres";
        console.error("Error menyimpan data:", error);
        alert("Terjadi kesalahan koneksi saat menyimpan data.");
    });
}
