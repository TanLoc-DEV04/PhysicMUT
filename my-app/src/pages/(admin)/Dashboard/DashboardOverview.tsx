// @ts-nocheck
import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Row, Col, Tabs, Tag, Avatar } from 'antd';
import {
  UserOutlined, CodeSandboxOutlined, ReadOutlined, FormOutlined,
  ThunderboltOutlined, RobotOutlined, TrophyOutlined,
  TeamOutlined, BellOutlined, UploadOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  BookOutlined, SettingOutlined, BarChartOutlined, UnorderedListOutlined,
  DashboardOutlined, SafetyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, ResponsiveContainer, Legend, Cell,
  Area, AreaChart
} from 'recharts';
// @ts-ignore
import { animate, createScope, createSpring, stagger } from 'animejs';
import api from '../../../../services/api';

// ── Palette ──────────────────────────────────────────────────────────────────
const BLUE = {
  50:  '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
};

// ── Static Demo Data ──────────────────────────────────────────────────────────
const weeklyTrafficData = [
  { day: 'T2', users: 320, sessions: 410 },
  { day: 'T3', users: 480, sessions: 610 },
  { day: 'T4', users: 390, sessions: 520 },
  { day: 'T5', users: 570, sessions: 730 },
  { day: 'T6', users: 620, sessions: 800 },
  { day: 'T7', users: 840, sessions: 950 },
  { day: 'CN', users: 760, sessions: 880 },
];

const model3DEngagementData = [
  { name: 'Cyclotron',      views: 1240 },
  { name: 'Loa điện động',  views: 980 },
  { name: 'Quang phổ khối', views: 870 },
];
const MODEL_COLORS = [BLUE[600], BLUE[400], BLUE[300]];

const learningAnalytics = [
  { label: 'Hoàn thành tốt',  value: 68, color: '#22c55e', icon: <CheckCircleOutlined /> },
  { label: 'Cần cố gắng',     value: 22, color: '#f59e0b', icon: <ClockCircleOutlined /> },
  { label: 'Bỏ cuộc',         value: 10, color: '#ef4444', icon: <CloseCircleOutlined /> },
];

const userLogs = [
  { id: 1, avatar: 'NA', color: BLUE[600],  text: 'Học sinh Nguyễn Văn A mở khóa huy hiệu Bậc thầy Cyclotron', time: '2 phút trước' },
  { id: 2, avatar: 'TB', color: '#8b5cf6',  text: 'Học sinh Trần Thị B vừa đăng ký tài khoản', time: '15 phút trước' },
  { id: 3, avatar: 'HC', color: '#06b6d4',  text: 'Học sinh Hoàng C hoàn thành 5 bài tập liên tiếp', time: '1 giờ trước' },
  { id: 4, avatar: 'LD', color: '#f59e0b',  text: 'Học sinh Lê D đạt điểm tuyệt đối bài Loa điện động', time: '2 giờ trước' },
];

const systemLogs = [
  { id: 1, avatar: 'QT', color: '#22c55e', text: 'Admin Quoc Tuan cập nhật bài tập phần Từ trường', time: '30 phút trước' },
  { id: 2, avatar: 'NA', color: '#f59e0b', text: 'Admin Ngoc Anh thay đổi Role của user Minh Khoa', time: '1 giờ trước' },
  { id: 3, avatar: 'TB', color: BLUE[600], text: 'Admin Tuan Bao tải lên mô hình 3D mới: Van de Graaff', time: '3 giờ trước' },
  { id: 4, avatar: 'SYS',color: '#ef4444', text: 'Hệ thống tự động backup database lúc 03:00', time: '5 giờ trước' },
];

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obj = { val: 0 };
    animate(obj, {
      val: target,
      duration: 1800,
      ease: 'outExpo',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = prefix + Math.round(obj.val).toLocaleString() + suffix;
      },
    });
  }, [target]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ── Animated Pulse Dot ─────────────────────────────────────────────────────
