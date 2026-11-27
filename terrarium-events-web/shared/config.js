export const events = {
  slot: {
    title: 'Vườn may mắn 777',
    subtitle: 'Quay số nhận quà hiếm',
    badge: '3 lượt/ngày',
    theme: 'gold',
    icon: '🎰',
    description: 'Ba biểu tượng giống nhau, một món quà bất ngờ.',
    rule: '3 lượt miễn phí mỗi ngày. Ba ô giống nhau sẽ nhận quà; kết quả khác chưa trúng. Tỷ lệ trong bản demo không phải tỷ lệ phát hành.',
    rewardIds: ['plant30', 'pot30', 'oxygen'],
    rewardQuantities: { plant30: 1, pot30: 1, oxygen: 5000 }
  },
  match: {
    title: 'Lật lá tìm quà',
    subtitle: 'Ghép cặp lá bí ẩn',
    badge: '1 lượt/ngày',
    theme: 'emerald',
    icon: '🍃',
    description: 'Chỉ cần tìm được một cặp giống nhau.',
    rule: '9 ô gồm 4 cặp quà và 1 ô lá trống. Mỗi lượt chơi được thử 3 cặp. Tìm được 1 cặp là kết thúc và nhận đúng quà đó. 1 lượt chơi miễn phí/ngày.',
    rewardIds: ['plant11', 'pot11', 'fertilizer', 'oxygen'],
    rewardQuantities: { plant11: 1, pot11: 1, fertilizer: 1, oxygen: 3000 }
  },
  oxygen: {
    title: 'Hơi thở khu vườn',
    subtitle: 'Tích luỹ O₂ mở mốc',
    badge: '4 mốc quà',
    theme: 'cyan',
    icon: '🫧',
    description: 'Thu thập oxygen trong app, mở khóa từng món quà.',
    rule: 'Tính tổng oxygen kiếm được từ hoạt động chơi trong thời gian sự kiện, không tính số dư và không giảm khi tiêu. Oxygen từ quà sự kiện không cộng lại vào tiến độ.',
    rewardIds: ['fertilizer', 'pot21', 'plant21', 'gemstone'],
    rewardQuantities: { fertilizer: 1, pot21: 1, plant21: 1, gemstone: 500 },
    milestones: [10000, 50000, 100000, 500000]
  },
  level: {
    title: 'Nhà vườn trưởng thành',
    subtitle: 'Quà thăng cấp tài khoản',
    badge: '3 cấp độ',
    theme: 'lime',
    icon: '🌱',
    description: 'Mỗi bước trưởng thành, thêm một phần thưởng.',
    rule: 'Tính level tài khoản, không phải level cây. Đã vượt mốc trước sự kiện vẫn được nhận. Mỗi mốc nhận một lần trong sự kiện.',
    rewardIds: ['oxygen', 'pot20', 'plant20'],
    rewardQuantities: { oxygen: 3000, pot20: 1, plant20: 1 },
    milestones: [5, 15, 50]
  },
  daily: {
    title: 'Bảy ngày xanh',
    subtitle: 'Điểm danh tích luỹ',
    badge: '7 ngày quà',
    theme: 'amber',
    icon: '🎁',
    description: 'Ghé vườn mỗi ngày, mang quà về nhà.',
    rule: '7 lần điểm danh tích lũy trong sự kiện. Mỗi ngày chỉ nhận 1 lần, bỏ ngày không mất tiến độ. Không được nhận bù nhiều ngày cùng lúc. Ngày tính theo Asia/Ho_Chi_Minh từ backend.',
    rewardIds: ['oxygen', 'fertilizer', 'oxygen', 'pot8', 'oxygen', 'fertilizer', 'plant8'],
    rewardQuantities: { oxygen: 300, fertilizer: 1, pot8: 1, plant8: 1 }
  },
  monthly: {
    title: '30 Ngày Xanh',
    subtitle: 'Điểm danh 30 ngày nhận quà ngẫu nhiên',
    badge: '30 ngày/tháng',
    theme: 'emerald',
    icon: '🗓️',
    description: 'Mỗi tháng tạo mới ngẫu nhiên 30 phần thưởng: Oxygen, Đá quý, Vé, Phân bón và Xẻng theo độ quý hiếm.',
    rule: 'Mỗi tháng (Asia/Ho_Chi_Minh) hệ thống tạo ngẫu nhiên bảng 30 phần thưởng theo độ quý hiếm: Oxygen (Thường), Phân bón (Ít gặp), Xẻng (Hiếm), Đá quý (Sử thi), Vé (Huyền thoại). Sang tháng mới tự động làm mới toàn bộ 30 ngày. Thành viên VIP nhận ×2 số lượng mỗi ngày!',
    rewardIds: ['oxygen', 'fertilizer', 'shovel', 'gemstone', 'ticket'],
    rewardQuantities: { oxygen: 300, fertilizer: 1, shovel: 1, gemstone: 10, ticket: 1 }
  }
};

