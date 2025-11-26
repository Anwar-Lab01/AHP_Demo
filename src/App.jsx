import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, CheckCircle, BookOpen, 
  AlertTriangle, RefreshCw, HelpCircle, Download, 
  ArrowRight, Info, AlertOctagon, Play, X 
} from 'lucide-react';

// --- DATA & KONFIGURASI ---

const RI_TABLE = { 
  1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 
  6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45,
  10: 1.49, 11: 1.51, 12: 1.53, 13: 1.56, 14: 1.57, 15: 1.59 
};

const SAATY_SCALE = [9, 7, 5, 3, 1, 3, 5, 7, 9];

const DEFINITIONS = {
  'Data Teknis Jalan': 'Kondisi fisik aset (Rusak/Baik, Lebar, Jenis Perkerasan).',
  'Data Pelayanan Masyarakat': 'Dampak sosial (Jumlah penduduk/desa terlayani).',
  'Data Aksesibilitas': 'Peran strategis menuju fasilitas vital (RS, Sekolah, Pasar).',
  'Data Spasial & Demografi': 'Konteks wilayah (Ibukota, Kepadatan Penduduk).',
  'Tingkat Kerusakan': 'Keparahan kerusakan (Lubang, Retak).',
  'Kapasitas Geometris': 'Dimensi jalan (Lebar & Panjang).',
  'Kualitas Perkerasan': 'Jenis material (Aspal vs Tanah).',
  'Jml Penduduk Dilayani': 'Populasi terdampak.',
  'Jml Desa Dilalui': 'Banyaknya desa yang dilewati.',
  'Jml Kecamatan Dilalui': 'Konektivitas antar kecamatan.',
  'Kedekatan RS': 'Akses ke Fasilitas Kesehatan.',
  'Kedekatan Sekolah': 'Akses ke Pendidikan.',
  'Kedekatan Pasar': 'Akses ke Ekonomi.',
  'Hubungan Jalan Provinsi': 'Koneksi ke jalan provinsi.',
  'Hubungan Jalan Nasional': 'Koneksi ke jalan nasional.',
  'Jarak ke Ibu Kota Kab': 'Kedekatan dengan pusat pemerintahan.',
  'Kepadatan Penduduk': 'Densitas area pemukiman.'
};

