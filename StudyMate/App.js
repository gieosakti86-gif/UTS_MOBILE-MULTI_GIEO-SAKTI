
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// =====================================
// 1. DATA AWAL
// =====================================

const jadwalAwal = [
  {
    id: 'jadwal-1',
    hari: 'Senin',
    kegiatan: 'Belajar Pemrograman Mobile',
    jam: '08.00 - 10.00'
  },
  {
    id: 'jadwal-2',
    hari: 'Selasa',
    kegiatan: 'Belajar Pemrograman Web',
    jam: '09.00 - 11.00'
  },
  {
    id: 'jadwal-3',
    hari: 'Rabu',
    kegiatan: 'Mengerjakan Tugas Kuliah',
    jam: '13.00 - 15.00'
  },
  {
    id: 'jadwal-4',
    hari: 'Kamis',
    kegiatan: 'Membaca Materi Perkuliahan',
    jam: '08.00 - 09.00'
  },
  {
    id: 'jadwal-5',
    hari: 'Jumat',
    kegiatan: 'Mengulang Materi',
    jam: '14.00 - 16.00'
  }
];

const TaskContext = createContext();
const Tab = createBottomTabNavigator();

// =====================================
// 2. CONTEXT DAN PENYIMPANAN DATA
// =====================================

function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [jadwal, setJadwal] = useState(jadwalAwal);
  const [namaMahasiswa, setNamaMahasiswa] = useState('Mahasiswa');
  const [programStudi, setProgramStudi] = useState('');
  const [siap, setSiap] = useState(false);

  // Memuat data dari penyimpanan HP
  useEffect(() => {
    async function muatData() {
      try {
        const hasil = await AsyncStorage.multiGet([
          'tasks',
          'jadwal',
          'namaMahasiswa',
          'programStudi'
        ]);

        const data = Object.fromEntries(hasil);

        if (data.tasks) {
          const tugasTersimpan = JSON.parse(data.tasks);

          // Menyesuaikan format tugas lama dan baru
          const tugasNormal = Array.isArray(tugasTersimpan)
            ? tugasTersimpan.map(item => ({
              ...item,
              nama: item.nama || item.judul || 'Tugas',
              tanggal: item.tanggal || 'Belum ditentukan',
              selesai: Boolean(item.selesai)
            }))
            : [];

          setTasks(tugasNormal);
        }

        if (data.jadwal) {
          const jadwalTersimpan = JSON.parse(data.jadwal);
          setJadwal(
            Array.isArray(jadwalTersimpan)
              ? jadwalTersimpan
              : jadwalAwal
          );
        }

        if (data.namaMahasiswa) {
          setNamaMahasiswa(data.namaMahasiswa);
        }

        if (data.programStudi) {
          setProgramStudi(data.programStudi);
        }
      } catch (error) {
        console.log('Kesalahan memuat data:', error);
      } finally {
        setSiap(true);
      }
    }

    muatData();
  }, []);

  // Menyimpan data setiap ada perubahan
  useEffect(() => {
    if (!siap) return;

    async function simpanData() {
      try {
        await AsyncStorage.multiSet([
          ['tasks', JSON.stringify(tasks)],
          ['jadwal', JSON.stringify(jadwal)],
          ['namaMahasiswa', namaMahasiswa],
          ['programStudi', programStudi]
        ]);
      } catch (error) {
        console.log('Kesalahan menyimpan data:', error);
      }
    }

    simpanData();
  }, [
    tasks,
    jadwal,
    namaMahasiswa,
    programStudi,
    siap
  ]);

  // Fungsi menambahkan tugas
  function tambahTugas(nama, tanggal) {
    const tugasBaru = {
      id: Date.now().toString(),
      nama: nama.trim(),
      tanggal: tanggal.trim() || 'Belum ditentukan',
      selesai: false
    };

    setTasks(sebelumnya => [...sebelumnya, tugasBaru]);
  }

  // Fungsi menghapus tugas
  function hapusTugas(id) {
    setTasks(sebelumnya =>
      sebelumnya.filter(item => item.id !== id)
    );
  }

  // Fungsi menyelesaikan tugas
  function ubahStatus(id) {
    setTasks(sebelumnya =>
      sebelumnya.map(item =>
        item.id === id
          ? { ...item, selesai: !item.selesai }
          : item
      )
    );
  }

  // Fungsi menambahkan jadwal
  function tambahJadwal(hari, kegiatan, jam) {
    const jadwalBaru = {
      id: Date.now().toString(),
      hari,
      kegiatan: kegiatan.trim(),
      jam: jam.trim()
    };

    setJadwal(sebelumnya => [...sebelumnya, jadwalBaru]);
  }

  // Fungsi mengedit jadwal
  function ubahJadwal(id, hari, kegiatan, jam) {
    setJadwal(sebelumnya =>
      sebelumnya.map(item =>
        item.id === id
          ? {
            ...item,
            hari,
            kegiatan: kegiatan.trim(),
            jam: jam.trim()
          }
          : item
      )
    );
  }

  // Fungsi menghapus jadwal
  function hapusJadwal(id) {
    setJadwal(sebelumnya =>
      sebelumnya.filter(item => item.id !== id)
    );
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        tambahTugas,
        hapusTugas,
        ubahStatus,
        jadwal,
        tambahJadwal,
        ubahJadwal,
        hapusJadwal,
        namaMahasiswa,
        setNamaMahasiswa,
        programStudi,
        setProgramStudi,
        siap
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// =====================================
// 3. KOMPONEN KARTU TUGAS (PROPS)
// =====================================

function KartuTugas({ item, onHapus, onSelesai }) {
  return (
    <View style={styles.kartuTugas}>
      <View style={{ flex: 1 }}>
        <Text
          style={
            item.selesai
              ? styles.teksSelesai
              : styles.namaTugas
          }
        >
          {item.nama}
        </Text>

        <Text style={styles.teksKecil}>
          Batas: {item.tanggal}
        </Text>

        <Text
          style={
            item.selesai
              ? styles.statusSelesai
              : styles.statusBelum
          }
        >
          {item.selesai ? '✓ Sudah selesai' : '○ Belum selesai'}
        </Text>
      </View>

      <View style={styles.aksiTugas}>
        <TouchableOpacity
          style={styles.tombolSelesai}
          onPress={onSelesai}
        >
          <Text>✓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tombolHapus}
          onPress={onHapus}
        >
          <Text>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =====================================
// 4. KOMPONEN STATISTIK (PROPS)
// =====================================

function Statistik({ judul, angka, emoji }) {
  return (
    <View style={styles.kartuStatistik}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.angka}>{angka}</Text>
      <Text style={styles.labelStatistik}>{judul}</Text>
    </View>
  );
}

// =====================================
// 5. HALAMAN BERANDA
// =====================================

function Beranda() {
  const {
    tasks,
    hapusTugas,
    ubahStatus,
    namaMahasiswa
  } = useContext(TaskContext);

  const selesai = tasks.filter(item => item.selesai).length;
  const belum = tasks.length - selesai;

  const progres = tasks.length === 0
    ? 0
    : Math.round((selesai / tasks.length) * 100);

  return (
    <ScrollView
      style={styles.halaman}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.salam}>
        HALO, {namaMahasiswa.toUpperCase()} 👋
      </Text>

      <Text style={styles.judul}>StudyMate</Text>

      <Text style={styles.subjudul}>
        Siap belajar dan produktif hari ini?
      </Text>

      <View style={styles.banner}>
        <Text style={styles.judulBanner}>
          Atur Kegiatan Belajarmu!
        </Text>

        <Text style={styles.teksBanner}>
          Kelola tugas dan raih tujuanmu setiap hari.
        </Text>

        <Text style={styles.gambarBanner}>📚</Text>
      </View>

      <Text style={styles.judulBagian}>
        Ringkasan Aktivitas
      </Text>

      <View style={styles.kumpulanStatistik}>
        <Statistik
          judul="Total Tugas"
          angka={tasks.length}
          emoji="📝"
        />

        <Statistik
          judul="Belum Selesai"
          angka={belum}
          emoji="⏳"
        />

        <Statistik
          judul="Selesai"
          angka={selesai}
          emoji="✅"
        />
      </View>

      <View style={styles.kartuProgres}>
        <View style={styles.headerProgres}>
          <Text style={styles.judulProgres}>
            Progres Belajar
          </Text>

          <Text style={styles.persenProgres}>
            {progres}%
          </Text>
        </View>

        <View style={styles.latarProgres}>
          <View
            style={[
              styles.isiProgres,
              { width: `${progres}%` }
            ]}
          />
        </View>

        <Text style={styles.keteranganProgres}>
          {selesai} dari {tasks.length} tugas selesai.
        </Text>
      </View>

      <Text style={styles.judulBagian}>
        Tugas Terbaru
      </Text>

      {tasks.length === 0 ? (
        <Text style={styles.kosong}>
          Belum ada tugas. Yuk, tambahkan tugas pertamamu!
        </Text>
      ) : (
        tasks.slice(-3).reverse().map(item => (
          <KartuTugas
            key={item.id}
            item={item}
            onHapus={() => {
              Alert.alert(
                'Hapus Tugas',
                'Yakin ingin menghapus tugas ini?',
                [
                  { text: 'Batal', style: 'cancel' },
                  {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: () => hapusTugas(item.id)
                  }
                ]
              );
            }}
            onSelesai={() => ubahStatus(item.id)}
          />
        ))
      )}

      <View style={styles.motivasi}>
        <Text style={styles.teksMotivasi}>
          "Sedikit kemajuan tetaplah sebuah kemajuan." 🌟
        </Text>
      </View>
    </ScrollView>
  );
}