export const catalog = {
  plant30: {
    name: 'Lucky Bamboo',
    subname: 'Cây huyền thoại',
    icon: '🎍',
    localImage: 'assets/items/plant20.png',
    quantity: 1,
    rarity: 'legendary'
  },
  plant21: {
    name: 'Ficus Elastica',
    subname: 'Cây hiếm',
    icon: '🪴',
    localImage: 'assets/items/plant20.png',
    quantity: 1,
    rarity: 'epic'
  },
  plant20: {
    name: 'Prickly Pear Cactus',
    subname: 'Cây hiếm',
    icon: '🌵',
    localImage: 'assets/items/plant20.png',
    quantity: 1,
    rarity: 'legendary'
  },
  plant11: {
    name: 'Dracaena trifasciata',
    subname: 'Lưỡi hổ',
    icon: '🪴',
    localImage: 'assets/items/plant2.png',
    quantity: 1,
    rarity: 'rare'
  },
  plant8: {
    name: 'Schefflera',
    subname: 'Ngũ gia bì',
    icon: '🌿',
    localImage: 'assets/items/plant2.png',
    quantity: 1,
    rarity: 'rare'
  },
  plant2: {
    name: 'Aloe Vera',
    subname: 'Nha đam xanh',
    icon: '🪴',
    localImage: 'assets/items/plant2.png',
    quantity: 1,
    rarity: 'rare'
  },
  pot30: {
    name: 'Chậu ống nâu rêu sẫm',
    subname: 'Chậu đặc biệt',
    icon: '🏺',
    localImage: 'assets/items/pot1.png',
    quantity: 1,
    rarity: 'legendary'
  },
  pot21: {
    name: 'Chậu gốm vân đá xám nâu',
    subname: 'Chậu gốm hiếm',
    icon: '🏺',
    localImage: 'assets/items/pot1.png',
    quantity: 1,
    rarity: 'epic'
  },
  pot20: {
    name: 'Chậu đất nung viền sọc',
    subname: 'Chậu gốm hiếm',
    icon: '🏺',
    localImage: 'assets/items/pot1.png',
    quantity: 1,
    rarity: 'rare'
  },
  pot11: {
    name: 'Chậu gốm be chuyển sắc',
    subname: 'Chậu gốm',
    icon: '🏺',
    localImage: 'assets/items/pot1.png',
    quantity: 1,
    rarity: 'rare'
  },
  pot8: {
    name: 'Chậu đất nung dáng cao',
    subname: 'Chậu đất nung',
    icon: '🏺',
    localImage: 'assets/items/pot1.png',
    quantity: 1,
    rarity: 'rare'
  },
  pot1: {
    name: 'Chậu Pot1',
    subname: 'Chậu gốm kem',
    icon: '🏺',
    localImage: 'assets/items/pot1.png',
    quantity: 1,
    rarity: 'rare'
  },
  oxygen: {
    name: 'Oxygen',
    subname: 'Bọt khí O₂',
    icon: '🫧',
    localImage: 'assets/items/oxygen.png',
    quantity: 300,
    rarity: 'common'
  },
  fertilizer: {
    name: 'Phân bón',
    subname: 'Dưỡng chất cây',
    icon: '🌿',
    localImage: 'assets/items/fertilizer.png',
    quantity: 1,
    rarity: 'uncommon'
  },
  shovel: {
    name: 'Xẻng',
    subname: 'Di dời cây & chậu',
    icon: '⛏️',
    localImage: 'assets/items/shovel.png',
    quantity: 1,
    rarity: 'rare'
  },
  gemstone: {
    name: 'Đá quý',
    subname: 'Ngọc quý khu vườn',
    icon: '💎',
    localImage: 'assets/items/gemstone.png',
    quantity: 10,
    rarity: 'epic'
  },
  ticket: {
    name: 'Vé thời tiết',
    subname: 'Tạo mưa & gió',
    icon: '🎫',
    localImage: 'assets/items/ticket.png',
    quantity: 1,
    rarity: 'legendary'
  }
};