const SECTIONS = [
  {
    id: 'level2',
    title: 'Level 2: Kriteria Utama',
    description: 'Mana aspek yang paling prioritas dalam penanganan jalan?',
    items: ['Data Teknis Jalan', 'Data Pelayanan Masyarakat', 'Data Aksesibilitas', 'Data Spasial & Demografi'],
    pairs: [
      { id: 'l2_1', left: 'Data Teknis Jalan', right: 'Data Pelayanan Masyarakat' },
      { id: 'l2_2', left: 'Data Teknis Jalan', right: 'Data Aksesibilitas' },
      { id: 'l2_3', left: 'Data Teknis Jalan', right: 'Data Spasial & Demografi' },
      { id: 'l2_4', left: 'Data Pelayanan Masyarakat', right: 'Data Aksesibilitas' },
      { id: 'l2_5', left: 'Data Pelayanan Masyarakat', right: 'Data Spasial & Demografi' },
      { id: 'l2_6', left: 'Data Aksesibilitas', right: 'Data Spasial & Demografi' },
    ]
  },
  {
    id: 'level3_teknis',
    title: 'Level 3: Data Teknis',
    description: 'Faktor teknis mana yang paling kritikal?',
    items: ['Tingkat Kerusakan', 'Kapasitas Geometris', 'Kualitas Perkerasan'],
    pairs: [
      { id: 'l3_t1', left: 'Tingkat Kerusakan', right: 'Kapasitas Geometris' },
      { id: 'l3_t2', left: 'Tingkat Kerusakan', right: 'Kualitas Perkerasan' },
      { id: 'l3_t3', left: 'Kapasitas Geometris', right: 'Kualitas Perkerasan' },
    ]
  },
  {
    id: 'level3_pelayanan',
    title: 'Level 3: Pelayanan Masyarakat',
    description: 'Siapa yang paling prioritas dilayani?',
    items: ['Jml Penduduk Dilayani', 'Jml Desa Dilalui', 'Jml Kecamatan Dilalui'],
    pairs: [
      { id: 'l3_p1', left: 'Jml Penduduk Dilayani', right: 'Jml Desa Dilalui' },
      { id: 'l3_p2', left: 'Jml Penduduk Dilayani', right: 'Jml Kecamatan Dilalui' },
      { id: 'l3_p3', left: 'Jml Desa Dilalui', right: 'Jml Kecamatan Dilalui' },
    ]
  },
  {
    id: 'level3_akses',
    title: 'Level 3: Aksesibilitas',
    description: 'Akses ke fasilitas mana yang lebih penting?',
    items: ['Kedekatan RS', 'Kedekatan Sekolah', 'Kedekatan Pasar', 'Hubungan Jalan Provinsi', 'Hubungan Jalan Nasional'],
    pairs: [
      { id: 'l3_a1', left: 'Kedekatan RS', right: 'Kedekatan Sekolah' },
      { id: 'l3_a2', left: 'Kedekatan RS', right: 'Kedekatan Pasar' },
      { id: 'l3_a3', left: 'Kedekatan RS', right: 'Hubungan Jalan Provinsi' },
      { id: 'l3_a4', left: 'Kedekatan RS', right: 'Hubungan Jalan Nasional' },
      { id: 'l3_a5', left: 'Kedekatan Sekolah', right: 'Kedekatan Pasar' },
      { id: 'l3_a6', left: 'Kedekatan Sekolah', right: 'Hubungan Jalan Provinsi' },
      { id: 'l3_a7', left: 'Kedekatan Sekolah', right: 'Hubungan Jalan Nasional' },
      { id: 'l3_a8', left: 'Kedekatan Pasar', right: 'Hubungan Jalan Provinsi' },
      { id: 'l3_a9', left: 'Kedekatan Pasar', right: 'Hubungan Jalan Nasional' },
      { id: 'l3_a10', left: 'Hubungan Jalan Provinsi', right: 'Hubungan Jalan Nasional' },
    ]
  },
  {
    id: 'level3_spasial',
    title: 'Level 3: Spasial & Demografi',
    description: 'Konteks wilayah mana yang lebih penting?',
    items: ['Jarak ke Ibu Kota Kab', 'Kepadatan Penduduk'],
    pairs: [
      { id: 'l3_s1', left: 'Jarak ke Ibu Kota Kab', right: 'Kepadatan Penduduk' },
    ]
  }
];

const INTENSITY_TEXT = {
  1: "Sama Penting",
  3: "Sedikit Lebih Penting",
  5: "Lebih Penting (Kuat)",
  7: "Sangat Lebih Penting",
  9: "Mutlak Lebih Penting"
};

// --- LOGIKA MATEMATIKA AHP (GEOMETRIC MEAN) ---

