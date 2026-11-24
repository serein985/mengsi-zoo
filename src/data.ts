export type ViewId =
  | "home"
  | "zoo"
  | "tasks"
  | "map"
  | "perks"
  | "memories"
  | "admin";

export type CareActionId = "feed" | "groom" | "play";

export interface Animal {
  id: string;
  name: string;
  species: string;
  image: string;
  imagePosition: string;
  level: number;
  personality: string;
  fact: string;
  meetTip: string;
  dailyStory: string;
  memoryLine: string;
  habitat: string;
  accent: string;
  soft: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  points: number;
  science?: number;
  type: "care" | "quiz" | "checkin" | "story";
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  cost: number;
  stock: string;
  tone: "forest" | "clay" | "gold";
}

export interface Checkpoint {
  id: string;
  name: string;
  zone: string;
  description: string;
  x: number;
  y: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface MemoryItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "adopt" | "care" | "quiz" | "checkin";
  image?: string;
}

export interface PersistedState {
  adoptedAnimalId: string;
  companionPoints: number;
  sciencePoints: number;
  careDate: string;
  dailyDate: string;
  careDone: CareActionId[];
  completedTasks: string[];
  claimedCoupons: string[];
  redeemedCoupons: string[];
  checkins: string[];
  approvedContent: string[];
  childMode: boolean;
  memories: MemoryItem[];
}

export const animals: Animal[] = [
  {
    id: "tiger",
    name: "小满",
    species: "东北虎",
    image: "./assets/tiger.jpg",
    imagePosition: "72% center",
    level: 4,
    personality: "好奇 · 爱晒太阳",
    fact: "老虎的条纹不只在毛发上，皮肤上也有相似的纹路。",
    meetTip: "午后去虎馆，常能遇见小满在树荫下打盹。",
    dailyStory: "今天的小满在松林边来回走了三圈，午后准备去找一块最暖的石头。",
    memoryLine: "今天的小满在树荫下打了个很长的哈欠。下次记得来看看它。",
    habitat: "松林坡地",
    accent: "#c96f43",
    soft: "#f0d7c4",
  },
  {
    id: "red-panda",
    name: "团团",
    species: "小熊猫",
    image: "./assets/red-panda.jpg",
    imagePosition: "center 57%",
    level: 3,
    personality: "慢热 · 爱苹果",
    fact: "小熊猫有一条蓬松的大尾巴，睡觉时可以当作围巾。",
    meetTip: "清晨的小熊猫馆最安静，适合慢慢观察。",
    dailyStory: "团团在竹林边慢慢绕了一圈，挑好位置后才安心坐下。",
    memoryLine: "团团抱着尾巴睡了一小会儿，醒来又认真闻了闻竹叶。",
    habitat: "竹林缓坡",
    accent: "#a95e3f",
    soft: "#ead6c4",
  },
  {
    id: "sheep",
    name: "绵绵",
    species: "绵羊",
    image: "./assets/sheep.png",
    imagePosition: "center 42%",
    level: 3,
    personality: "温柔 · 喜欢梳毛",
    fact: "羊的瞳孔是横条形的，能看到更宽广的视野。",
    meetTip: "在牧场边保持安静，绵绵会更愿意靠近。",
    dailyStory: "绵绵在阳光牧场里等着梳毛，风一吹，毛尖就轻轻晃。",
    memoryLine: "绵绵安静地站在阳光里，远远看见你时抬了抬耳朵。",
    habitat: "阳光牧场",
    accent: "#7f9165",
    soft: "#e3e5cf",
  },
];

export const dailyTasks: DailyTask[] = [
  {
    id: "morning-care",
    title: "给小满梳梳毛",
    description: "完成一次今日照顾",
    points: 10,
    type: "care",
  },
  {
    id: "animal-sound",
    title: "听一段动物声音",
    description: "分辨老虎的低频呼唤",
    points: 8,
    type: "story",
  },
  {
    id: "science-quiz",
    title: "完成 3 道科普题",
    description: "答错也没关系，会给出解释",
    points: 15,
    science: 3,
    type: "quiz",
  },
  {
    id: "zoo-checkin",
    title: "解锁今日见面任务",
    description: "到园扫码，获得限定徽章",
    points: 30,
    type: "checkin",
  },
];

