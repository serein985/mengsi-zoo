import {
  Apple,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Brush,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CloudSun,
  Footprints,
  Gamepad2,
  Gift,
  Heart,
  Home,
  Images,
  LayoutDashboard,
  Leaf,
  ListChecks,
  LockKeyhole,
  Map,
  MapPin,
  MessageCircle,
  MoonStar,
  PawPrint,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Ticket,
  TreePine,
  Volume2,
  X,
} from "lucide-react";
import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  animals,
  checkpoints,
  coupons,
  dailyTasks,
  initialPersistedState,
  metrics,
  quizQuestions,
  reviewQueue,
  todayKey,
  type Animal,
  type CareActionId,
  type Coupon,
  type DailyTask,
  type PersistedState,
  type ViewId,
} from "./data";

type Icon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

interface NavItem {
  id: ViewId;
  label: string;
  shortLabel: string;
  icon: Icon;
}

const navItems: NavItem[] = [
  { id: "home", label: "我的小窝", shortLabel: "小窝", icon: Home },
  { id: "zoo", label: "动物朋友", shortLabel: "动物园", icon: PawPrint },
  { id: "tasks", label: "今日任务", shortLabel: "任务", icon: ListChecks },
  { id: "map", label: "到园地图", shortLabel: "地图", icon: Map },
  { id: "perks", label: "我的权益", shortLabel: "权益", icon: Ticket },
  { id: "memories", label: "成长回忆", shortLabel: "回忆", icon: Images },
  { id: "admin", label: "园方工作台", shortLabel: "工作台", icon: LayoutDashboard },
];

const mobileNavItems = navItems.filter((item) => item.id !== "map" && item.id !== "admin");

const careOptions: Array<{
  id: CareActionId;
  label: string;
  points: number;
  icon: Icon;
  message: string;
}> = [
  { id: "feed", label: "准备加餐", points: 8, icon: Apple, message: "小满闻到了苹果香" },
  { id: "groom", label: "轻轻梳毛", points: 8, icon: Brush, message: "小满舒服地眯起了眼睛" },
  { id: "play", label: "玩一会儿", points: 10, icon: Gamepad2, message: "小满追着尾巴转了一圈" },
];

const viewMeta: Record<ViewId, { eyebrow: string; title: string }> = {
  home: { eyebrow: "11月24日 · 星期二", title: "小满的小窝" },
  zoo: { eyebrow: "3 位动物朋友", title: "今天想和谁见面？" },
  tasks: { eyebrow: "每天 3 分钟", title: "今日照顾任务" },
  map: { eyebrow: "南京红山森林动物园", title: "一张地图，去遇见小满" },
  perks: { eyebrow: "真实权益 · 到园可核销", title: "我的权益" },
  memories: { eyebrow: "一起积攒的日子", title: "成长回忆册" },
  admin: { eyebrow: "试点园 · 运营后台", title: "园方工作台" },
};

function loadPersistedState(): PersistedState {
  const today = todayKey();
  try {
    const raw = localStorage.getItem("mengsi-zoo-state-v1");
    if (!raw) {
      return {
        ...initialPersistedState,
        careDate: today,
        dailyDate: today,
      };
    }

    const saved = { ...initialPersistedState, ...JSON.parse(raw) } as PersistedState;
    const sameDay = saved.dailyDate === today;
    return {
      ...saved,
      careDate: today,
      dailyDate: today,
      careDone: saved.careDate === today ? saved.careDone : [],
      completedTasks: sameDay ? saved.completedTasks : [],
    };
  } catch {
    return {
      ...initialPersistedState,
      careDate: today,
      dailyDate: today,
    };
  }
}