function PulseDot({ color = '#22c55e' }: { color?: string }) {
  const dotRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    animate(dotRef.current!, {
      scale: [1, 1.6, 1],
      opacity: [1, 0.3, 1],
      duration: 1800,
      loop: true,
      ease: 'inOutSine',
    });
  }, []);
  return (
    <span ref={dotRef} style={{
      display: 'inline-block', width: 10, height: 10,
      borderRadius: '50%', background: color, marginRight: 8,
    }} />
  );
}

// ── Animated Section Icon ─────────────────────────────────────────────────────
function SectionIcon({ icon, color }: { icon: React.ReactNode; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    animate(ref.current!, {
      rotateY: [0, 360],
      duration: 1200,
      ease: 'outBack',
    });
  }, []);
  return (
    <span ref={ref} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, background: color, borderRadius: 8,
      color: '#fff', fontSize: 14, marginRight: 10, flexShrink: 0,
    }}>
      {icon}
    </span>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: { value: number; label: string };
  sub?: string;
}

function KpiCard({ title, value, prefix, suffix, icon, gradient, trend, sub }: KpiCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animate(cardRef.current!, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      ease: 'outExpo',
    });
    animate(iconRef.current!, {
      scale: [0, 1],
      duration: 600,
      delay: 300,
      ease: createSpring({ stiffness: 200, damping: 14 }),
    });
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        background: gradient, borderRadius: 18, padding: '22px 24px',
        boxShadow: '0 8px 32px rgba(30,64,175,0.18)',
        position: 'relative', overflow: 'hidden',
        opacity: 0,
      }}
    >
      {/* decorative ring */}
      <div style={{
        position: 'absolute', right: -24, top: -24,
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
      }} />
      <div style={{
        position: 'absolute', right: 12, bottom: -36,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
      }} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginTop: 2 }}>
            <AnimatedNumber target={value} prefix={prefix} suffix={suffix} />
          </div>
          {sub && <div style={{ color: 'rgba(255,255,255,0.56)', fontSize: 11, marginTop: 4 }}>{sub}</div>}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              {trend.value >= 0
                ? <ArrowUpOutlined style={{ color: '#86efac', fontSize: 11 }} />
                : <ArrowDownOutlined style={{ color: '#fca5a5', fontSize: 11 }} />}
              <span style={{ color: trend.value >= 0 ? '#86efac' : '#fca5a5', fontSize: 12, fontWeight: 600 }}>
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          ref={iconRef}
          style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#fff',
            backdropFilter: 'blur(8px)',
            transform: 'scale(0)',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Activity Item ─────────────────────────────────────────────────────────────
function ActivityItem({ avatar, color, text, time }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
      <Avatar size={38} style={{ background: color, flexShrink: 0, fontSize: 12, fontWeight: 700 }}>{avatar}</Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{text}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{time}</div>
      </div>
    </div>
  );
}

// ── Quick Action Button ───────────────────────────────────────────────────────
function QuickActionBtn({ icon, label, onClick, accent }: { icon: React.ReactNode; label: string; onClick: () => void; accent: string }) {
  // @ts-ignore
  const ref = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    animate(ref.current!, { scale: 1.03, translateY: -2, duration: 200, ease: 'outQuad' });
  };
  const handleLeave = () => {
    animate(ref.current!, { scale: 1, translateY: 0, duration: 200, ease: 'outQuad' });
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 16px', borderRadius: 12, cursor: 'pointer',
        background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
        border: `1.5px solid ${accent}30`,
        textAlign: 'left', transition: 'background 0.2s',
      }}
    >
      <span style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color: '#fff',
      }}>
        {icon}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{label}</span>
    </button>
  );
}

