# Market Price Finder

Bu proje, market ürünlerinin fiyatlarını ve bilgilerini yönetmek için geliştirilmiş bir web uygulamasıdır.

## Özellikler

- Ürün ekleme, düzenleme ve silme
- Ürün arama ve filtreleme
- Fiyat ve puan sıralama
- Resim yükleme desteği
- Responsive tasarım

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/kullaniciadi/market-price-finder.git
cd market-price-finder
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```

3. MongoDB'yi başlatın:
```bash
mongod
```

4. Uygulamayı başlatın:
```bash
npm run dev
```

Uygulama http://localhost:5000 adresinde çalışacaktır.

## Kullanım

### Ürün Ekleme
1. Ana sayfada "Add/Edit Item" formunu kullanın
2. Ürün bilgilerini girin (başlık, tür, açıklama, fiyat, puan)
3. İsteğe bağlı olarak ürün resmi yükleyin
4. "Save Item" butonuna tıklayın

### Ürün Arama ve Filtreleme
- Arama kutusunu kullanarak ürünleri arayabilirsiniz
- Kategori filtresini kullanarak ürünleri türe göre filtreleyebilirsiniz
- Sıralama seçeneğini kullanarak ürünleri fiyat veya puana göre sıralayabilirsiniz

### Ürün Düzenleme
1. Ürün kartındaki "Edit" butonuna tıklayın
2. Form otomatik olarak doldurulacaktır
3. Değişiklikleri yapın ve "Save Item" butonuna tıklayın

### Ürün Silme
- Ürün kartındaki "Delete" butonuna tıklayarak ürünü silebilirsiniz

## Teknolojiler

- Node.js
- Express.js
- MongoDB
- Multer (dosya yükleme)
- Bootstrap 5
- JavaScript (ES6+)

## Lisans

MIT 