function App() {
  const [view, setView] = useState<ViewId>("home");
  const [state, setState] = useState<PersistedState>(loadPersistedState);
  const [toast, setToast] = useState("");
  const [careBurst, setCareBurst] = useState(0);
  const [careMessage, setCareMessage] = useState("今天想怎么照顾小满？");
  const [quizOpen, setQuizOpen] = useState(false);
  const [redeemCoupon, setRedeemCoupon] = useState<Coupon | null>(null);

  const adoptedAnimal =
    animals.find((animal) => animal.id === state.adoptedAnimalId) ?? animals[0];
  const completedCount = dailyTasks.filter((task) =>
    isTaskComplete(task, state),
  ).length;

  useEffect(() => {
    localStorage.setItem("mengsi-zoo-state-v1", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function navigate(nextView: ViewId) {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function notify(message: string) {
    setToast(message);
  }

  function careForAnimal(action: CareActionId) {
    const option = careOptions.find((item) => item.id === action);
    if (!option) return;
    if (state.careDone.includes(action)) {
      notify("今天已经照顾过啦，晚点再来看看小满");
      return;
    }

    setState((current) => ({
      ...current,
      companionPoints: current.companionPoints + option.points,
      careDone: [...current.careDone, action],
      completedTasks: current.completedTasks.includes("morning-care")
        ? current.completedTasks
        : [...current.completedTasks, "morning-care"],
      memories:
        current.careDone.length === 0
          ? [
              {
                id: `memory-care-${Date.now()}`,
                date: "今天",
                title: "小满今天很开心",
                description: `你完成了一次照顾，陪伴值增加了 ${option.points} 点。`,
                type: "care",
              },
              ...current.memories,
            ]
          : current.memories,
    }));
    setCareMessage(option.message);
    setCareBurst((value) => value + 1);
    notify(`陪伴值 +${option.points}`);
  }

  function completeStoryTask() {
    if (state.completedTasks.includes("animal-sound")) {
      notify("今天已经听过小满的声音啦");
      return;
    }
    setState((current) => ({
      ...current,
      companionPoints: current.companionPoints + 8,
      completedTasks: [...current.completedTasks, "animal-sound"],
    }));
    notify("听到了小满低低的回应 · 陪伴值 +8");
  }

  function finishQuiz() {
    if (!state.completedTasks.includes("science-quiz")) {
      setState((current) => ({
        ...current,
        companionPoints: current.companionPoints + 15,
        sciencePoints: current.sciencePoints + 3,
        completedTasks: [...current.completedTasks, "science-quiz"],
        memories: [
          {
            id: `memory-quiz-${Date.now()}`,
            date: "今天",
            title: "完成今日科普小测",
            description: "解锁一条关于动物视野的新知识，获得 3 点科普值。",
            type: "quiz",
          },
          ...current.memories,
        ],
      }));
    }
    setQuizOpen(false);
    notify("科普值 +3 · 陪伴值 +15");
  }

  function adoptAnimal(animal: Animal) {
    if (animal.id === state.adoptedAnimalId) {
      navigate("home");
      notify(`${animal.name}正在小窝等你`);
      return;
    }

    setState((current) => ({
      ...current,
      adoptedAnimalId: animal.id,
      memories: [
        {
          id: `memory-adopt-${animal.id}-${Date.now()}`,
          date: "今天",
          title: `认识了${animal.name}`,
          description: `你开始陪伴${animal.species}${animal.name}，收下了新的动物档案。`,
          type: "adopt",
          image: animal.image,
        },
        ...current.memories,
      ],
    }));
    setCareMessage(`和${animal.name}打个招呼吧`);
    navigate("home");
    notify(`${animal.name}已经搬进小窝`);
  }

  function checkIn(checkpointId: string) {
    const checkpoint = checkpoints.find((item) => item.id === checkpointId);
    if (!checkpoint) return;
    if (state.checkins.includes(checkpointId)) {
      notify(`${checkpoint.name}已经打卡`);
      return;
    }

    setState((current) => ({
      ...current,
      companionPoints: current.companionPoints + 30,
      checkins: [...current.checkins, checkpointId],
      completedTasks: current.completedTasks.includes("zoo-checkin")
        ? current.completedTasks
        : [...current.completedTasks, "zoo-checkin"],
      memories: [
        {
          id: `memory-checkin-${checkpointId}-${Date.now()}`,
          date: "今天",
          title: `在${checkpoint.name}见面`,
          description: checkpoint.description,
          type: "checkin",
        },
        ...current.memories,
      ],
    }));
    notify(`${checkpoint.name}打卡成功 · 陪伴值 +30`);
  }

  function claimCoupon(coupon: Coupon) {
    if (state.claimedCoupons.includes(coupon.id)) {
      setRedeemCoupon(coupon);
      return;
    }
    if (state.companionPoints < coupon.cost) {
      notify(`还差 ${coupon.cost - state.companionPoints} 点陪伴值`);
      return;
    }

    setState((current) => ({
      ...current,
      companionPoints: current.companionPoints - coupon.cost,
      claimedCoupons: [...current.claimedCoupons, coupon.id],
    }));
    setRedeemCoupon(coupon);
    notify("权益已放入券包");
  }

  function handleTask(task: DailyTask) {
    if (isTaskComplete(task, state)) {
      notify("今天这项已经完成啦");
      return;
    }
    if (task.type === "quiz") {
      setQuizOpen(true);
      return;
    }
    if (task.type === "checkin") {
      navigate("map");
      notify("选择一个园内点位完成打卡");
      return;
    }
    if (task.type === "care") {
      careForAnimal("groom");
      return;
    }
    completeStoryTask();
  }

  function approveReview(reviewId: string) {
    if (state.approvedContent.includes(reviewId)) return;
    setState((current) => ({
      ...current,
      approvedContent: [...current.approvedContent, reviewId],
    }));
    notify("内容已通过园方审校");
  }

  function toggleChildMode() {
    setState((current) => ({ ...current, childMode: !current.childMode }));
    notify(state.childMode ? "儿童模式已关闭" : "儿童模式已开启");
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeView={view}
        companionPoints={state.companionPoints}
        childMode={state.childMode}
        onNavigate={navigate}
        onToggleChildMode={toggleChildMode}
      />

      <main className="main-shell">
        <Topbar
          view={view}
          adoptedAnimalName={adoptedAnimal.name}
          childMode={state.childMode}
          onToggleChildMode={toggleChildMode}
          onOpenAdmin={() => navigate("admin")}
          onNotify={() => notify("今天没有新的提醒")}
        />

        <div className="page-content">
          {view === "home" && (
            <HomePage
              animal={adoptedAnimal}
              state={state}
              completedCount={completedCount}
              careMessage={careMessage}
              careBurst={careBurst}
              onCare={careForAnimal}
              onTask={handleTask}
              onNavigate={navigate}
              onQuiz={() => setQuizOpen(true)}
              onCoupon={() => navigate("perks")}
            />
          )}
          {view === "zoo" && (
            <ZooPage
              adoptedAnimalId={state.adoptedAnimalId}
              onAdopt={adoptAnimal}
            />
          )}
          {view === "tasks" && (
            <TasksPage
              state={state}
              completedCount={completedCount}
              onTask={handleTask}
              onNavigate={navigate}
            />
          )}
          {view === "map" && (
            <MapPage state={state} onCheckIn={checkIn} onNavigate={navigate} />
          )}
          {view === "perks" && (
            <PerksPage
              state={state}
              onClaim={claimCoupon}
              onOpenCode={setRedeemCoupon}
              onNavigate={navigate}
            />
          )}
          {view === "memories" && (
            <MemoriesPage state={state} onNotify={notify} />
          )}
          {view === "admin" && (
            <AdminPage
              state={state}
              onApprove={approveReview}
              onNotify={notify}
            />
          )}
        </div>
      </main>

      <MobileNav activeView={view} onNavigate={navigate} />
      {toast && <Toast message={toast} />}
      {quizOpen && (
        <QuizModal onClose={() => setQuizOpen(false)} onFinish={finishQuiz} />
      )}
      {redeemCoupon && (
        <RedeemModal
          coupon={redeemCoupon}
          onClose={() => setRedeemCoupon(null)}
          onNotify={notify}
        />
      )}
    </div>
  );
}

function isTaskComplete(task: DailyTask, state: PersistedState): boolean {
  return state.completedTasks.includes(task.id);
}

function Sidebar({
  activeView,
  companionPoints,
  childMode,
  onNavigate,
  onToggleChildMode,
}: {
  activeView: ViewId;
  companionPoints: number;
  childMode: boolean;
  onNavigate: (view: ViewId) => void;
  onToggleChildMode: () => void;
}) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onNavigate("home")} type="button">
        <span className="brand-mark">
          <PawPrint size={24} strokeWidth={2.2} />
        </span>
        <span>
          <strong>萌饲Zoo</strong>
          <small>先认识，再相见</small>
        </span>
      </button>

      <nav className="sidebar-nav" aria-label="主导航">
        <p className="nav-label">陪伴空间</p>
        {navItems.slice(0, 6).map((item) => {
          const ItemIcon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? "is-active" : ""}`}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <ItemIcon size={19} strokeWidth={2} />
              <span>{item.label}</span>
              {activeView === item.id && <span className="nav-dot" />}
            </button>
          );
        })}
        <p className="nav-label nav-label-spaced">园方工具</p>
        <button
          className={`nav-item ${activeView === "admin" ? "is-active" : ""}`}
          onClick={() => onNavigate("admin")}
          type="button"
        >
          <LayoutDashboard size={19} strokeWidth={2} />
          <span>园方工作台</span>
          {activeView === "admin" && <span className="nav-dot" />}
        </button>
      </nav>

      <div className="sidebar-status">
        <div className="status-heading">
          <span>
            <Sun size={16} />
            今日陪伴
          </span>
          <strong>{companionPoints}</strong>
        </div>
        <div className="mini-progress" aria-hidden="true">
          <span style={{ width: `${Math.min(100, (companionPoints / 500) * 100)}%` }} />
        </div>
        <p>再积 {Math.max(0, 500 - companionPoints)} 点，可兑换会员日探访</p>
      </div>

      <button className="child-mode" onClick={onToggleChildMode} type="button">
        <span className="child-mode-icon">
          <MoonStar size={18} />
        </span>
        <span>
          <strong>儿童模式</strong>
          <small>{childMode ? "已开启 · 22:00 后免打扰" : "未开启"}</small>
        </span>
        <span className={`switch ${childMode ? "is-on" : ""}`} aria-hidden="true">
          <span />
        </span>
      </button>
    </aside>
  );
}

function Topbar({
  view,
  adoptedAnimalName,
  childMode,
  onToggleChildMode,
  onOpenAdmin,
  onNotify,
}: {
  view: ViewId;
  adoptedAnimalName: string;
  childMode: boolean;
  onToggleChildMode: () => void;
  onOpenAdmin: () => void;
  onNotify: () => void;
}) {
  const meta = viewMeta[view];
  const title = view === "home" ? `${adoptedAnimalName}的小窝` : meta.title;
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <span className="brand-mark small">
          <PawPrint size={20} />
        </span>
        <strong>萌饲Zoo</strong>
      </div>
      <div className="topbar-title">
        <span>{meta.eyebrow}</span>
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <button
          className={`icon-button child-toggle ${childMode ? "is-active" : ""}`}
          onClick={onToggleChildMode}
          title="切换儿童模式"
          type="button"
        >
          <MoonStar size={18} />
        </button>
        <button
          className="icon-button admin-shortcut"
          onClick={onOpenAdmin}
          title="打开园方工作台"
          type="button"
        >
          <LayoutDashboard size={18} />
        </button>
        <button
          className="icon-button notification-button"
          onClick={onNotify}
          title="查看提醒"
          type="button"
        >
          <Bell size={18} />
          <span />
        </button>
        <button className="user-pill" type="button" title="当前演示账号">
          <span>园</span>
          <span>
            <strong>园怡</strong>
            <small>陪伴第 4 天</small>
          </span>
          <ChevronRight size={15} />
        </button>
      </div>
    </header>
  );
}

function MobileNav({
  activeView,
  onNavigate,
}: {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}) {
  return (
    <nav className="mobile-nav" aria-label="移动端导航">
      {mobileNavItems.map((item) => {
        const ItemIcon = item.icon;
        return (
          <button
            key={item.id}
            className={activeView === item.id ? "is-active" : ""}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <ItemIcon size={20} />
            <span>{item.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}

function HomePage({
  animal,
  state,
  completedCount,
  careMessage,
  careBurst,
  onCare,
  onTask,
  onNavigate,
  onQuiz,
  onCoupon,
}: {
  animal: Animal;
  state: PersistedState;
  completedCount: number;
  careMessage: string;
  careBurst: number;
  onCare: (action: CareActionId) => void;
  onTask: (task: DailyTask) => void;
  onNavigate: (view: ViewId) => void;
  onQuiz: () => void;
  onCoupon: () => void;
}) {
  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">
            <CloudSun size={15} /> 晴 · 适合到园散步
          </p>
          <h1>
            下午好，{animal.name}
            <span className="title-dot">。</span>
          </h1>
          <p>今天也有 3 分钟，刚好够一次认真陪伴。</p>
        </div>
        <div className="park-chip">
          <MapPin size={17} />
          <span>
            <small>当前园区</small>
            南京红山森林动物园
          </span>
          <ChevronRight size={16} />
        </div>
      </section>

      <div className="home-grid">
        <section
          className="habitat-panel"
          style={
            {
              "--animal-accent": animal.accent,
              "--animal-soft": animal.soft,
            } as React.CSSProperties
          }
        >
          <div className="habitat-copy">
            <div className="animal-status-row">
              <span className="level-badge">LV.{animal.level}</span>
              <span className="healthy-dot" />
              状态很好
              <span className="status-divider" />
              {animal.habitat}
            </div>
            <h2>{animal.name}的小窝</h2>
            <p className="animal-personality">{animal.personality}</p>
            <p className="animal-copy">
              {animal.dailyStory}
            </p>

            <div className="animal-stats">
              <div>
                <span>陪伴值</span>
                <strong>{state.companionPoints}</strong>
              </div>
              <div>
                <span>科普值</span>
                <strong>{state.sciencePoints}</strong>
              </div>
              <div>
                <span>今日照顾</span>
                <strong>{state.careDone.length}/3</strong>
              </div>
            </div>

            <div className="care-actions">
              {careOptions.map((option) => {
                const ActionIcon = option.icon;
                const done = state.careDone.includes(option.id);
                return (
                  <button
                    key={option.id}
                    className={done ? "is-done" : ""}
                    onClick={() => onCare(option.id)}
                    type="button"
                  >
                    {done ? <Check size={18} /> : <ActionIcon size={18} />}
                    {done ? "已完成" : option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="animal-stage" aria-label={`${animal.species}${animal.name}插画`}>
            <div className="stage-sun" aria-hidden="true" />
            <TreePine className="stage-tree tree-one" size={90} strokeWidth={1.1} />
            <TreePine className="stage-tree tree-two" size={62} strokeWidth={1.1} />
            <img
              key={animal.id}
              src={animal.image}
              alt={`${animal.species}${animal.name}`}
              style={{ objectPosition: animal.imagePosition }}
            />
            <div className="care-bubble">
              <Heart size={14} fill="currentColor" />
              {careMessage}
            </div>
            {careBurst > 0 && (
              <div className="heart-burst" key={careBurst} aria-hidden="true">
                <Heart className="heart-one" fill="currentColor" />
                <Heart className="heart-two" fill="currentColor" />
                <Sparkles className="sparkle-one" />
              </div>
            )}
          </div>
        </section>

        <section className="daily-panel">
          <SectionHeader
            eyebrow="今日照顾"
            title="和小满做四件小事"
            trailing={`${completedCount}/4`}
          />
          <div className="task-list compact">
            {dailyTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                done={isTaskComplete(task, state)}
                onAction={() => onTask(task)}
              />
            ))}
          </div>
          <button
            className="link-button"
            onClick={() => onNavigate("tasks")}
            type="button"
          >
            查看本周照顾计划
            <ArrowRight size={16} />
          </button>
        </section>
      </div>

      <div className="home-quick-grid">
        <section className="map-preview">
          <div className="map-preview-copy">
            <span className="section-kicker">
              <MapPin size={15} /> 本周末
            </span>
            <h2>去园里见见小满</h2>
            <p>三个点位，一条不赶路的观察路线。</p>
            <button className="primary-button" onClick={() => onNavigate("map")} type="button">
              <QrCode size={18} />
              查看到园地图
            </button>
          </div>
          <div className="mini-route" aria-hidden="true">
            <span className="route-line" />
            <span className="route-pin pin-a">
              <Footprints size={17} />
            </span>
            <span className="route-pin pin-b">
              <PawPrint size={17} />
            </span>
            <span className="route-pin pin-c">
              <Leaf size={17} />
            </span>
            <TreePine className="route-tree" size={78} strokeWidth={1.1} />
          </div>
        </section>

        <section className="fact-panel">
          <span className="section-kicker">
            <Sparkles size={15} /> 今日冷知识
          </span>
          <h2>老虎的条纹，<br />皮肤上也有吗？</h2>
          <p>答对会得到科普值，答错也会看到解释。</p>
          <button className="secondary-button" onClick={onQuiz} type="button">
            <BookOpen size={18} />
            去答 3 道题
          </button>
          <div className="fact-number" aria-hidden="true">
            03
          </div>
        </section>

        <section className="benefit-preview">
          <span className="section-kicker">
            <Ticket size={15} /> 权益券包
          </span>
          <div className="benefit-ticket">
            <span>
              <small>到园可用</small>
              <strong>门票立减 5 元</strong>
              <em>本月剩余 36 张</em>
            </span>
            <Ticket size={40} strokeWidth={1.4} />
          </div>
          <button className="link-button" onClick={onCoupon} type="button">
            去看我的权益
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </div>
  );
}

function ZooPage({
  adoptedAnimalId,
  onAdopt,
}: {
  adoptedAnimalId: string;
  onAdopt: (animal: Animal) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return animals;
    return animals.filter((animal) =>
      `${animal.name}${animal.species}${animal.personality}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  return (
    <div className="page-stack">
      <section className="page-intro zoo-intro">
        <div>
          <p className="eyebrow">
            <PawPrint size={15} /> 观察而不是占有
          </p>
          <h1>挑一位动物朋友</h1>
          <p>每只动物都有真实的性格、档案和一条到园见面提示。</p>
        </div>
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索动物或性格"
          />
        </label>
      </section>

      <section className="animal-grid" aria-label="可领养动物">
        {filtered.map((animal, index) => {
          const active = adoptedAnimalId === animal.id;
          return (
            <article
              className={`animal-card ${active ? "is-adopted" : ""}`}
              key={animal.id}
              style={
                {
                  "--animal-accent": animal.accent,
                  "--animal-soft": animal.soft,
                  "--delay": `${index * 80}ms`,
                } as React.CSSProperties
              }
            >
              <div className="animal-photo">
                <span className="animal-level">LV.{animal.level}</span>
                {active && (
                  <span className="adopted-badge">
                    <Heart size={13} fill="currentColor" /> 正在陪伴
                  </span>
                )}
                <img
                  src={animal.image}
                  alt={`${animal.species}${animal.name}`}
                  style={{ objectPosition: animal.imagePosition }}
                />
              </div>
              <div className="animal-card-body">
                <div className="animal-name-row">
                  <div>
                    <h2>{animal.name}</h2>
                    <p>{animal.species}</p>
                  </div>
                  <span className="animal-habitat">{animal.habitat}</span>
                </div>
                <p className="animal-tag">{animal.personality}</p>
                <p className="animal-fact">{animal.fact}</p>
                <div className="meet-tip">
                  <MapPin size={16} />
                  <span>{animal.meetTip}</span>
                </div>
                <button
                  className={active ? "adopt-button is-active" : "adopt-button"}
                  onClick={() => onAdopt(animal)}
                  type="button"
                >
                  {active ? (
                    <>
                      <CheckCircle2 size={18} />
                      回到小窝
                    </>
                  ) : (
                    <>
                      <Heart size={18} />
                      开始陪伴
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="values-band">
        <div>
          <ShieldCheck size={28} />
          <span>
            <strong>内容由园方保育员审校</strong>
            <small>真实动物档案 · 科学知识 · 不设计真实投喂或动物接触</small>
          </span>
        </div>
        <div className="value-stat">
          <strong>3</strong>
          <span>份动物档案</span>
        </div>
        <div className="value-stat">
          <strong>9</strong>
          <span>条科普知识</span>
        </div>
        <div className="value-stat">
          <strong>3</strong>
          <span>个到园点位</span>
        </div>
      </section>
    </div>
  );
}

function TasksPage({
  state,
  completedCount,
  onTask,
  onNavigate,
}: {
  state: PersistedState;
  completedCount: number;
  onTask: (task: DailyTask) => void;
  onNavigate: (view: ViewId) => void;
}) {
  const progress = Math.round((completedCount / dailyTasks.length) * 100);
  return (
    <div className="page-stack">
      <section className="tasks-hero">
        <div>
          <p className="eyebrow">
            <CalendarDays size={15} /> 11月24日 · 星期二
          </p>
          <h1>今天还有 {dailyTasks.length - completedCount} 件小事</h1>
          <p>不做连续签到惩罚，只记录你和小满真实相处的时间。</p>
        </div>
        <ProgressRing value={progress} label={`${progress}%`} />
      </section>

      <div className="tasks-layout">
        <section className="tasks-main panel">
          <SectionHeader
            eyebrow="今日清单"
            title="慢慢完成，也很好"
            trailing={`${completedCount}/${dailyTasks.length}`}
          />
          <div className="task-list">
            {dailyTasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                index={index + 1}
                done={isTaskComplete(task, state)}
                onAction={() => onTask(task)}
                large
              />
            ))}
          </div>
        </section>

        <aside className="week-panel panel">
          <SectionHeader eyebrow="本周陪伴" title="4 天里有 3 天见面" />
          <div className="week-days">
            {["五", "六", "日", "一", "二", "三", "四"].map((day, index) => (
              <div key={day} className={index <= 3 ? "is-past" : ""}>
                <span>{day}</span>
                <i>{index <= 3 ? <Check size={15} /> : null}</i>
              </div>
            ))}
          </div>
          <div className="streak-note">
            <Sparkles size={19} />
            <span>
              <strong>再照顾 2 天</strong>
              <small>解锁“小满的午后”限定徽章</small>
            </span>
          </div>
          <button
            className="primary-button full"
            onClick={() => onNavigate("home")}
            type="button"
          >
            <Heart size={18} />
            回到小窝
          </button>
        </aside>
      </div>

      <section className="child-rules">
        <LockKeyhole size={24} />
        <div>
          <strong>儿童模式正在保护这段时间</strong>
          <p>每日互动上限 10 分钟 · 22:00—06:00 不推送 · 无广告和陌生人私信</p>
        </div>
        <span>安全设置</span>
      </section>
    </div>
  );
}

function MapPage({
  state,
  onCheckIn,
  onNavigate,
}: {
  state: PersistedState;
  onCheckIn: (id: string) => void;
  onNavigate: (view: ViewId) => void;
}) {
  const checked = state.checkins.length;
  return (
    <div className="page-stack">
      <section className="page-intro map-intro">
        <div>
          <p className="eyebrow">
            <MapPin size={15} /> 今日路线 · 约 1.5 小时
          </p>
          <h1>去园里找一条慢路线</h1>
          <p>不追表演，不赶场。看看动物，也看看它们生活的环境。</p>
        </div>
        <div className="route-progress">
          <span>
            <strong>{checked}</strong> / 3
          </span>
          <small>点位已打卡</small>
        </div>
      </section>

      <div className="map-layout">
        <section className="zoo-map" aria-label="园内打卡地图">
          <div className="map-toolbar">
            <span>
              <Leaf size={16} />
              红山森林动物园 · 步行路线
            </span>
            <span className="demo-label">演示地图</span>
          </div>
          <div className="map-canvas">
            <div className="map-field map-field-one" />
            <div className="map-field map-field-two" />
            <div className="map-field map-field-three" />
            <div className="map-river" />
            <span className="map-path" aria-hidden="true" />
            {checkpoints.map((point, index) => {
              const done = state.checkins.includes(point.id);
              return (
                <button
                  key={point.id}
                  className={`map-point ${done ? "is-done" : ""}`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onClick={() => onCheckIn(point.id)}
                  type="button"
                  title={`${point.name}打卡`}
                >
                  <span>{done ? <Check size={20} /> : index + 1}</span>
                  <strong>{point.name}</strong>
                  <small>{done ? "已打卡" : "点击打卡"}</small>
                </button>
              );
            })}
            <div className="map-legend">
              <TreePine size={16} />
              观察路线
              <span />
              <Footprints size={16} />
              约 2,300 步
            </div>
          </div>
        </section>

        <aside className="checkpoint-panel">
          <SectionHeader eyebrow="路线点位" title="三处，刚好一个下午" />
          <div className="checkpoint-list">
            {checkpoints.map((point, index) => {
              const done = state.checkins.includes(point.id);
              return (
                <article key={point.id} className={done ? "is-done" : ""}>
                  <span className="checkpoint-index">{done ? <Check size={18} /> : index + 1}</span>
                  <div>
                    <h3>{point.name}</h3>
                    <small>{point.zone}</small>
                    <p>{point.description}</p>
                  </div>
                  <button
                    onClick={() => onCheckIn(point.id)}
                    type="button"
                    aria-label={`${point.name}${done ? "已打卡" : "打卡"}`}
                  >
                    {done ? <CheckCircle2 size={19} /> : <QrCode size={19} />}
                  </button>
                </article>
              );
            })}
          </div>
          <button
            className="primary-button full"
            onClick={() => onNavigate("memories")}
            type="button"
          >
            <Images size={18} />
            查看今日回忆
          </button>
        </aside>
      </div>

      <section className="arrival-tip">
        <Clock3 size={24} />
        <div>
          <span>今日建议到园</span>
          <strong>14:30—16:30</strong>
          <p>虎馆西侧树荫更凉快，小满午后常在坡地附近活动。</p>
        </div>
        <span className="weather-pill">
          <CloudSun size={17} /> 18°C 晴
        </span>
      </section>
    </div>
  );
}

function PerksPage({
  state,
  onClaim,
  onOpenCode,
  onNavigate,
}: {
  state: PersistedState;
  onClaim: (coupon: Coupon) => void;
  onOpenCode: (coupon: Coupon) => void;
  onNavigate: (view: ViewId) => void;
}) {
  return (
    <div className="page-stack">
      <section className="perks-hero">
        <div>
          <p className="eyebrow">
            <Ticket size={15} /> 真实权益 · 到园可核销
          </p>
          <h1>把陪伴值，换成一次真实见面</h1>
          <p>不售卖虚拟道具，所有兑换都锚定园方权益。</p>
        </div>
        <div className="points-balance">
          <span>当前陪伴值</span>
          <strong>{state.companionPoints}</strong>
          <small>
            <Award size={15} />
            可兑换 {coupons.filter((item) => item.cost <= state.companionPoints).length} 项权益
          </small>
        </div>
      </section>

      <section className="coupon-grid">
        {coupons.map((coupon) => {
          const claimed = state.claimedCoupons.includes(coupon.id);
          return (
            <article className={`coupon-card tone-${coupon.tone}`} key={coupon.id}>
              <div className="coupon-stub">
                <Ticket size={30} strokeWidth={1.5} />
                <span>{claimed ? "已领取" : "园方权益"}</span>
              </div>
              <div className="coupon-content">
                <span className="coupon-stock">{coupon.stock}</span>
                <h2>{coupon.title}</h2>
                <p>{coupon.description}</p>
                <div className="coupon-footer">
                  <span>
                    <Sparkles size={15} />
                    {coupon.cost} 陪伴值
                  </span>
                  <button
                    onClick={() =>
                      claimed ? onOpenCode(coupon) : onClaim(coupon)
                    }
                    type="button"
                  >
                    {claimed ? "查看兑换码" : "立即兑换"}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="perks-bottom">
        <div>
          <Gift size={26} />
          <span>
            <strong>再积一点，就能换会员日探访</strong>
            <small>完成今日 4 项任务，最多可获得 63 点陪伴值。</small>
          </span>
        </div>
        <button className="secondary-button" onClick={() => onNavigate("tasks")} type="button">
          去完成任务
          <ArrowRight size={17} />
        </button>
      </section>
    </div>
  );
}

function MemoriesPage({
  state,
  onNotify,
}: {
  state: PersistedState;
  onNotify: (message: string) => void;
}) {
  const [generated, setGenerated] = useState(false);
  const adoptedAnimal =
    animals.find((animal) => animal.id === state.adoptedAnimalId) ?? animals[0];

  function generateAlbum() {
    setGenerated(true);
    onNotify("本月回忆册已经生成");
  }

  return (
    <div className="page-stack">
      <section className="memory-cover">
        <div className="memory-cover-copy">
          <p className="eyebrow">
            <Images size={15} /> 11 月 · 第 1 本
          </p>
          <h1>和{adoptedAnimal.name}一起，<br />记住这个月。</h1>
          <p>一次照顾、一条知识、一次到园，都值得被放进回忆册。</p>
          <button className="primary-button" onClick={generateAlbum} type="button">
            <Sparkles size={18} />
            {generated ? "本月回忆册已生成" : "生成本月回忆册"}
          </button>
        </div>
        <div className="memory-cover-art">
          <img src="./assets/zoo-family.jpg" alt="萌饲Zoo动物朋友插画" />
          <span>NOV 2026</span>
        </div>
      </section>

      <div className="memory-layout">
        <section className="memory-timeline">
          <SectionHeader
            eyebrow="成长时间线"
            title={`已经收下 ${state.memories.length} 个瞬间`}
            trailing="本月"
          />
          <div className="timeline-list">
            {state.memories.map((memory) => (
              <article key={memory.id}>
                <span className={`timeline-icon type-${memory.type}`}>
                  {memory.type === "adopt" && <Heart size={17} />}
                  {memory.type === "care" && <PawPrint size={17} />}
                  {memory.type === "quiz" && <BookOpen size={17} />}
                  {memory.type === "checkin" && <MapPin size={17} />}
                </span>
                <div className="timeline-copy">
                  <span>{memory.date}</span>
                  <h3>{memory.title}</h3>
                  <p>{memory.description}</p>
                </div>
                {memory.image && (
                  <img src={memory.image} alt="" className="memory-thumb" />
                )}
              </article>
            ))}
          </div>
        </section>

        <aside className="memory-summary">
          <SectionHeader eyebrow="陪伴小结" title="这个月，慢慢积累" />
          <div className="memory-stat-grid">
            <div>
              <strong>{state.companionPoints}</strong>
              <span>陪伴值</span>
            </div>
            <div>
              <strong>{state.sciencePoints}</strong>
              <span>科普值</span>
            </div>
            <div>
              <strong>{state.checkins.length}</strong>
              <span>到园打卡</span>
            </div>
            <div>
              <strong>{state.claimedCoupons.length}</strong>
              <span>领取权益</span>
            </div>
          </div>
          <div className="summary-note">
            <MessageCircle size={20} />
            <p>
              “{adoptedAnimal.memoryLine}”
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AdminPage({
  state,
  onApprove,
  onNotify,
}: {
  state: PersistedState;
  onApprove: (id: string) => void;
  onNotify: (message: string) => void;
}) {
  const [redeemCode, setRedeemCode] = useState("");

  function submitRedeem() {
    if (!redeemCode.trim()) {
      onNotify("请输入兑换码");
      return;
    }
    onNotify(`兑换码 ${redeemCode.trim()} 核销成功`);
    setRedeemCode("");
  }

  return (
    <div className="page-stack admin-page">
      <section className="admin-heading">
        <div>
          <p className="eyebrow">
            <ShieldCheck size={15} /> 试点园 · 运营后台
          </p>
          <h1>今天的到园转化</h1>
          <p>演示数据截至 11 月 24 日 14:00，所有指标按周 cohort 统计。</p>
        </div>
        <span className="admin-live">
          <i /> 数据同步中
        </span>
      </section>

      <section className="metric-cards">
        <MetricCard
          label="激活用户"
          value="1,842"
          note="本周 +12.6%"
          icon={<PawPrint size={20} />}
          tone="forest"
        />
        <MetricCard
          label="领券率"
          value="21.4%"
          note="目标 ≥ 20%"
          icon={<Ticket size={20} />}
          tone="moss"
        />
        <MetricCard
          label="到园核销"
          value="26.8%"
          note="目标 ≥ 25%"
          icon={<MapPin size={20} />}
          tone="clay"
        />
        <MetricCard
          label="二次消费"
          value="52.1%"
          note="目标 ≥ 50%"
          icon={<Gift size={20} />}
          tone="gold"
        />
      </section>

      <div className="admin-grid">
        <section className="conversion-panel panel">
          <SectionHeader
            eyebrow="转化漏斗"
            title="从到园游客到二次消费"
            trailing="10,000 起始"
          />
          <div className="metric-bars">
            {metrics.map((metric, index) => (
              <div className="metric-row" key={metric.label}>
                <div>
                  <span>{metric.label}</span>
                  <strong>{metric.value.toLocaleString("zh-CN")}</strong>
                </div>
                <div className="metric-track">
                  <span
                    className={`metric-fill fill-${index}`}
                    style={{ width: `${Math.max(metric.width, 3)}%` }}
                  />
                </div>
                <small>{metric.rate}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="redeem-panel panel">
          <SectionHeader eyebrow="核销台" title="输入游客兑换码" />
          <div className="redeem-console">
            <div className="scan-corners" aria-hidden="true">
              <QrCode size={78} strokeWidth={1.1} />
            </div>
            <label>
              <span>兑换码</span>
              <input
                value={redeemCode}
                onChange={(event) => setRedeemCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitRedeem();
                }}
                placeholder="例如 MZ-TICKET-5-2026"
              />
            </label>
            <button className="primary-button full" onClick={submitRedeem} type="button">
              <CheckCircle2 size={18} />
              确认核销
            </button>
            <p>
              <LockKeyhole size={14} /> 试点期使用园方工作台核销，不接入现有票务系统。
            </p>
          </div>
        </section>
      </div>

      <section className="review-panel panel">
        <SectionHeader
          eyebrow="内容审校"
          title="待园方确认"
          trailing={`${reviewQueue.length - state.approvedContent.length} 条待处理`}
        />
        <div className="review-table-wrap">
          <table className="review-table">
            <thead>
              <tr>
                <th>内容</th>
                <th>类型</th>
                <th>提交人</th>
                <th>时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {reviewQueue.map((review) => {
                const approved = state.approvedContent.includes(review.id);
                return (
                  <tr key={review.id}>
                    <td>
                      <strong>{review.title}</strong>
                    </td>
                    <td>{review.type}</td>
                    <td>{review.author}</td>
                    <td>{review.time}</td>
                    <td>
                      <button
                        className={approved ? "review-action is-approved" : "review-action"}
                        onClick={() => onApprove(review.id)}
                        type="button"
                      >
                        {approved ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                        {approved ? "已通过" : "审核通过"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-disclaimer">
        <ShieldCheck size={20} />
        <p>
          演示数据仅用于产品原型说明，不代表实际经营结果。用户数据归园方所有，平台仅使用脱敏聚合数据优化产品。
        </p>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  tone: "forest" | "moss" | "clay" | "gold";
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span className="metric-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow: string;
  title: string;
  trailing?: string;
}) {
  return (
    <div className="section-header">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {trailing && <strong>{trailing}</strong>}
    </div>
  );
}

function TaskRow({
  task,
  done,
  onAction,
  index,
  large = false,
}: {
  task: DailyTask;
  done: boolean;
  onAction: () => void;
  index?: number;
  large?: boolean;
}) {
  const TaskIcon =
    task.type === "care"
      ? Brush
      : task.type === "quiz"
        ? BookOpen
        : task.type === "checkin"
          ? MapPin
          : Volume2;
  const actionLabel = done
    ? "已完成"
    : task.type === "care"
      ? "去照顾"
      : task.type === "quiz"
        ? "去答题"
        : task.type === "checkin"
          ? "去打卡"
          : "听一听";

  return (
    <article className={`task-row ${done ? "is-done" : ""} ${large ? "is-large" : ""}`}>
      <span className="task-icon">
        {index && large ? <small>{String(index).padStart(2, "0")}</small> : <TaskIcon size={19} />}
      </span>
      <div className="task-copy">
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <span className="task-points">+{task.points}</span>
      <button onClick={onAction} type="button" aria-label={`${task.title}：${actionLabel}`}>
        {done ? <Check size={16} /> : <TaskIcon size={16} />}
        <span>{actionLabel}</span>
      </button>
    </article>
  );
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="progress-ring"
      style={{ "--progress": `${Math.max(0, Math.min(100, value)) * 3.6}deg` } as React.CSSProperties}
      aria-label={`今日进度 ${label}`}
    >
      <span>
        <strong>{label}</strong>
        <small>今日进度</small>
      </span>
    </div>
  );
}

function QuizModal({
  onClose,
  onFinish,
}: {
  onClose: () => void;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = quizQuestions[index];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function chooseAnswer(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === question.answer) setCorrect((value) => value + 1);
  }

  function nextQuestion() {
    if (index === quizQuestions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="quiz-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} type="button" title="关闭">
          <X size={20} />
        </button>

        {!finished ? (
          <>
            <div className="quiz-topline">
              <span>
                <BookOpen size={17} />
                今日科普小测
              </span>
              <strong>
                {index + 1} / {quizQuestions.length}
              </strong>
            </div>
            <div className="quiz-progress">
              <span style={{ width: `${((index + 1) / quizQuestions.length) * 100}%` }} />
            </div>
            <h2 id="quiz-title">{question.question}</h2>
            <div className="quiz-options">
              {question.options.map((option, optionIndex) => {
                const isCorrect =
                  selected !== null && optionIndex === question.answer;
                const isWrong =
                  selected === optionIndex && optionIndex !== question.answer;
                return (
                  <button
                    key={option}
                    className={`${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
                    onClick={() => chooseAnswer(optionIndex)}
                    type="button"
                  >
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    {option}
                    {isCorrect && <CheckCircle2 size={19} />}
                    {isWrong && <X size={19} />}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="quiz-explanation">
                <Sparkles size={18} />
                <p>{question.explanation}</p>
              </div>
            )}
            <div className="quiz-footer">
              <span>答错也会收获解释，不会扣分。</span>
              <button
                className="primary-button"
                onClick={nextQuestion}
                disabled={selected === null}
                type="button"
              >
                {index === quizQuestions.length - 1 ? "完成小测" : "下一题"}
                <ArrowRight size={17} />
              </button>
            </div>
          </>
        ) : (
          <div className="quiz-result">
            <span className="result-icon">
              <Award size={38} />
            </span>
            <p>今日科普小测</p>
            <h2>
              答对 {correct} / {quizQuestions.length} 题
            </h2>
            <div className="result-rewards">
              <span>
                <Sparkles size={17} />
                科普值 +3
              </span>
              <span>
                <Heart size={17} />
                陪伴值 +15
              </span>
            </div>
            <p className="result-copy">
              观察得越仔细，越能理解动物为什么这样生活。
            </p>
            <button className="primary-button full" onClick={onFinish} type="button">
              <CheckCircle2 size={18} />
              收下这枚知识徽章
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function RedeemModal({
  coupon,
  onClose,
  onNotify,
}: {
  coupon: Coupon;
  onClose: () => void;
  onNotify: (message: string) => void;
}) {
  const code = `MZ-${coupon.id.toUpperCase()}-2026`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      onNotify("兑换码已复制");
    } catch {
      onNotify(`兑换码：${code}`);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="redeem-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="redeem-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} type="button" title="关闭">
          <X size={20} />
        </button>
        <div className="redeem-modal-icon">
          <QrCode size={72} strokeWidth={1.15} />
        </div>
        <span className="redeem-eyebrow">园方权益兑换码</span>
        <h2 id="redeem-title">{coupon.title}</h2>
        <p>{coupon.description}</p>
        <button className="code-box" onClick={copyCode} type="button">
          <span>{code}</span>
          <small>点击复制</small>
        </button>
        <div className="redeem-note">
          <Clock3 size={17} />
          <span>请在有工作人员在场时出示，兑换有效期至 2026 年 12 月 31 日。</span>
        </div>
        <button className="primary-button full" onClick={onClose} type="button">
          收进券包
        </button>
      </section>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} />
      <span>{message}</span>
    </div>
  );
}

export default App;
