let transaksi = JSON.parse(localStorage.getItem("financialFlow")) || [];

let anggaran =
  Number(localStorage.getItem("financialFlowAnggaran")) || 0;

const tombolSimpan =
  document.getElementById("simpanTransaksi");

tombolSimpan.addEventListener("click", function () {

  const jenis =
    document.getElementById("jenis").value;

  const nama =
    document.getElementById("nama").value;

  const kategori =
    document.getElementById("kategori").value;

  const metode =
    document.getElementById("metode").value;

  const nominal =
    Number(document.getElementById("nominal").value);

  const tanggal =
    document.getElementById("tanggal").value;

  if (!nama || !nominal || !tanggal) {

    alert("Mohon lengkapi semua data transaksi.");

    return;
  }

  transaksi.push({
    jenis: jenis,
    nama: nama,
    kategori: kategori,
    metode: metode,
    nominal: nominal,
    tanggal: tanggal
  });

  simpanData();

  updateFilterBulan();

  updateFinancialFlow();

  document.getElementById("nama").value = "";
  document.getElementById("nominal").value = "";
  document.getElementById("tanggal").value = "";

});


function simpanData() {

  localStorage.setItem(
    "financialFlow",
    JSON.stringify(transaksi)
  );

}


function updateFinancialFlow() {
  

  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  transaksi.forEach(function (item) {

    if (item.jenis === "pemasukan") {
      totalPemasukan += item.nominal;
    }

    if (item.jenis === "pengeluaran") {
      totalPengeluaran += item.nominal;
    }

  });

  const saldo =
    totalPemasukan - totalPengeluaran;

  document.getElementById("pemasukan").textContent =
    formatRupiah(totalPemasukan);

  document.getElementById("pengeluaran").textContent =
    formatRupiah(totalPengeluaran);

  document.getElementById("saldo").textContent =
    formatRupiah(saldo);

  tampilkanTransaksi();

  updateGrafik(
    totalPemasukan,
    totalPengeluaran
  );

  updateAnggaran();

}


function tampilkanTransaksi() {

  const daftar =
    document.getElementById("daftarTransaksi");

  daftar.innerHTML = "";

  const filter =
    document.getElementById("filterBulan").value;

  if (transaksi.length === 0) {

    daftar.innerHTML =
      '<p class="kosong">Belum ada transaksi</p>';

    return;
  }

  let adaTransaksi = false;

  transaksi.forEach(function (item, index) {

    if (
      filter !== "semua" &&
      (!item.tanggal ||
       !item.tanggal.startsWith(filter))
    ) {
      return;
    }

    adaTransaksi = true;

    const div =
      document.createElement("div");

    div.className =
      "transaksi-item";

    const metode =
      item.metode || "Belum dipilih";

    const jenisTransaksi =
      item.jenis === "pemasukan"
        ? "Pemasukan"
        : "Pengeluaran";

    const kelasJenis =
      item.jenis === "pemasukan"
        ? "label-pemasukan"
        : "label-pengeluaran";

    div.innerHTML = `
      <div class="transaksi-header">

        <div class="transaksi-nama">
          ${item.nama}
        </div>

        <div class="transaksi-nominal">
          ${formatRupiah(item.nominal)}
        </div>

      </div>

      <span class="label-transaksi ${kelasJenis}">
        ${jenisTransaksi}
      </span>

      <div class="transaksi-info">
        ${item.kategori} • ${metode} • ${item.tanggal}
      </div>

      <div class="transaksi-tombol">

        <button
          class="transaksi-edit"
          onclick="editTransaksi(${index})">
          Edit
        </button>

        <button
          class="transaksi-hapus"
          onclick="hapusTransaksi(${index})">
          Hapus
        </button>

      </div>
    `;

    daftar.appendChild(div);

  });

  if (!adaTransaksi) {

    daftar.innerHTML =
      '<p class="kosong">Tidak ada transaksi pada bulan ini</p>';

  }

}


function editTransaksi(index) {

  const item =
    transaksi[index];

  document.getElementById("jenis").value =
    item.jenis;

  document.getElementById("nama").value =
    item.nama;

  document.getElementById("kategori").value =
    item.kategori;

  document.getElementById("metode").value =
    item.metode || "Cash";

  document.getElementById("nominal").value =
    item.nominal;

  document.getElementById("tanggal").value =
    item.tanggal;

  transaksi.splice(index, 1);

  simpanData();

  updateFilterBulan();

  updateFinancialFlow();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function hapusTransaksi(index) {

  const yakin =
    confirm(
      "Yakin ingin menghapus transaksi ini?"
    );

  if (!yakin) {
    return;
  }

  transaksi.splice(index, 1);

  simpanData();

  updateFilterBulan();

  updateFinancialFlow();

}


function formatRupiah(angka) {

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);

}


function updateGrafik(
  pemasukan,
  pengeluaran
) {

  const barPemasukan =
    document.getElementById("barPemasukan");

  const barPengeluaran =
    document.getElementById("barPengeluaran");

  const total =
    pemasukan + pengeluaran;

  if (total === 0) {

    barPemasukan.style.height =
      "5px";

    barPengeluaran.style.height =
      "5px";

    return;
  }

  const tinggiPemasukan =
    (pemasukan / total) * 150;

  const tinggiPengeluaran =
    (pengeluaran / total) * 150;

  barPemasukan.style.height =
    tinggiPemasukan + "px";

  barPengeluaran.style.height =
    tinggiPengeluaran + "px";

}


