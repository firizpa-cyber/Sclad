import { Product } from '../types';

export const categories = [
  'Бамперы', 'Крылья', 'Фары', 'Расходники', 'Масла', 'Фильтры', 'Свечи зажигания',
  'Тормозные колодки', 'Тормозные диски', 'Амортизаторы', 'Стойки стабилизатора',
  'Шаровые опоры', 'Рулевые наконечники', 'Сайлентблоки', 'Ремни ГРМ', 'Ролики ГРМ',
  'Помпы водяные', 'Термостаты', 'Радиаторы', 'Вентиляторы', 'Аккумуляторы',
  'Стартеры', 'Генераторы', 'Датчики', 'Прокладки', 'Сальники', 'Подшипники',
  'Глушители', 'Катализаторы', 'Лямбда-зонды', 'Топливные насосы', 'Форсунки',
  'Катушки зажигания', 'Провода высоковольтные', 'Сцепление', 'Маховики',
  'Приводы', 'ШРУСы', 'Пыльники', 'Стеклоочистители', 'Зеркала', 'Стекла',
  'Двери', 'Капоты', 'Крышки багажника', 'Решетки радиатора', 'Подкрылки',
  'Брызговики', 'Коврики', 'Чехлы', 'Автохимия'
];

export const MOCK_PRODUCTS: Product[] = [];
let idCounter = 1000;
const brands = ['Toyota', 'BMW', 'Mercedes-Benz', 'Honda', 'Nissan', 'Ford', 'Audi', 'Hyundai', 'Kia', 'Lexus', 'Volkswagen', 'Skoda', 'Renault', 'Peugeot'];

categories.forEach(category => {
  for (let i = 0; i < 30; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const buyPrice = Math.floor(Math.random() * 5000) + 500;
    const sellPrice = buyPrice + Math.floor(Math.random() * 3000) + 500;
    MOCK_PRODUCTS.push({
      id: `prod_${idCounter++}`,
      name: `${category} ${brand} (Модель ${Math.floor(Math.random() * 50) + 1}) - Деталь ${i + 1}`,
      buyPrice,
      sellPrice,
      stock: {
        khona: Math.floor(Math.random() * 15),
        main: Math.floor(Math.random() * 40),
        shop: Math.floor(Math.random() * 20)
      },
      brand: brand,
      model: `Model ${Math.floor(Math.random() * 10)}`,
      barcode: `200000${Math.floor(Math.random() * 900000) + 100000}`,
      minStock: 5
    });
  }
});