const calculateAHP = (section, allAnswers) => {
  const items = section.items;
  const n = items.length;
  
  if (n <= 1) return { items, weights: [1], ci: 0, cr: 0, isConsistent: true, deviations: {} };

  const matrix = Array(n).fill(0).map(() => Array(n).fill(1));
  let filledCount = 0;

  section.pairs.forEach(pair => {
    const idxLeft = items.indexOf(pair.left);
    const idxRight = items.indexOf(pair.right);
    const answer = allAnswers[pair.id];

    if (answer) {
      filledCount++;
      let val = 1;
      if (answer.direction === 'left') val = answer.val;
      else if (answer.direction === 'right') val = 1 / answer.val;
      
      matrix[idxLeft][idxRight] = val;
      matrix[idxRight][idxLeft] = 1 / val;
    }
  });

  if (filledCount === 0) return { items, weights: Array(n).fill(1/n), ci: 0, cr: 0, isConsistent: true, deviations: {} };

  // 1. Calculate Weights using GEOMETRIC MEAN Method
  const geometricMeans = matrix.map(row => {
    const product = row.reduce((acc, val) => acc * val, 1);
    return Math.pow(product, 1 / n);
  });

  const sumGM = geometricMeans.reduce((acc, val) => acc + val, 0);
  const weights = geometricMeans.map(gm => gm / sumGM); // Normalize

  // 2. Calculate Consistency (Lambda Max)
  const Aw = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      Aw[i] += matrix[i][j] * weights[j];
    }
  }

  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    lambdaMax += Aw[i] / weights[i];
  }
  lambdaMax = lambdaMax / n;

  const ci = (lambdaMax - n) / (n - 1);
  
  let cr, isConsistent;
  if (n <= 2) {
    cr = 0;
    isConsistent = true;
  } else {
    const ri = RI_TABLE[n] || 1.59;
    cr = ci / ri;
    isConsistent = cr <= 0.1;
  }

  // 3. Deviation Detection
  const deviations = {};
  section.pairs.forEach(pair => {
    const answer = allAnswers[pair.id];
    if(answer) {
      const idxLeft = items.indexOf(pair.left);
      const idxRight = items.indexOf(pair.right);
      
      let userRatio = answer.direction === 'left' ? answer.val : (1 / answer.val);
      const impliedRatio = weights[idxLeft] / weights[idxRight];

      const deviation = Math.abs(userRatio - impliedRatio) / impliedRatio;
      deviations[pair.id] = deviation;
    }
  });

  return { 
    items, 
    weights, 
    ci: Math.max(0, ci), 
    cr: Math.max(0, cr), 
    isConsistent,
    deviations 
  };
};

// --- KOMPONEN UI ---

const Header = ({ title }) => (
  <div className="bg-slate-900 text-white p-4 shadow-md">
    <div className="max-w-2xl mx-auto flex items-center gap-3">
      <BookOpen size={20} className="text-blue-400" />
      <h1 className="font-bold text-lg">{title}</h1>
    </div>
  </div>
);

