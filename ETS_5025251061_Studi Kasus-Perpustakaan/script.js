const STORAGE_KEY = 'libraryreg_members_data';
let deleteTargetId = null;

// Data awal jika localStorage kosong
const initialMembers = [
    {
        id: '1',
        nama: 'Bayu Setyo Nugroho',
        nomorInduk: '5025251061',
        prodi: 'Teknik Informatika',
        alamat: 'Sukolilo, Surabaya',
        telepon: '081234567890',
        email: 'bayu@kampus.ac.id',
        jenis: 'Mahasiswa'
    },
    {
        id: '2',
        nama: 'Budi Santoso',
        nomorInduk: '198501012010121001',
        prodi: 'Sistem Informasi',
        alamat: 'Mulyosari, Surabaya',
        telepon: '081398765432',
        email: 'budi@kampus.ac.id',
        jenis: 'Dosen'
    }
];

function getMembers() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMembers));
        return initialMembers;
    }
    return JSON.parse(data);
}

function saveMembers(members) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    renderTable();
}

// Menampilkan notifikasi keberhasilan atau kesalahan
function showNotification(message, isError = false) {
    const alertBox = document.getElementById('alertBox');
    alertBox.className = isError ? 'alert alert-danger' : 'alert alert-success';
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');

    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 3500);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderTable() {
    const members = getMembers();
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    const jenisFilter = document.getElementById('filterJenis').value;
    const tbody = document.getElementById('tabelAnggotaBody');

    document.getElementById('statTotalAnggota').textContent = members.length;

    const filtered = members.filter(m => {
        const matchKeyword =
            m.nama.toLowerCase().includes(keyword) ||
            m.nomorInduk.toLowerCase().includes(keyword);
        const matchJenis = jenisFilter === '' || m.jenis === jenisFilter;
        return matchKeyword && matchJenis;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Data tidak ditemukan.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map((m, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${m.nomorInduk}</td>
            <td>${m.nama}</td>
            <td>${m.prodi}</td>
            <td>${m.jenis}</td>
            <td>${m.email}</td>
            <td>
                <button class="btn btn-info btn-sm text-white" onclick="viewDetail('${m.id}')">Detail</button>
                <button class="btn btn-warning btn-sm" onclick="openEditModal('${m.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${m.id}')">Hapus</button>
            </td>
        </tr>
    `).join('');
}

window.viewDetail = function (id) {
    const member = getMembers().find(m => m.id === id);
    if (!member) return;
    document.getElementById('detNama').textContent = member.nama;
    document.getElementById('detNomorInduk').textContent = member.nomorInduk;
    document.getElementById('detProdi').textContent = member.prodi;
    document.getElementById('detJenis').textContent = member.jenis;
    document.getElementById('detTelepon').textContent = member.telepon;
    document.getElementById('detEmail').textContent = member.email;
    document.getElementById('detAlamat').textContent = member.alamat;
    new bootstrap.Modal(document.getElementById('detailModal')).show();
};

window.openEditModal = function (id) {
    const member = getMembers().find(m => m.id === id);
    if (!member) return;
    document.getElementById('editId').value = member.id;
    document.getElementById('editNama').value = member.nama;
    document.getElementById('editNomorInduk').value = member.nomorInduk;
    document.getElementById('editProdi').value = member.prodi;
    document.getElementById('editJenis').value = member.jenis;
    document.getElementById('editTelepon').value = member.telepon;
    document.getElementById('editEmail').value = member.email;
    document.getElementById('editAlamat').value = member.alamat;
    new bootstrap.Modal(document.getElementById('editModal')).show();
};

window.openDeleteModal = function (id) {
    const member = getMembers().find(m => m.id === id);
    if (!member) return;
    deleteTargetId = id;
    document.getElementById('delNamaTarget').textContent = member.nama;
    document.getElementById('delNimTarget').textContent = member.nomorInduk;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
};

document.addEventListener('DOMContentLoaded', function () {
    renderTable();

    // Tambah Anggota
    document.getElementById('formPendaftaran').addEventListener('submit', function (e) {
        e.preventDefault();
        const nama = document.getElementById('regNama');
        const nomorInduk = document.getElementById('regNomorInduk');
        const prodi = document.getElementById('regProdi');
        const jenis = document.getElementById('regJenis');
        const telepon = document.getElementById('regTelepon');
        const email = document.getElementById('regEmail');
        const alamat = document.getElementById('regAlamat');

        let valid = true;
        const members = getMembers();

        [nama, nomorInduk, prodi, jenis, telepon, email, alamat].forEach(el => el.classList.remove('is-invalid'));

        if (!nama.value.trim()) { nama.classList.add('is-invalid'); valid = false; }
        if (!prodi.value.trim()) { prodi.classList.add('is-invalid'); valid = false; }
        if (!jenis.value) { jenis.classList.add('is-invalid'); valid = false; }
        if (!telepon.value.trim()) { telepon.classList.add('is-invalid'); valid = false; }
        if (!isValidEmail(email.value.trim())) { email.classList.add('is-invalid'); valid = false; }
        if (!alamat.value.trim()) { alamat.classList.add('is-invalid'); valid = false; }

        const nimVal = nomorInduk.value.trim();
        const isDuplicate = members.some(m => m.nomorInduk.toLowerCase() === nimVal.toLowerCase());
        if (!nimVal || isDuplicate) {
            nomorInduk.classList.add('is-invalid');
            valid = false;
        }

        if (!valid) {
            showNotification('Gagal menyimpan! Pastikan semua kolom terisi benar dan NIM/NIP belum terdaftar.', true);
            return;
        }

        members.push({
            id: String(Date.now()),
            nama: nama.value.trim(),
            nomorInduk: nimVal,
            prodi: prodi.value.trim(),
            jenis: jenis.value,
            telepon: telepon.value.trim(),
            email: email.value.trim(),
            alamat: alamat.value.trim()
        });

        saveMembers(members);
        this.reset();
        showNotification('Pendaftaran anggota berhasil disimpan.');
    });

    // Simpan Edit
    document.getElementById('formEditAnggota').addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const nama = document.getElementById('editNama').value.trim();
        const nomorInduk = document.getElementById('editNomorInduk').value.trim();
        const prodi = document.getElementById('editProdi').value.trim();
        const jenis = document.getElementById('editJenis').value;
        const telepon = document.getElementById('editTelepon').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const alamat = document.getElementById('editAlamat').value.trim();

        const members = getMembers();
        const isDuplicate = members.some(m => m.id !== id && m.nomorInduk.toLowerCase() === nomorInduk.toLowerCase());

        if (!nama || !nomorInduk || !prodi || !telepon || !isValidEmail(email) || !alamat || isDuplicate) {
            showNotification('Gagal mengedit data! Pastikan semua kolom valid dan NIM/NIP tidak ganda.', true);
            return;
        }

        const idx = members.findIndex(m => m.id === id);
        if (idx !== -1) {
            members[idx] = { id, nama, nomorInduk, prodi, jenis, telepon, email, alamat };
            saveMembers(members);
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            showNotification('Data anggota berhasil diperbarui.');
        }
    });

    // Hapus Anggota
    document.getElementById('btnConfirmDelete').addEventListener('click', function () {
        if (!deleteTargetId) return;
        const members = getMembers().filter(m => m.id !== deleteTargetId);
        saveMembers(members);
        deleteTargetId = null;
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        showNotification('Data anggota berhasil dihapus.');
    });

    // Login Petugas
    document.getElementById('formLoginPetugas').addEventListener('submit', function (e) {
        e.preventDefault();
        const user = document.getElementById('loginUser').value.trim();
        document.getElementById('authStatusText').textContent = 'Petugas: ' + user;
        document.getElementById('badgeModePetugas').textContent = 'Status: Petugas (' + user + ')';
        document.getElementById('badgeModePetugas').className = 'badge bg-success';
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        showNotification('Login petugas berhasil.');
        this.reset();
    });

    // Pencarian & Filter
    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('filterJenis').addEventListener('change', renderTable);

    // Penanda Menu Aktif
    const navLinks = document.querySelectorAll('#mainNavbar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});