function updateFilterBulan() {

  const select =
    document.getElementById("filterBulan");

  const nilaiSekarang =
    select.value;

  const daftarBulan = [
    ...new Set(
      transaksi
        .map(function (item) {

          return item.tanggal
            ? item.tanggal.slice(0, 7)
            : null;

        })
        .filter(Boolean)
    )
  ];

  daftarBulan.sort().reverse();

  select.innerHTML =
    '<option value="semua">Semua Transaksi</option>';

  daftarBulan.forEach(function (bulanValue) {

    const [tahun, bulanNomor] =
      bulanValue.split("-");

    const namaBulan =
      new Intl.DateTimeFormat("id-ID", {
        month: "long"
      }).format(
        new Date(
          Number(tahun),
          Number(bulanNomor) - 1,
          1
        )
      );

    const option =
      document.createElement("option");

    option.value =
      bulanValue;

    option.textContent =
      namaBulan + " " + tahun;

    select.appendChild(option);

  });

  if (
    daftarBulan.includes(nilaiSekarang)
  ) {

    select.value =
      nilaiSekarang;

  } else {

    select.value =
      "semua";

  }

}


document
  .getElementById("filterBulan")
  .addEventListener(
    "change",
    function () {

      tampilkanTransaksi();

    }
  );


document
  .getElementById("simpanAnggaran")
  .addEventListener(
    "click",
    function () {

      const nilaiAnggaran =
        Number(
          document.getElementById("anggaran").value
        );

      if (
        !nilaiAnggaran ||
        nilaiAnggaran <= 0
      ) {

        alert(
          "Masukkan nominal anggaran yang valid."
        );

        return;
      }

      anggaran =
        nilaiAnggaran;

      localStorage.setItem(
        "financialFlowAnggaran",
        anggaran
      );

      updateAnggaran();

    }
  );


function updateAnggaran() {

  const anggaranTersimpan =
    Number(
      localStorage.getItem(
        "financialFlowAnggaran"
      )
    ) || 0;

  let totalPengeluaran =
    0;

  transaksi.forEach(function (item) {

    if (
      item.jenis === "pengeluaran"
    ) {

      totalPengeluaran +=
        item.nominal;

    }

  });

  const sisa =
    anggaranTersimpan -
    totalPengeluaran;

  document.getElementById(
    "totalAnggaran"
  ).textContent =
    formatRupiah(
      anggaranTersimpan
    );

  document.getElementById(
    "terpakaiAnggaran"
  ).textContent =
    formatRupiah(
      totalPengeluaran
    );

  document.getElementById(
    "sisaAnggaran"
  ).textContent =
    formatRupiah(
      sisa
    );

  document.getElementById(
    "anggaran"
  ).value =
    anggaranTersimpan || "";

}


updateFilterBulan();

updateFinancialFlow();

updateAnggaran();
// ===============================
// TARGET TABUNGAN
// ===============================

let targetTabunganData =
  JSON.parse(
    localStorage.getItem("financialFlowTarget")
  ) || null;


document
  .getElementById("simpanTarget")
  .addEventListener(
    "click",
    function () {

      const namaTarget =
        document.getElementById("namaTarget").value;

      const target =
        Number(
          document.getElementById("targetTabungan").value
        );

      const terkumpul =
        Number(
          document.getElementById("tabunganTerkumpul").value
        );

      if (
        !namaTarget ||
        !target ||
        target <= 0 ||
        terkumpul < 0
      ) {

        alert(
          "Mohon isi data target tabungan dengan benar."
        );

        return;
      }

      if (terkumpul > target) {

        alert(
          "Tabungan terkumpul tidak boleh lebih besar dari target."
        );

        return;
      }

     targetTabunganData = {
  nama: namaTarget,
  target: target,
  terkumpul: terkumpul,
  awal: terkumpul
}

      localStorage.setItem(
        "financialFlowTarget",
        JSON.stringify(targetTabunganData)
      );

      tampilkanTargetTabungan();

    }
  );


function tampilkanTargetTabungan() {

  const hasil =
    document.getElementById("hasilTarget");

  if (!targetTabunganData) {

    hasil.innerHTML =
      '<p class="kosong">Belum ada target tabungan</p>';

    return;
  }

  const target =
    targetTabunganData.target;

  const terkumpul =
    targetTabunganData.terkumpul;

  const sisa =
    target - terkumpul;

  const progress =
    (terkumpul / target) * 100;

  hasil.innerHTML = `

    <div class="target-hasil">

      <div class="target-header">

        <strong>
          🎯 ${targetTabunganData.nama}
        </strong>

      </div>

      <div class="target-info">

        <span>Target</span>

        <strong>
          ${formatRupiah(target)}
        </strong>

      </div>

      <div class="target-info">

        <span>Terkumpul</span>

        <strong>
          ${formatRupiah(terkumpul)}
        </strong>

      </div>

      <div class="target-info">

        <span>Sisa</span>

        <strong>
          ${formatRupiah(sisa)}
        </strong>

      </div>

      <div class="target-progress">

        <div
          class="target-progress-bar"
          style="width: ${progress}%">
        </div>

      </div>

      <div class="target-persentase">
        ${progress.toFixed(1)}% tercapai
      </div>

    </div>

  `;

}


tampilkanTargetTabungan();
function updateTargetDariTransaksi() {

  if (!targetTabunganData) {
    return;
  }

  let totalTabungan =
    targetTabunganData.awal || 0;

  transaksi.forEach(function (item) {

    if (
      item.jenis === "pengeluaran" &&
      item.kategori === "Tabungan"
    ) {

      totalTabungan += item.nominal;

    }

  });

  targetTabunganData.terkumpul =
    totalTabungan;

  localStorage.setItem(
    "financialFlowTarget",
    JSON.stringify(targetTabunganData)
  );

  tampilkanTargetTabungan();

}
updateTargetDariTransaksi();