// =====================================
// 6. HALAMAN DAFTAR TUGAS
// =====================================

function DaftarTugas() {
  const {
    tasks,
    tambahTugas,
    hapusTugas,
    ubahStatus
  } = useContext(TaskContext);

  const [nama, setNama] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [pencarian, setPencarian] = useState('');

  const tugasDisaring = tasks.filter(item =>
    String(item.nama || item.judul || '')
      .toLowerCase()
      .includes(pencarian.toLowerCase())
  );

  function konfirmasiHapus(id) {
    Alert.alert(
      'Hapus Tugas',
      'Apakah kamu yakin ingin menghapus tugas ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => hapusTugas(id)
        }
      ]
    );
  }

  function simpanTugas() {
    if (!nama.trim()) {
      Alert.alert('Perhatian', 'Nama tugas harus diisi!');
      return;
    }

    tambahTugas(nama, tanggal);
    setNama('');
    setTanggal('');

    Alert.alert('Berhasil', 'Tugas berhasil ditambahkan!');
  }

  return (
    <ScrollView style={styles.halaman}>
      <Text style={styles.judulHalaman}>
        Daftar Tugas
      </Text>

      <Text style={styles.subjudul}>
        Catat dan kelola semua tugas kuliahmu.
      </Text>

      <View style={styles.form}>
        <Text style={styles.labelInput}>Nama Tugas</Text>

        <TextInput
          style={styles.input}
          placeholder="Contoh: Tugas React Native"
          value={nama}
          onChangeText={setNama}
        />

        <Text style={styles.labelInput}>
          Batas Pengumpulan
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Contoh: 20 November 2026"
          value={tanggal}
          onChangeText={setTanggal}
        />

        <TouchableOpacity
          style={styles.tombolTambah}
          onPress={simpanTugas}
        >
          <Text style={styles.teksTambah}>
            + Tambah Tugas
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.judulBagian}>Cari Tugas</Text>

      <TextInput
        style={styles.inputPencarian}
        placeholder="🔍 Cari nama tugas..."
        value={pencarian}
        onChangeText={setPencarian}
      />

      <Text style={styles.judulBagian}>
        Semua Tugas ({tugasDisaring.length})
      </Text>

      {tugasDisaring.length === 0 ? (
        <Text style={styles.kosong}>
          {tasks.length === 0
            ? 'Belum ada tugas yang ditambahkan.'
            : 'Tugas tidak ditemukan.'}
        </Text>
      ) : (
        tugasDisaring.map(item => (
          <KartuTugas
            key={item.id}
            item={item}
            onHapus={() => konfirmasiHapus(item.id)}
            onSelesai={() => ubahStatus(item.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

// =====================================
// 7. HALAMAN JADWAL BELAJAR
// =====================================

function JadwalBelajar() {
  const {
    jadwal,
    tambahJadwal,
    ubahJadwal,
    hapusJadwal
  } = useContext(TaskContext);

  const [hari, setHari] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [jam, setJam] = useState('');
  const [editId, setEditId] = useState(null);

  const daftarHari = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Minggu'
  ];

  function resetForm() {
    setHari('');
    setKegiatan('');
    setJam('');
    setEditId(null);
  }

  function simpanJadwal() {
    if (!hari || !kegiatan.trim() || !jam.trim()) {
      Alert.alert(
        'Perhatian',
        'Lengkapi hari, kegiatan, dan jam belajar!'
      );
      return;
    }

    if (editId) {
      ubahJadwal(editId, hari, kegiatan, jam);

      Alert.alert(
        'Berhasil',
        'Jadwal berhasil diperbarui!'
      );
    } else {
      tambahJadwal(hari, kegiatan, jam);

      Alert.alert(
        'Berhasil',
        'Jadwal berhasil ditambahkan!'
      );
    }

    resetForm();
  }

  function mulaiEdit(item) {
    setEditId(item.id);
    setHari(item.hari);
    setKegiatan(item.kegiatan);
    setJam(item.jam);
  }

  function konfirmasiHapus(id) {
    Alert.alert(
      'Hapus Jadwal',
      'Yakin ingin menghapus jadwal ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => hapusJadwal(id)
        }
      ]
    );
  }

  const urutanHari = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
    Minggu: 7
  };

  const jadwalUrut = [...jadwal].sort(
    (a, b) =>
      (urutanHari[a.hari] || 8) -
      (urutanHari[b.hari] || 8)
  );

  return (
    <ScrollView
      style={styles.halaman}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.judulHalaman}>
        Jadwal Belajar 📅
      </Text>

      <Text style={styles.subjudul}>
        Atur kegiatan belajar sesuai kebutuhanmu.
      </Text>

      {/* FORM TAMBAH DAN EDIT */}

      <View style={styles.form}>
        <Text style={styles.judulBagian}>
          {editId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
        </Text>

        <Text style={styles.labelInput}>Pilih Hari</Text>

        <View style={styles.pilihanHari}>
          {daftarHari.map(item => (
            <TouchableOpacity
              key={item}
              onPress={() => setHari(item)}
              style={[
                styles.tombolHari,
                hari === item && styles.hariTerpilih
              ]}
            >
              <Text
                style={[
                  styles.teksHari,
                  hari === item && styles.teksHariTerpilih
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.labelInput}>
          Nama Kegiatan
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Contoh: Belajar Pemrograman"
          value={kegiatan}
          onChangeText={setKegiatan}
        />

        <Text style={styles.labelInput}>
          Jam Belajar
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Contoh: 08.00 - 10.00"
          value={jam}
          onChangeText={setJam}
        />

        <TouchableOpacity
          style={styles.tombolTambah}
          onPress={simpanJadwal}
        >
          <Text style={styles.teksTambah}>
            {editId ? 'Simpan Perubahan' : '+ Tambah Jadwal'}
          </Text>
        </TouchableOpacity>

        {editId && (
          <TouchableOpacity
            style={styles.tombolBatal}
            onPress={resetForm}
          >
            <Text style={styles.teksBatal}>
              Batal Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* DAFTAR JADWAL */}

      <Text style={styles.judulBagian}>
        Daftar Jadwal ({jadwal.length})
      </Text>

      {jadwalUrut.length === 0 ? (
        <Text style={styles.kosong}>
          Belum ada jadwal belajar.
        </Text>
      ) : (
        jadwalUrut.map(item => (
          <View key={item.id} style={styles.kartuJadwal}>
            <Text style={styles.hariJadwal}>
              📅 {item.hari}
            </Text>

            <Text style={styles.namaTugas}>
              {item.kegiatan}
            </Text>

            <Text style={styles.teksKecil}>
              🕒 {item.jam}
            </Text>

            <View style={styles.barisanTombol}>
              <TouchableOpacity
                style={styles.tombolEdit}
                onPress={() => mulaiEdit(item)}
              >
                <Text style={styles.teksTombolPutih}>
                  ✏️ Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tombolHapus}
                onPress={() => konfirmasiHapus(item.id)}
              >
                <Text style={styles.teksTombolPutih}>
                  🗑 Hapus
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={styles.motivasi}>
        <Text style={styles.teksMotivasi}>
          Atur waktumu, raih tujuanmu! 🎓
        </Text>
      </View>
    </ScrollView>
  );
}

// =====================================
// 8. HALAMAN PROFIL
// =====================================

function Profil() {
  const {
    tasks,
    namaMahasiswa,
    setNamaMahasiswa,
    programStudi,
    setProgramStudi
  } = useContext(TaskContext);

  const [namaInput, setNamaInput] = useState(namaMahasiswa);
  const [prodiInput, setProdiInput] = useState(programStudi);

  useEffect(() => {
    setNamaInput(namaMahasiswa);
    setProdiInput(programStudi);
  }, [namaMahasiswa, programStudi]);

  function simpanProfil() {
    if (!namaInput.trim()) {
      Alert.alert('Perhatian', 'Nama tidak boleh kosong!');
      return;
    }

    setNamaMahasiswa(namaInput.trim());
    setProgramStudi(prodiInput.trim());

    Alert.alert(
      'Berhasil',
      'Profil berhasil diperbarui!'
    );
  }

  const selesai = tasks.filter(item => item.selesai).length;

  return (
    <ScrollView style={styles.halaman}>
      <Text style={styles.judulHalaman}>
        Profil Saya 👤
      </Text>

      <Text style={styles.subjudul}>
        Kelola informasi profil mahasiswa.
      </Text>

      <View style={styles.profil}>
        <View style={styles.avatar}>
          <Text style={styles.teksAvatar}>
            {namaMahasiswa.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.namaProfil}>
          {namaMahasiswa}
        </Text>

        <Text style={styles.subjudul}>
          Pengguna StudyMate
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.labelInput}>
          Nama Mahasiswa
        </Text>

        <TextInput
          style={styles.input}
          value={namaInput}
          onChangeText={setNamaInput}
          placeholder="Masukkan nama"
        />

        <Text style={styles.labelInput}>
          Program Studi
        </Text>

        <TextInput
          style={styles.input}
          value={prodiInput}
          onChangeText={setProdiInput}
          placeholder="Masukkan program studi"
        />

        <TouchableOpacity
          style={styles.tombolTambah}
          onPress={simpanProfil}
        >
          <Text style={styles.teksTambah}>
            Simpan Profil
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kartuProfil}>
        <Text style={styles.labelProfil}>
          Nama Aplikasi
        </Text>
        <Text style={styles.isiProfil}>
          StudyMate
        </Text>
      </View>

      <View style={styles.kartuProfil}>
        <Text style={styles.labelProfil}>
          Total Tugas
        </Text>
        <Text style={styles.isiProfil}>
          {tasks.length} tugas
        </Text>
      </View>

      <View style={styles.kartuProfil}>
        <Text style={styles.labelProfil}>
          Tugas Selesai
        </Text>
        <Text style={styles.isiProfil}>
          {selesai} tugas
        </Text>
      </View>

      <View style={styles.motivasi}>
        <Text style={styles.teksMotivasi}>
          Terus semangat belajar dan raih cita-citamu! 🎓
        </Text>
      </View>
    </ScrollView>
  );
}

// =====================================
// 9. NAVIGASI APLIKASI
// =====================================

function AplikasiUtama() {
  const { siap } = useContext(TaskContext);

  if (!siap) {
    return (
      <View style={styles.memuat}>
        <Text style={styles.judul}>StudyMate</Text>
        <Text style={styles.subjudul}>
          Sedang memuat data...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            height: 65,
            paddingBottom: 8,
            paddingTop: 8
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600'
          }
        }}
      >
        <Tab.Screen
          name="Beranda"
          component={Beranda}
          options={{
            tabBarLabel: 'Beranda',
            tabBarIcon: () => <Text>🏠</Text>
          }}
        />

        <Tab.Screen
          name="Tugas"
          component={DaftarTugas}
          options={{
            tabBarLabel: 'Tugas',
            tabBarIcon: () => <Text>📝</Text>
          }}
        />

        <Tab.Screen
          name="Jadwal"
          component={JadwalBelajar}
          options={{
            tabBarLabel: 'Jadwal',
            tabBarIcon: () => <Text>📅</Text>
          }}
        />

        <Tab.Screen
          name="Profil"
          component={Profil}
          options={{
            tabBarLabel: 'Profil',
            tabBarIcon: () => <Text>👤</Text>
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// =====================================
// 10. KOMPONEN UTAMA
// =====================================

export default function App() {
  return (
    <TaskProvider>
      <StatusBar style="dark" />
      <AplikasiUtama />
    </TaskProvider>
  );
}

// =====================================
// 11. DESAIN APLIKASI
// =====================================

const styles = StyleSheet.create({

  halaman: {
    flex: 1,
    backgroundColor: '#F4F7FE',
    paddingHorizontal: 20,
    paddingTop: 55
  },

  memuat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FE'
  },

  salam: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: 'bold'
  },

  judul: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 5
  },

  judulHalaman: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E3A8A'
  },

  subjudul: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 20
  },

  banner: {
    backgroundColor: '#2563EB',
    padding: 22,
    borderRadius: 20,
    marginBottom: 25
  },

  judulBanner: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },

  teksBanner: {
    color: '#DBEAFE',
    fontSize: 13,
    marginTop: 10,
    width: '80%'
  },

  gambarBanner: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    fontSize: 40
  },

  judulBagian: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    marginTop: 10
  },

  kumpulanStatistik: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 20
  },

  kartuStatistik: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center'
  },

  emoji: {
    fontSize: 21
  },

  angka: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 7
  },

  labelStatistik: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center'
  },

  kartuProgres: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 25
  },

  headerProgres: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },

  judulProgres: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B'
  },

  persenProgres: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB'
  },

  latarProgres: {
    height: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    overflow: 'hidden'
  },

  isiProgres: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 10
  },

  keteranganProgres: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 10
  },

  kartuTugas: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: 'center'
  },

  namaTugas: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B'
  },

  teksSelesai: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold'
  },

  teksKecil: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5
  },

  statusSelesai: {
    color: '#16A34A',
    fontSize: 11,
    marginTop: 6,
    fontWeight: 'bold'
  },

  statusBelum: {
    color: '#D97706',
    fontSize: 11,
    marginTop: 6,
    fontWeight: 'bold'
  },

  aksiTugas: {
    flexDirection: 'row',
    gap: 8
  },

  tombolSelesai: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10
  },

  tombolHapus: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginLeft: 5
  },

  motivasi: {
    backgroundColor: '#DBEAFE',
    padding: 18,
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 30
  },

  teksMotivasi: {
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13
  },

  kosong: {
    color: '#94A3B8',
    textAlign: 'center',
    padding: 20,
    fontSize: 13
  },

  form: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginBottom: 25
  },

  labelInput: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
    marginTop: 8
  },

  input: {
    backgroundColor: '#F1F5F9',
    padding: 13,
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 8,
    color: '#1E293B'
  },

  inputPencarian: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },

  tombolTambah: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },

  teksTambah: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },

  kartuJadwal: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2
  },

  hariJadwal: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8
  },

  pilihanHari: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 15
  },

  tombolHari: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9
  },

  hariTerpilih: {
    backgroundColor: '#2563EB'
  },

  teksHari: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600'
  },

  teksHariTerpilih: {
    color: '#FFFFFF'
  },

  barisanTombol: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10
  },

  tombolEdit: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 9
  },

  teksTombolPutih: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },

  tombolBatal: {
    alignItems: 'center',
    padding: 10
  },

  teksBatal: {
    color: '#DC2626',
    fontWeight: 'bold'
  },

  profil: {
    alignItems: 'center',
    marginVertical: 30
  },

  avatar: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center'
  },

  teksAvatar: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: 'bold'
  },

  namaProfil: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 15
  },

  kartuProfil: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 13,
    marginBottom: 12
  },

  labelProfil: {
    color: '#64748B',
    fontSize: 12
  },

  isiProfil: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 7
  }

});
