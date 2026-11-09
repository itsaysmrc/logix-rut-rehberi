const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'routes.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Yardımcı fonksiyon: routes.json oku
function readRoutes() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('routes.json okuma hatası:', err);
    return [];
  }
}

// Yardımcı fonksiyon: routes.json yaz
function writeRoutes(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 1. Tüm rutları getir
app.get('/api/routes', (req, res) => {
  const routes = readRoutes();
  res.json(routes);
});

// 2. Yeni rut veya nokta ekle ve kalıcı olarak routes.json'a kaydet
app.post('/api/routes', (req, res) => {
  try {
    const { day, time, rating, stops } = req.body;
    if (!day || !time || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ error: 'Eksik veya hatalı veri gönderildi.' });
    }

    const routes = readRoutes();
    const newId = routes.length > 0 ? Math.max(...routes.map(r => r.id || 0)) + 1 : 1;

    const newRoute = {
      id: newId,
      day: String(day).trim().toUpperCase(),
      order: newId,
      stops: stops.map(s => String(s).trim()).filter(Boolean),
      time: String(time).trim(),
      rating: rating !== null && rating !== undefined && rating !== '' ? Number(rating) : 3
    };

    routes.unshift(newRoute);
    writeRoutes(routes);

    res.status(201).json({ message: 'Yeni rut başarıyla kaydedildi.', route: newRoute, total: routes.length });
  } catch (err) {
    console.error('Rut kaydetme hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
});

// Ana sayfa yönlendirmesi
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚛 LOGIX.AI Rut Sunucusu Çalışıyor: http://localhost:${PORT}`);
  console.log(`📂 Veri Kaynağı: ${DATA_FILE}`);
  console.log(`==================================================`);
});