export const coupons: Coupon[] = [
  {
    id: "ticket-5",
    title: "门票立减 5 元",
    description: "南京红山森林动物园 · 成人票",
    cost: 120,
    stock: "本月剩余 36 张",
    tone: "forest",
  },
  {
    id: "guide",
    title: "保育员讲解预约",
    description: "虎馆自然观察 · 周六 14:00",
    cost: 180,
    stock: "需提前 1 天预约",
    tone: "clay",
  },
  {
    id: "postcard",
    title: "小满限定明信片",
    description: "园内文创店自取 · 每人限领 1 张",
    cost: 80,
    stock: "本月剩余 18 张",
    tone: "gold",
  },
  {
    id: "member-day",
    title: "会员日幕后探访",
    description: "动物营养师工作坊 · 不含动物接触",
    cost: 420,
    stock: "每周开放 20 个名额",
    tone: "forest",
  },
];

export const checkpoints: Checkpoint[] = [
  {
    id: "gate",
    name: "森林入口",
    zone: "入园任务",
    description: "领取今日路线与第一枚脚印",
    x: 17,
    y: 72,
  },
  {
    id: "tiger-hill",
    name: "虎馆",
    zone: "小满的家",
    description: "观察树荫、爪印与老虎的日常",
    x: 49,
    y: 39,
  },
  {
    id: "red-panda",
    name: "小熊猫馆",
    zone: "竹林缓坡",
    description: "听一段保育员的声音故事",
    x: 77,
    y: 68,
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    question: "老虎的条纹只长在毛发上吗？",
    options: ["是，皮肤没有条纹", "不是，皮肤上也有纹路", "只有幼虎才有"],
    answer: 1,
    explanation: "老虎的毛发和皮肤上都有条纹，每只虎的纹路也像指纹一样独特。",
  },
  {
    question: "小熊猫遇到危险时通常会怎样？",
    options: ["完全躲进水里", "举起尾巴让自己看起来更大", "发出像鸟一样的叫声"],
    answer: 1,
    explanation: "小熊猫会站立并举起尾巴，用更大的轮廓吓退潜在威胁。",
  },
  {
    question: "绵羊为什么能看到更宽广的视野？",
    options: ["因为瞳孔是横条形的", "因为耳朵会转动", "因为眼睛会发光"],
    answer: 0,
    explanation: "横条形瞳孔扩大了水平视野，帮助绵羊留意周围环境。",
  },
];

export const metrics = [
  { label: "到园游客", value: 10000, rate: "基数", width: 100 },
  { label: "扫码进入", value: 3000, rate: "30%", width: 30 },
  { label: "完成领养", value: 1800, rate: "60%", width: 18 },
  { label: "领取权益", value: 360, rate: "20%", width: 10 },
  { label: "到园核销", value: 90, rate: "25%", width: 6 },
  { label: "二次消费", value: 45, rate: "50%", width: 4 },
];

export const reviewQueue = [
  {
    id: "review-1",
    title: "小满的夏日护理",
    author: "保育员 林老师",
    type: "动物档案",
    time: "今天 10:24",
  },
  {
    id: "review-2",
    title: "小熊猫的伪拇指",
    author: "科普组",
    type: "冷知识",
    time: "昨天 16:40",
  },
  {
    id: "review-3",
    title: "牧场观察礼仪",
    author: "保育员 周老师",
    type: "到园任务",
    time: "11月22日",
  },
];

export const initialMemories: MemoryItem[] = [
  {
    id: "memory-start",
    date: "11月21日",
    title: "第一次认识小满",
    description: "你选择了小满，也收下了第一张动物档案。",
    type: "adopt",
    image: "./assets/tiger.jpg",
  },
  {
    id: "memory-quiz",
    date: "11月23日",
    title: "收下一枚知识徽章",
    description: "完成“老虎的条纹”科普题，获得 3 点科普值。",
    type: "quiz",
  },
];

export const initialPersistedState: PersistedState = {
  adoptedAnimalId: "tiger",
  companionPoints: 268,
  sciencePoints: 9,
  careDate: "",
  dailyDate: "",
  careDone: [],
  completedTasks: ["animal-sound"],
  claimedCoupons: [],
  redeemedCoupons: [],
  checkins: [],
  approvedContent: [],
  childMode: true,
  memories: initialMemories,
};

export function todayKey(): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
