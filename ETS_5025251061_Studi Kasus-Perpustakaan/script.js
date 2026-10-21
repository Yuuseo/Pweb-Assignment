const STORAGE_KEY = 'libraryreg_members_data';
let deleteTargetId = null;
let isPetugasLoggedIn = false;

// Data awal (Seed Data) jika localStorage masih kosong
const initialMembers = [
    {
        id: 'M001',
        nama: 'Bayu Setyo Nugroho',
        nomorInduk: '5025251061',
        prodi: 'Teknik Informatika',
        alamat: 'Jl. Raya ITS Sukolilo, Surabaya',
        telepon: '081234567890',
        email: 'bayu.25@mhs.kampus.ac.id',
        jenis: 'Mahasiswa'
    },
    {
        id: 'M002',
        nama: 'Dr. Budi Raharjo, M.Kom.',
        nomorInduk: '198203142008121002',
        prodi: 'Sistem Informasi',
        alamat: 'Perum Dosen Blok K-12, Surabaya',
        telepon: '081398765432',
        email: 'budi.raharjo@kampus.ac.id',
        jenis: 'Dosen'
    },
    {
        id: 'M003',
        nama: 'Siti Aminah, S.Sos.',
        nomorInduk: '199007212015042001',
        prodi: 'UPT Perpustakaan Pusat',
        alamat: 'Jl. Mulyosari Timur No. 45, Surabaya',
        telepon: '085611223344',
        email: 'siti.aminah@kampus.ac.id',
        jenis: 'Tenaga Kependidikan'
    }
];

// Ambil data dari localStorage
function getMembers() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMembers));
        return initialMembers;
    }
    return JSON.parse(raw);
}

// Simpan data ke localStorage dan perbarui tabel
function saveMembers(members) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    renderTable();
}