// ── Analytics Progress Bar ────────────────────────────────────────────────────
function AnalyticsBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    animate(barRef.current!, {
      width: [`0%`, `${value}%`],
      duration: 1400,
      delay: 300,
      ease: 'outExpo',
    });
  }, [value]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 500 }}>
          <span style={{ color }}>{icon}</span>{label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div ref={barRef} style={{ height: '100%', background: color, borderRadius: 99, width: '0%' }} />
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardOverview() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user');
  const rootRef = useRef<HTMLDivElement>(null);

  // Fetch live data
  const { data: users = [] }    = useQuery({ queryKey: ['users'],    queryFn: async () => (await api.get('/users')).data });
  const { data: models3d = [] } = useQuery({ queryKey: ['models3d'], queryFn: async () => (await api.get('/content/models3d')).data });
  const { data: theories = [] } = useQuery({ queryKey: ['theories'], queryFn: async () => (await api.get('/content/theories')).data });
  const { data: examples = [] } = useQuery({ queryKey: ['examples'], queryFn: async () => (await api.get('/content/examples')).data });
  const { data: exercises = [] }= useQuery({ queryKey: ['exercises'],queryFn: async () => (await api.get('/content/exercises')).data });

  const kpis = useMemo(() => ({
    users:   users.length   || 0,
    models:  models3d.length|| 0,
    content: (theories.length||0) + (examples.length||0) + (exercises.length||0),
    exercises: exercises.length || 0,
  }), [users, models3d, theories, examples, exercises]);

  // Staggered card entrance
  useEffect(() => {
    animate('.dash-card-enter', {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(80),
      duration: 600,
      ease: 'outExpo',
    });
  }, []);

  const tabItems = [
    {
      key: 'user',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <TeamOutlined /> Nhật ký người dùng
        </span>
      ),
      children: <div>{userLogs.map(l => <ActivityItem key={l.id} {...l} />)}</div>,
    },
    {
      key: 'system',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <SettingOutlined /> Nhật ký hệ thống
        </span>
      ),
      children: <div>{systemLogs.map(l => <ActivityItem key={l.id} {...l} />)}</div>,
    },
  ];

  return (
    <div ref={rootRef} style={{ padding: '4px 0' }}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DashboardOutlined style={{ fontSize: 22, color: BLUE[600] }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Tổng quan hệ thống
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '5px 0 0 32px' }}>
            PhysicMUT Admin · Dữ liệu cập nhật realtime
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          background: '#f0fdf4', border: '1.5px solid #bbf7d0',
          padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
          <PulseDot color="#22c55e" />
          Hệ thống hoạt động bình thường
        </div>
      </div>

      {/* ── Row 1 · KPI Cards ──────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Tổng người dùng"
            value={kpis.users || 1250}
            icon={<UserOutlined />}
            gradient={`linear-gradient(135deg, ${BLUE[700]}, ${BLUE[500]})`}
            trend={{ value: 12, label: 'so với tháng trước' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Mô hình 3D"
            value={kpis.models || 3}
            icon={<CodeSandboxOutlined />}
            gradient={`linear-gradient(135deg, ${BLUE[600]}, #06b6d4)`}
            sub={`${(theories.length||120)} Lý thuyết · ${(exercises.length||300)} Bài tập`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Chatbot LLM"
            value={5400}
            suffix=" Q"
            icon={<RobotOutlined />}
            gradient={`linear-gradient(135deg, #0891b2, ${BLUE[500]})`}
            trend={{ value: 8, label: 'tuần này' }}
            sub="câu hỏi đã xử lý"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Huy hiệu đã trao"
            value={850}
            icon={<TrophyOutlined />}
            gradient={`linear-gradient(135deg, ${BLUE[800]}, ${BLUE[600]})`}
            trend={{ value: 23, label: 'tháng này' }}
            sub="Gamification Stats"
          />
        </Col>
      </Row>

      {/* ── Row 2 · Charts ─────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Area Line Chart */}
        <Col xs={24} lg={15}>
          <Card
            className="dash-card-enter"
            style={{ borderRadius: 18, border: `1px solid ${BLUE[100]}`, overflow: 'hidden', opacity: 0 }}
            bodyStyle={{ padding: '16px 20px 12px' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SectionIcon icon={<BarChartOutlined />} color={BLUE[600]} />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Lưu lượng truy cập hàng tuần</span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={weeklyTrafficData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={BLUE[500]} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={BLUE[500]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartTooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(30,64,175,0.15)', fontSize: 13 }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="users" name="Người dùng"
                  stroke={BLUE[500]} strokeWidth={2.5} fill="url(#gU)" dot={false} activeDot={{ r: 5, fill: BLUE[600] }}
                />
                <Area type="monotone" dataKey="sessions" name="Phiên học"
                  stroke="#06b6d4" strokeWidth={2} fill="url(#gS)" dot={false} strokeDasharray="5 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Bar Chart */}
        <Col xs={24} lg={9}>
          <Card
            className="dash-card-enter"
            style={{ borderRadius: 18, border: `1px solid ${BLUE[100]}`, overflow: 'hidden', opacity: 0 }}
            bodyStyle={{ padding: '16px 20px 12px' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SectionIcon icon={<CodeSandboxOutlined />} color="#0891b2" />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Top Mô hình 3D</span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={model3DEngagementData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartTooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(30,64,175,0.15)', fontSize: 13 }}
                  formatter={(v: any) => [`${v} lượt`, 'Tương tác']}
                />
                <Bar dataKey="views" radius={[10, 10, 0, 0]} maxBarSize={52}>
                  {model3DEngagementData.map((_, i) => (
                    <Cell key={i} fill={MODEL_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ── Row 3 · Activities + Right Panel ──────── */}
      <Row gutter={[16, 16]}>
        {/* Recent Activities 2/3 */}
        <Col xs={24} lg={16}>
          <Card
            className="dash-card-enter"
            style={{ borderRadius: 18, border: `1px solid ${BLUE[100]}`, height: '100%', opacity: 0 }}
            bodyStyle={{ paddingTop: 0 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SectionIcon icon={<UnorderedListOutlined />} color={BLUE[700]} />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Hoạt động gần đây</span>
              </div>
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="small"
              tabBarStyle={{ marginBottom: 0 }}
              tabBarGutter={24}
            />
          </Card>
        </Col>

        {/* Right Column 1/3 */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Learning Analytics */}
            <Card
              className="dash-card-enter"
              style={{ borderRadius: 18, border: `1px solid ${BLUE[100]}`, opacity: 0 }}
              bodyStyle={{ padding: '16px 20px' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SectionIcon icon={<SafetyOutlined />} color="#7c3aed" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Phân tích học tập</span>
                </div>
              }
            >
              {learningAnalytics.map(item => (
                <AnalyticsBar key={item.label} {...item} />
              ))}
              {/* Summary pill */}
              <div style={{
                marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap',
              }}>
                {learningAnalytics.map(item => (
                  <span key={item.label} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 8px',
                    borderRadius: 999, background: `${item.color}18`, color: item.color,
                  }}>
                    {item.value}% {item.label}
                  </span>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card
              className="dash-card-enter"
              style={{ borderRadius: 18, border: `1px solid ${BLUE[100]}`, opacity: 0 }}
              bodyStyle={{ padding: '12px 16px' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SectionIcon icon={<ThunderboltOutlined />} color={BLUE[600]} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Thao tác nhanh</span>
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <QuickActionBtn icon={<FormOutlined />}   label="Thêm bài tập mới"        onClick={() => navigate('/dashboard/exercises/add')} accent={BLUE[600]} />
                <QuickActionBtn icon={<TeamOutlined />}   label="Thêm Admin / Role mới"   onClick={() => navigate('/dashboard/admin')}         accent="#7c3aed" />
                <QuickActionBtn icon={<UploadOutlined />} label="Tải lên mô hình 3D"      onClick={() => navigate('/dashboard/3d-models')}     accent="#0891b2" />
                <QuickActionBtn icon={<BellOutlined />}   label="Gửi thông báo hệ thống"  onClick={() => {}}                                  accent="#f59e0b" />
              </div>
            </Card>

          </div>
        </Col>
      </Row>
    </div>
  );
}
