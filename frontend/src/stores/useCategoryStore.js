import { create } from 'zustand';

// Icon mapping for categories
const MOCK_CATEGORIES = [
  {
    id: '1',
    name: 'Kháng sinh',
    code: 'KS',
    description: 'Thuốc kháng khuẩn, chống nhiễm trùng do vi khuẩn gây ra',
    icon: 'pill',
    medicineCount: 156,
    status: 'active',
  },
  {
    id: '2',
    name: 'Giảm đau - Hạ sốt',
    code: 'GD',
    description: 'Thuốc giảm đau, hạ sốt thông dụng',
    icon: 'thermometer',
    medicineCount: 89,
    status: 'active',
  },
  {
    id: '3',
    name: 'Tim mạch',
    code: 'TM',
    description: 'Thuốc điều trị các bệnh lý tim mạch, huyết áp',
    icon: 'heart',
    medicineCount: 67,
    status: 'active',
  },
  {
    id: '4',
    name: 'Tiêu hóa',
    code: 'TH',
    description: 'Thuốc điều trị dạ dày, đường ruột và hệ tiêu hóa',
    icon: 'apple',
    medicineCount: 45,
    status: 'active',
  },
  {
    id: '5',
    name: 'Hô hấp',
    code: 'HH',
    description: 'Thuốc điều trị ho, hen suyễn, viêm phổi và đường hô hấp',
    icon: 'wind',
    medicineCount: 38,
    status: 'active',
  },
  {
    id: '6',
    name: 'Da liễu',
    code: 'DL',
    description: 'Thuốc dùng ngoài da, kem bôi, dung dịch sát khuẩn',
    icon: 'hand',
    medicineCount: 52,
    status: 'active',
  },
  {
    id: '7',
    name: 'Thần kinh',
    code: 'TK',
    description: 'Thuốc an thần, chống co giật, điều trị rối loạn thần kinh',
    icon: 'brain',
    medicineCount: 23,
    status: 'active',
  },
  {
    id: '8',
    name: 'Vitamin & Khoáng chất',
    code: 'VT',
    description: 'Thực phẩm chức năng, vitamin tổng hợp, bổ sung khoáng chất',
    icon: 'sun',
    medicineCount: 114,
    status: 'active',
  },
  {
    id: '9',
    name: 'Mắt - Tai - Mũi',
    code: 'MT',
    description: 'Thuốc nhỏ mắt, nhỏ tai, xịt mũi',
    icon: 'eye',
    medicineCount: 31,
    status: 'active',
  },
  {
    id: '10',
    name: 'Nội tiết',
    code: 'NT',
    description: '',
    icon: 'activity',
    medicineCount: 0,
    status: 'empty',
  },
  {
    id: '11',
    name: 'Ung bướu',
    code: 'UB',
    description: '',
    icon: 'shield',
    medicineCount: 0,
    status: 'empty',
  },
];

const useCategoryStore = create((set, get) => ({
  categories: MOCK_CATEGORIES,

  get summary() {
    const cats = get().categories;
    return {
      total: cats.length,
      totalMedicines: cats.reduce((sum, c) => sum + c.medicineCount, 0),
      emptyCount: cats.filter((c) => c.status === 'empty').length,
    };
  },

  getSummary: () => {
    const cats = get().categories;
    return {
      total: cats.length,
      totalMedicines: cats.reduce((sum, c) => sum + c.medicineCount, 0),
      emptyCount: cats.filter((c) => c.status === 'empty').length,
    };
  },

  addCategory: (category) =>
    set((state) => ({
      categories: [
        ...state.categories,
        {
          ...category,
          id: String(Date.now()),
          medicineCount: 0,
          status: 'empty',
        },
      ],
    })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
}));

export default useCategoryStore;