// Tampilkan Notifikasi Toast Keberhasilan atau Kesalahan
function showNotification(message, isError = false) {
    const toastEl = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toastMessage');
    toastEl.classList.remove('text-bg-success', 'text-bg-danger');
    toastEl.classList.add(isError ? 'text-bg-danger' : 'text-bg-success');
    toastMsg.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// Validasi Format Email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validasi Nomor Telepon
function isValidPhone(phone) {
    return /^[0-9+\-\s]{9,16}$/.test(phone);
}

// Sanitasi karakter HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Render Tabel Daftar Anggota
function renderTable() {
    const members = getMembers();
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    const jenisFilter = document.getElementById('filterJenis').value;
    const tbody = document.getElementById('tabelAnggotaBody');

    // Update angka statistik jumlah anggota di Landing Page
    document.getElementById('statTotalAnggota').textContent = members.length;

    const filtered = members.filter(m => {
        const matchKeyword =
            m.nama.toLowerCase().includes(keyword) ||
            m.nomorInduk.toLowerCase().includes(keyword);
        const matchJenis = jenisFilter === '' || m.jenis === jenisFilter;
        return matchKeyword && matchJenis;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-1"></i>
                    Tidak ada data anggota yang sesuai pencarian.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map((m, idx) => {
        let badgeClass = 'bg-primary';
        if (m.jenis === 'Dosen') badgeClass = 'bg-success';
        if (m.jenis === 'Tenaga Kependidikan') badgeClass = 'bg-info text-dark';

        return `
            <tr>
                <td class="ps-4">${idx + 1}</td>
                <td class="fw-semibold">${escapeHtml(m.nomorInduk)}</td>
                <td>${escapeHtml(m.nama)}</td>
                <td>${escapeHtml(m.prodi)}</td>
                <td><span class="badge ${badgeClass}">${escapeHtml(m.jenis)}</span></td>
                <td>${escapeHtml(m.email)}</td>
                <td class="text-center pe-4">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewDetail('${m.id}')" title="Lihat Detail">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="openEditModal('${m.id}')" title="Edit Data">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="openDeleteModal('${m.id}')" title="Hapus Data">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Lihat Detail Anggota
window.viewDetail = function (id) {
    const member = getMembers().find(m => m.id === id);
    if (!member) return;
    document.getElementById('detNama').textContent = member.nama;
    document.getElementById('detNomorInduk').textContent = member.nomorInduk;
    document.getElementById('detJenis').textContent = member.jenis;
    document.getElementById('detProdi').textContent = member.prodi;
    document.getElementById('detTelepon').textContent = member.telepon;
    document.getElementById('detEmail').textContent = member.email;
    document.getElementById('detAlamat').textContent = member.alamat;
    new bootstrap.Modal(document.getElementById('detailModal')).show();
};

// Buka Modal Edit Anggota
window.openEditModal = function (id) {
    const member = getMembers().find(m => m.id === id);
    if (!member) return;
    document.getElementById('editId').value = member.id;
    document.getElementById('editNama').value = member.nama;
    document.getElementById('editNomorInduk').value = member.nomorInduk;
    document.getElementById('editJenis').value = member.jenis;
    document.getElementById('editProdi').value = member.prodi;
    document.getElementById('editTelepon').value = member.telepon;
    document.getElementById('editEmail').value = member.email;
    document.getElementById('editAlamat').value = member.alamat;

    ['editNama', 'editNomorInduk', 'editProdi', 'editTelepon', 'editEmail', 'editAlamat'].forEach(fieldId => {
        document.getElementById(fieldId).classList.remove('is-invalid');
    });

    new bootstrap.Modal(document.getElementById('editModal')).show();
};

// Buka Modal Konfirmasi Hapus
window.openDeleteModal = function (id) {
    const member = getMembers().find(m => m.id === id);
    if (!member) return;
    deleteTargetId = id;
    document.getElementById('delNamaTarget').textContent = member.nama;
    document.getElementById('delNimTarget').textContent = member.nomorInduk;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
};

// Inisialisasi seluruh Event Listener setelah DOM siap
document.addEventListener('DOMContentLoaded', function () {
    renderTable();

    // Event Submit Formulir Pendaftaran Anggota Baru
    document.getElementById('formPendaftaran').addEventListener('submit', function (e) {
        e.preventDefault();

        const nama = document.getElementById('regNama');
        const nomorInduk = document.getElementById('regNomorInduk');
        const jenis = document.getElementById('regJenis');
        const prodi = document.getElementById('regProdi');
        const telepon = document.getElementById('regTelepon');
        const email = document.getElementById('regEmail');
        const alamat = document.getElementById('regAlamat');

        let valid = true;
        const members = getMembers();

        // Reset status validasi
        [nama, nomorInduk, jenis, prodi, telepon, email, alamat].forEach(el => el.classList.remove('is-invalid'));

        if (!nama.value.trim()) { nama.classList.add('is-invalid'); valid = false; }
        if (!jenis.value) { jenis.classList.add('is-invalid'); valid = false; }
        if (!prodi.value.trim()) { prodi.classList.add('is-invalid'); valid = false; }
        if (!isValidPhone(telepon.value.trim())) { telepon.classList.add('is-invalid'); valid = false; }
        if (!isValidEmail(email.value.trim())) { email.classList.add('is-invalid'); valid = false; }
        if (!alamat.value.trim()) { alamat.classList.add('is-invalid'); valid = false; }

        // Validasi Kolom Wajib & Keunikan NIM/NIP
        const nimVal = nomorInduk.value.trim();
        const isDuplicate = members.some(m => m.nomorInduk.toLowerCase() === nimVal.toLowerCase());
        if (!nimVal) {
            document.getElementById('feedbackNomorInduk').textContent = 'NIM/NIP wajib diisi.';
            nomorInduk.classList.add('is-invalid');
            valid = false;
        } else if (isDuplicate) {
            document.getElementById('feedbackNomorInduk').textContent = 'NIM/NIP sudah terdaftar! Gunakan nomor induk lain.';
            nomorInduk.classList.add('is-invalid');
            valid = false;
        }

        if (!valid) {
            showNotification('Mohon periksa kembali kolom pendaftaran yang belum valid.', true);
            return;
        }

        const newMember = {
            id: 'M' + Date.now(),
            nama: nama.value.trim(),
            nomorInduk: nimVal,
            jenis: jenis.value,
            prodi: prodi.value.trim(),
            telepon: telepon.value.trim(),
            email: email.value.trim(),
            alamat: alamat.value.trim()
        };

        members.push(newMember);
        saveMembers(members);
        this.reset();
        showNotification('Pendaftaran anggota berhasil disimpan!');
        document.getElementById('daftar-anggota').scrollIntoView({ behavior: 'smooth' });
    });

    // Event Submit Edit Data Anggota
    document.getElementById('formEditAnggota').addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const nama = document.getElementById('editNama');
        const nomorInduk = document.getElementById('editNomorInduk');
        const jenis = document.getElementById('editJenis');
        const prodi = document.getElementById('editProdi');
        const telepon = document.getElementById('editTelepon');
        const email = document.getElementById('editEmail');
        const alamat = document.getElementById('editAlamat');

        let valid = true;
        const members = getMembers();

        [nama, nomorInduk, prodi, telepon, email, alamat].forEach(el => el.classList.remove('is-invalid'));

        if (!nama.value.trim()) { nama.classList.add('is-invalid'); valid = false; }
        if (!prodi.value.trim()) { prodi.classList.add('is-invalid'); valid = false; }
        if (!isValidPhone(telepon.value.trim())) { telepon.classList.add('is-invalid'); valid = false; }
        if (!isValidEmail(email.value.trim())) { email.classList.add('is-invalid'); valid = false; }
        if (!alamat.value.trim()) { alamat.classList.add('is-invalid'); valid = false; }

        const nimVal = nomorInduk.value.trim();
        const isDuplicate = members.some(m => m.id !== id && m.nomorInduk.toLowerCase() === nimVal.toLowerCase());
        if (!nimVal || isDuplicate) {
            nomorInduk.classList.add('is-invalid');
            valid = false;
        }

        if (!valid) {
            showNotification('Gagal memperbarui data. Periksa input yang tidak valid.', true);
            return;
        }

        const idx = members.findIndex(m => m.id === id);
        if (idx !== -1) {
            members[idx] = {
                id,
                nama: nama.value.trim(),
                nomorInduk: nimVal,
                jenis: jenis.value,
                prodi: prodi.value.trim(),
                telepon: telepon.value.trim(),
                email: email.value.trim(),
                alamat: alamat.value.trim()
            };
            saveMembers(members);
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            showNotification('Data anggota berhasil diperbarui!');
        }
    });

    // Event Konfirmasi Hapus Data Anggota
    document.getElementById('btnConfirmDelete').addEventListener('click', function () {
        if (!deleteTargetId) return;
        const members = getMembers().filter(m => m.id !== deleteTargetId);
        saveMembers(members);
        deleteTargetId = null;
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        showNotification('Data anggota berhasil dihapus.');
    });

    // Event Simulasi Login Petugas
    document.getElementById('formLoginPetugas').addEventListener('submit', function (e) {
        e.preventDefault();
        const user = document.getElementById('loginUser').value.trim();
        isPetugasLoggedIn = true;
        document.getElementById('authStatusText').textContent = 'Petugas: ' + user;
        document.getElementById('badgeModePetugas').className = 'badge bg-success py-2 px-3';
        document.getElementById('badgeModePetugas').innerHTML = `<i class="bi bi-person-check-fill me-1"></i>Petugas Aktif (${escapeHtml(user)})`;
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        showNotification(`Selamat datang, Petugas ${user}!`);
        this.reset();
    });

    // Event Pencarian & Filter Real-Time
    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('filterJenis').addEventListener('change', renderTable);

    // Event Penanda Menu Aktif pada Navbar
    const navLinks = document.querySelectorAll('#mainNavbar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
