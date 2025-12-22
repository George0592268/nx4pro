import { IndustryNode } from "./types";

export const INITIAL_INDUSTRIES: IndustryNode[] = [
  {
    id: 'manufacturing',
    label: 'Обрабатывающее производство',
    type: 'industry',
    selected: false,
    children: [
      { id: 'metal', label: 'Металлообработка', type: 'industry', selected: false },
      { id: 'textile', label: 'Текстиль и одежда', type: 'industry', selected: false },
      { id: 'food', label: 'Пищевая промышленность', type: 'industry', selected: false },
      { id: 'furniture', label: 'Производство мебели', type: 'industry', selected: false },
    ]
  },
  {
    id: 'construction',
    label: 'Строительство и ремонт',
    type: 'industry',
    selected: false,
    children: [
      { id: 'housing', label: 'Жилищное строительство', type: 'industry', selected: false },
      { id: 'finishing', label: 'Отделочные работы', type: 'industry', selected: false },
      { id: 'engineering', label: 'Инженерные коммуникации', type: 'industry', selected: false },
    ]
  },
  {
    id: 'retail',
    label: 'Торговля (Ритейл & E-commerce)',
    type: 'industry',
    selected: false,
    children: [
      { id: 'online_shops', label: 'Интернет-магазины', type: 'industry', selected: false },
      { id: 'marketplaces', label: 'Работа с маркетплейсами', type: 'industry', selected: false },
      { id: 'retail_offline', label: 'Розничные точки', type: 'industry', selected: false },
    ]
  },
  {
    id: 'logistics',
    label: 'Транспорт и Логистика',
    type: 'industry',
    selected: false,
    children: [
      { id: 'trucking', label: 'Грузоперевозки', type: 'industry', selected: false },
      { id: 'warehousing', label: 'Складская логистика', type: 'industry', selected: false },
      { id: 'courier', label: 'Курьерские службы', type: 'industry', selected: false },
    ]
  },
  {
    id: 'services_b2b',
    label: 'Бизнес-услуги (B2B)',
    type: 'industry',
    selected: false,
    children: [
      { id: 'accounting', label: 'Бухгалтерия и налоги', type: 'industry', selected: false },
      { id: 'legal', label: 'Юридические услуги', type: 'industry', selected: false },
      { id: 'hr', label: 'HR и Кадры', type: 'industry', selected: false },
    ]
  },
  {
    id: 'horeca',
    label: 'Гостиницы и Рестораны (HoReCa)',
    type: 'industry',
    selected: false,
    children: [
      { id: 'restaurants', label: 'Рестораны и кафе', type: 'industry', selected: false },
      { id: 'hotels', label: 'Отели и хостелы', type: 'industry', selected: false },
    ]
  },
  {
    id: 'agriculture',
    label: 'Сельское хозяйство',
    type: 'industry',
    selected: false,
    children: []
  }
];