// 1. WIZARD INTRO (EDUKASI)
const IntroWizard = ({ onComplete, respondent, setRespondent }) => {
  const [step, setStep] = useState(1);
  const [simValue, setSimValue] = useState(null);
  const [inconSimValue, setInconSimValue] = useState(null); // State untuk simulasi inkonsistensi

  const handleNext = () => setStep(p => p + 1);

  const screens = [
    // SCREEN 1: Intro Data Diri
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Selamat Datang</h2>
        <p className="text-slate-600 text-sm">
          Survei ini menggunakan metode <strong>AHP (Analytic Hierarchy Process)</strong>. 
          Tujuannya bukan sekadar memilih, tetapi mengukur <strong>seberapa besar perbedaan kepentingan</strong> antar kriteria.
        </p>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">Nama Lengkap</label>
        <input 
          value={respondent.name} 
          onChange={e => setRespondent({...respondent, name: e.target.value})}
          className="w-full p-3 border rounded-lg bg-slate-50"
          placeholder="Nama Anda"
        />
        <label className="block text-sm font-bold text-slate-700">Instansi / Jabatan</label>
        <input 
          value={respondent.role} 
          onChange={e => setRespondent({...respondent, role: e.target.value})}
          className="w-full p-3 border rounded-lg bg-slate-50"
          placeholder="Contoh: Dinas PUTR"
        />
      </div>
      <button 
        disabled={!respondent.name}
        onClick={handleNext}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold disabled:bg-slate-300"
      >
        Lanjut
      </button>
    </div>,

    // SCREEN 2: Penjelasan Skala
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800">Pahami Skala 1-9</h2>
      <div className="bg-white border rounded-lg overflow-hidden text-sm">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Nilai</th>
              <th className="p-2 text-left">Arti</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-2 font-bold text-center">1</td><td className="p-2">Sama penting</td></tr>
            <tr><td className="p-2 font-bold text-center">3</td><td className="p-2">Sedikit lebih penting</td></tr>
            <tr><td className="p-2 font-bold text-center">5</td><td className="p-2">Jelas lebih penting (Kuat)</td></tr>
            <tr><td className="p-2 font-bold text-center">7</td><td className="p-2">Sangat lebih penting</td></tr>
            <tr><td className="p-2 font-bold text-center">9</td><td className="p-2">Mutlak lebih penting (Ekstrem)</td></tr>
          </tbody>
        </table>
      </div>
      <button onClick={handleNext} className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold">Saya Paham</button>
    </div>,

    // SCREEN 3: Simulasi Sederhana
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <h2 className="text-lg font-bold text-indigo-900 mb-1">Simulasi 1: Pengisian Dasar</h2>
        <p className="text-xs text-indigo-700">Coba isi satu perbandingan ini dengan rasional.</p>
      </div>
      
      <div className="p-4 border rounded-xl bg-white shadow-sm">
        <div className="flex justify-between mb-4 text-sm font-bold">
          <span className="text-blue-700 w-1/3">Kerusakan Jalan</span>
          <span className="text-slate-400">VS</span>
          <span className="text-emerald-700 w-1/3 text-right">Jml Desa Dilalui</span>
        </div>
        
        <div className="flex gap-1 overflow-x-auto pb-2">
          {SAATY_SCALE.map((val, i) => {
            const isLeft = i < 4;
            const isRight = i > 4;
            const isSelected = simValue && (
              (simValue.dir === 'left' && i < 4 && simValue.val === val) ||
              (simValue.dir === 'right' && i > 4 && simValue.val === val) ||
              (simValue.dir === 'equal' && i === 4)
            );
            
            let bg = "bg-slate-50 text-slate-400 hover:bg-slate-200";
            if (isLeft) bg = isSelected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-400";
            if (isRight) bg = isSelected ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-400";
            if (i === 4) bg = isSelected ? "bg-slate-600 text-white" : "bg-slate-100";

            return (
              <button 
                key={i}
                onClick={() => setSimValue(i < 4 ? {dir:'left', val} : i > 4 ? {dir:'right', val} : {dir:'equal', val:1})}
                className={`flex-1 h-10 rounded font-bold text-xs transition-all ${bg}`}
              >
                {val}
              </button>
            )
          })}
        </div>

        {simValue && (
          <div className="mt-4 text-xs p-3 bg-slate-50 rounded border animate-in fade-in slide-in-from-bottom-2">
            <strong>Feedback: </strong>
            {simValue.val >= 7 ? 
              "Anda memilih nilai ekstrem. Ini sah jika 'Kerusakan' memang jauh lebih prioritas dibanding 'Jml Desa'." :
              simValue.val === 1 ? 
              "Anda menilai setara." :
              "Pilihan moderat (3-5), aman."
            }
          </div>
        )}
      </div>

      <button 
        disabled={!simValue}
        onClick={handleNext} 
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold disabled:bg-slate-300"
      >
        Lanjut
      </button>
    </div>,

    // SCREEN 4: Simulasi Inkonsistensi (BARU)
    <div className="space-y-6">
      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold text-red-900 mb-1">Simulasi 2: Deteksi Inkonsistensi</h2>
        <p className="text-xs text-red-800">
          Mari kita lihat bagaimana sistem mendeteksi jawaban yang "tidak logis".
        </p>
      </div>

      <div className="bg-slate-100 p-3 rounded-lg space-y-2 text-xs border">
        <p className="font-bold text-slate-700 mb-2 border-b pb-2">Premis Awal (Sudah Diisi):</p>
        <div className="flex justify-between items-center">
          <span>1. Kecepatan vs Biaya</span>
          <span className="font-bold text-blue-700">Kecepatan Lebih Penting (5)</span>
        </div>
        <div className="flex justify-between items-center">
          <span>2. Biaya vs Estetika</span>
          <span className="font-bold text-blue-700">Biaya Lebih Penting (5)</span>
        </div>
        <div className="mt-2 pt-2 border-t text-slate-500 italic">
          Secara logika: Kecepatan &gt;&gt; Biaya &gt;&gt; Estetika. Maka <strong>Kecepatan</strong> harusnya <strong>JAUH LEBIH PENTING</strong> dari Estetika.
        </div>
      </div>
      
      <div className="p-4 border rounded-xl bg-white shadow-sm border-l-4 border-l-red-400">
        <div className="flex justify-between mb-4 text-sm font-bold">
          <span className="text-blue-700 w-1/3">Kecepatan</span>
          <span className="text-slate-400">VS</span>
          <span className="text-emerald-700 w-1/3 text-right">Estetika</span>
        </div>
        
        <p className="text-xs text-slate-500 mb-2">Coba pilih nilai rendah (1 atau 3 di kiri/kanan) untuk melihat peringatan:</p>

        <div className="flex gap-1 overflow-x-auto pb-2">
          {SAATY_SCALE.map((val, i) => {
            const isLeft = i < 4;
            const isRight = i > 4;
            const isSelected = inconSimValue && (
              (inconSimValue.dir === 'left' && i < 4 && inconSimValue.val === val) ||
              (inconSimValue.dir === 'right' && i > 4 && inconSimValue.val === val) ||
              (inconSimValue.dir === 'equal' && i === 4)
            );
            
            let bg = "bg-slate-50 text-slate-400 hover:bg-slate-200";
            if (isLeft) bg = isSelected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-400";
            if (isRight) bg = isSelected ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-400";
            if (i === 4) bg = isSelected ? "bg-slate-600 text-white" : "bg-slate-100";

            return (
              <button 
                key={i}
                onClick={() => setInconSimValue(i < 4 ? {dir:'left', val} : i > 4 ? {dir:'right', val} : {dir:'equal', val:1})}
                className={`flex-1 h-10 rounded font-bold text-xs transition-all ${bg}`}
              >
                {val}
              </button>
            )
          })}
        </div>

        {inconSimValue && (
          <div className={`mt-4 text-xs p-3 rounded border animate-in fade-in ${
            (inconSimValue.dir === 'left' && inconSimValue.val >= 7) ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {(inconSimValue.dir === 'left' && inconSimValue.val >= 7) ? (
              <span className="flex items-center gap-2"><CheckCircle size={14}/> <strong>Bagus!</strong> Jawaban ini Konsisten (Logis).</span>
            ) : (
              <span className="flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0"/> 
                <div>
                  <strong>INKONSISTEN!</strong><br/>
                  Anda sebelumnya memilih Kecepatan &gt; Biaya dan Biaya &gt; Estetika. 
                  Memilih nilai rendah (atau Estetika lebih penting) di sini mematahkan logika transitivitas.
                </div>
              </span>
            )}
          </div>
        )}
      </div>

      <button 
        disabled={!inconSimValue}
        onClick={handleNext} 
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold disabled:bg-slate-300"
      >
        Lanjut ke Peringatan Terakhir
      </button>
    </div>,

    // SCREEN 5: Warning Info
    <div className="space-y-6 text-center pt-8">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Siap Mengisi?</h2>
      <p className="text-slate-600 text-sm px-4">
        Jika jawaban Anda saling bertentangan, sistem akan memunculkan tanda <span className="text-red-600 font-bold">MERAH</span>.
        <br/><br/>
        Mohon perbaiki jawaban yang ditandai tersebut sebelum melanjutkan agar data tesis ini valid.
      </p>
      <button onClick={onComplete} className="w-full py-4 bg-slate-900 text-white rounded-lg font-bold mt-8">
        Mulai Pengisian Kriteria AHP
      </button>
    </div>
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[650px]">
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
          <span className="font-bold">Panduan Pengisian</span>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded">Langkah {step}/{screens.length}</span>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {screens[step-1]}
        </div>
      </div>
    </div>
  );
};

// 2. SURVEY UI COMPONENTS

const ConsistencyBar = ({ cr }) => {
  const validCR = Math.max(0, isNaN(cr) ? 0 : cr);
  let status = { color: 'bg-emerald-500', text: 'Sangat Konsisten', advice: 'Pertahankan logika ini.' };
  if (validCR > 0.1) {
    status = { color: 'bg-red-500', text: 'TIDAK KONSISTEN', advice: 'Perbaiki jawaban bertanda merah di bawah.' };
  } else if (validCR > 0.05) {
    status = { color: 'bg-yellow-500', text: 'Cukup Konsisten', advice: 'Hati-hati, mulai mendekati batas.' };
  }

  const width = Math.min((validCR / 0.2) * 100, 100);

  return (
    <div className="bg-white border-b sticky top-0 z-20 p-4 shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-end mb-2">
        <span className={`text-xs font-bold uppercase ${validCR > 0.1 ? 'text-red-600' : 'text-slate-600'}`}>
          {status.text} (CR: {validCR.toFixed(3)})
        </span>
        <span className="text-[10px] text-slate-400">Batas Toleransi: 0.100</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400 left-1/2 z-10" title="Limit 0.1" />
        <div className={`h-full transition-all duration-500 ${status.color}`} style={{ width: `${width}%` }} />
      </div>
      <div className="mt-1 text-[10px] text-slate-500 italic flex items-center gap-1">
        {validCR > 0.1 && <AlertOctagon size={10} className="text-red-500"/>}
        {status.advice}
      </div>
    </div>
  );
};

const SaatyCard = ({ pair, value, onChange, deviation, globalInconsistent }) => {
  const isProblematic = globalInconsistent && deviation > 0.5;

  const handleSelect = (idx) => {
    const scaleVal = SAATY_SCALE[idx];
    let newVal = { direction: 'equal', val: 1 };
    if (idx < 4) newVal = { direction: 'left', val: scaleVal };
    if (idx > 4) newVal = { direction: 'right', val: scaleVal };
    
    // FIX: Pass the full object value, not just one part
    onChange(newVal);
  };

  return (
    <div className={`p-4 rounded-xl border mb-4 transition-all ${isProblematic ? 'bg-red-50 border-red-300 ring-1 ring-red-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="w-[40%] font-bold text-blue-900 leading-tight">{pair.left}</div>
        <div className="text-slate-300 text-xs">vs</div>
        <div className="w-[40%] font-bold text-emerald-900 text-right leading-tight">{pair.right}</div>
      </div>

      <div className="flex gap-1 mb-2">
        {SAATY_SCALE.map((val, i) => {
          const isLeft = i < 4;
          const isRight = i > 4;
          const isSelected = value && (
            (value.direction === 'left' && i < 4 && value.val === val) ||
            (value.direction === 'right' && i > 4 && value.val === val) ||
            (value.direction === 'equal' && i === 4)
          );

          let btnClass = "flex-1 h-9 rounded text-[10px] font-bold transition-all border ";
          if (isLeft) btnClass += isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-blue-400 border-blue-100 hover:bg-blue-100";
          if (isRight) btnClass += isSelected ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 text-emerald-400 border-emerald-100 hover:bg-emerald-100";
          if (i === 4) btnClass += isSelected ? "bg-slate-600 text-white border-slate-600" : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200";

          return (
            <button key={i} onClick={() => handleSelect(i)} className={btnClass}>{val}</button>
          );
        })}
      </div>

      <div className="text-[10px] text-slate-500 flex justify-between px-1">
        <span className="truncate w-1/2" title={DEFINITIONS[pair.left]}>{DEFINITIONS[pair.left]}</span>
        <span className="truncate w-1/2 text-right" title={DEFINITIONS[pair.right]}>{DEFINITIONS[pair.right]}</span>
      </div>

      {isProblematic && (
        <div className="mt-2 bg-white/50 text-red-600 text-xs p-2 rounded border border-red-200 flex items-start gap-2">
          <RefreshCw size={14} className="mt-0.5 shrink-0"/>
          <span>
            <strong>Terdeteksi Inkonsisten!</strong> Jawaban ini menyimpang {(deviation*100).toFixed(0)}% dari pola jawaban lain. Coba turunkan nilainya atau ubah arah.
          </span>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('intro');
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [respondent, setRespondent] = useState({ name: '', role: '' });

  const currentSection = SECTIONS[sectionIdx];
  const result = useMemo(() => calculateAHP(currentSection, answers), [currentSection, answers]);
  const filledCount = currentSection.pairs.filter(p => answers[p.id]).length;
  const totalCount = currentSection.pairs.length;
  const isComplete = filledCount === totalCount;

  const handleNext = () => {
    if (!isComplete) {
      alert("Mohon isi semua perbandingan sebelum lanjut.");
      return;
    }

    if (result.cr > 0.1) {
      const confirm = window.confirm(
        `PERINGATAN: Tingkat inkonsistensi (CR) = ${result.cr.toFixed(3)} (Di atas 0.1).\n\n` +
        `Data ini dianggap tidak valid secara akademik.\n` +
        `Disarankan untuk memperbaiki jawaban yang bertanda MERAH.\n\n` +
        `Apakah Anda tetap ingin melanjutkan?`
      );
      if (!confirm) return;
    }

    if (sectionIdx < SECTIONS.length - 1) {
      setSectionIdx(p => p + 1);
      window.scrollTo(0,0);
    } else {
      setView('finish');
    }
  };

  const handleDownload = () => {
    const fullReport = SECTIONS.map(sec => {
      const res = calculateAHP(sec, answers);
      return {
        section: sec.title,
        weights: Object.fromEntries(res.items.map((item, i) => [item, res.weights[i]])),
        metrics: { ci: res.ci, cr: res.cr, consistent: res.isConsistent }
      };
    });

    const blob = new Blob([JSON.stringify({ respondent, timestamp: new Date(), data: fullReport, raw: answers }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AHP_HSS_${respondent.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (view === 'intro') {
    return <IntroWizard respondent={respondent} setRespondent={setRespondent} onComplete={() => setView('survey')} />;
  }

  if (view === 'finish') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center text-center font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Survei Selesai</h1>
          <p className="text-slate-600 mb-8">Terima kasih atas partisipasi Anda. Data telah siap.</p>
          <button onClick={handleDownload} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800">
            <Download size={20} /> Unduh Data (.json)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <Header title="E-Survey AHP Prioritas Jalan" />
      
      <div className="bg-white px-4 py-2 text-xs text-slate-500 flex justify-between border-b">
        <span>Bagian {sectionIdx + 1} dari {SECTIONS.length}</span>
        <span>{filledCount} / {totalCount} Terisi</span>
      </div>

      <ConsistencyBar cr={result.cr} />

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">{currentSection.title}</h2>
          <p className="text-sm text-slate-600">{currentSection.description}</p>
        </div>

        <div className="space-y-4">
          {currentSection.pairs.map(pair => (
            <SaatyCard 
              key={pair.id}
              pair={pair}
              value={answers[pair.id]}
              onChange={(val) => setAnswers(prev => ({ ...prev, [pair.id]: val }))}
              deviation={result.deviations[pair.id] || 0}
              globalInconsistent={result.cr > 0.1}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex justify-between max-w-2xl mx-auto">
        <button 
          disabled={sectionIdx === 0}
          onClick={() => setSectionIdx(p => p - 1)}
          className="px-6 py-3 rounded-lg border font-bold text-slate-600 disabled:opacity-30"
        >
          Kembali
        </button>
        <button 
          onClick={handleNext}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-colors ${isComplete ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300'}`}
        >
          {sectionIdx === SECTIONS.length - 1 ? 'Selesai' : 'Lanjut'}
        </button>
      </div>
    </div>
  );
}