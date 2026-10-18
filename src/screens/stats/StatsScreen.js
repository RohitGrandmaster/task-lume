import {LocalizedText} from '../../i18n/LocalizedText';
import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
  LayoutAnimation,
  UIManager,
  Platform
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import Svg, {Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import {
  Menu,
  TrendingUp,
  TrendingDown,
  Flame,
  Zap,
  Award,
  Target,
  CheckCircle2,
  Clock,
  Timer,
  AlertTriangle,
  Calendar,
  Layers,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Trophy,
  Rocket,
  Crown,
  Minus,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import useTodos from '../../hooks/useTodos';
import {getItem} from '../../storage/storage';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !global._Bridgeless &&
  !global.RN$Bridgeless
) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {}
}

/* --------------------------- CONSTANTS --------------------------- */

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const CATEGORY_COLORS = {
  Personal: '#6366F1',
  Work: '#3B82F6',
  Learning: '#8B5CF6',
  Shopping: '#EC4899',
  Health: '#10B981',
  Project: '#F59E0B',
  Finance: '#14B8A6',
  Family: '#F97316',
  Home: '#06B6D4',
  Travel: '#A855F7',
  Other: '#64748B',
  General: '#64748B',
};

const SHORT_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TIME_RANGES = [
  {key: 'week', label: '7D'},
  {key: 'month', label: '30D'},
  {key: 'year', label: '1Y'},
  {key: 'all', label: 'All'},
];

/* --------------------------- HELPERS --------------------------- */

const pad = v => String(v).padStart(2, '0');
const dateKey = d =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function getRangeStart(range) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === 'week') {
    start.setDate(start.getDate() - 7);
  } else if (range === 'month') {
    start.setDate(start.getDate() - 30);
  } else if (range === 'year') {
    start.setFullYear(start.getFullYear() - 1);
  } else {
    return null;
  }
  return start;
}

/* --------------------------- PROGRESS RING --------------------------- */

function ProgressRing({
  size = 130,
  strokeWidth = 11,
  percent = 0,
  color = '#FFFFFF',
  trackColor = 'rgba(255,255,255,0.22)',
  children,
}) {
  const BUFFER = 6;
  const cSize = size + BUFFER * 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.min(Math.max(percent, 0), 100);
  const offset = circumference * (1 - safe / 100);

  return (
    <View
      style={{
        width: cSize,
        height: cSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={cSize} height={cSize}>
        <Circle
          cx={cSize / 2}
          cy={cSize / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {safe > 0 && (
          <Circle
            cx={cSize / 2}
            cy={cSize / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cSize / 2} ${cSize / 2})`}
          />
        )}
      </Svg>
      {children ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {alignItems: 'center', justifyContent: 'center'},
          ]}
          pointerEvents="none">
          {children}
        </View>
      ) : null}
    </View>
  );
}

/* --------------------------- DONUT --------------------------- */

function DonutChart({data, size = 110, strokeWidth = 12, theme}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.colors.border}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {total > 0 &&
        data.map((seg, i) => {
          if (seg.value === 0) return null;
          const portion = seg.value / total;
          const dashLength = circumference * portion;
          const gap = circumference - dashLength;
          const rotate = (cumulative / total) * 360 - 90;
          cumulative += seg.value;
          return (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dashLength} ${gap}`}
              strokeLinecap="butt"
              transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
            />
          );
        })}
    </Svg>
  );
}

/* --------------------------- ACTIVITY BAR CHART --------------------------- */

function ActivityChart({data, maxValue, theme}) {
  const CHART_HEIGHT = 120;
  return (
    <View style={activityStyles.wrap}>
      <View style={[activityStyles.chart, {height: CHART_HEIGHT}]}>
        {data.map((d, i) => {
          const ratio = maxValue > 0 ? d.value / maxValue : 0;
          const barH = Math.max(ratio * (CHART_HEIGHT - 20), 6);
          return (
            <View key={i} style={activityStyles.col}>
              {d.value > 0 && (
                <LocalizedText
                  style={[
                    activityStyles.value,
                    {
                      color: d.isCurrent
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    },
                  ]}>
                  {d.value}
                </LocalizedText>
              )}
              <View
                style={[
                  activityStyles.bar,
                  {
                    height: barH,
                    backgroundColor: d.isCurrent
                      ? theme.colors.primary
                      : theme.colors.border,
                    shadowColor: d.isCurrent
                      ? theme.colors.primary
                      : 'transparent',
                    shadowOpacity: d.isCurrent ? 0.35 : 0,
                    shadowRadius: 6,
                    shadowOffset: {width: 0, height: 3},
                    elevation: d.isCurrent ? 3 : 0,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={activityStyles.labelsRow}>
        {data.map((d, i) => (
          <View key={i} style={activityStyles.labelCol}>
            <LocalizedText
              style={[
                activityStyles.label,
                {
                  color: d.isCurrent
                    ? theme.colors.primary
                    : theme.colors.textLight,
                  fontWeight: d.isCurrent ? '900' : '700',
                },
              ]}>
              {d.label}
            </LocalizedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const activityStyles = StyleSheet.create({
  wrap: {marginTop: 4},
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 3,
  },
  bar: {
    width: '100%',
    maxWidth: 26,
    borderRadius: 6,
    minHeight: 6,
  },
  value: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  labelCol: {flex: 1, alignItems: 'center'},
  label: {fontSize: 10, letterSpacing: 0.3},
});

/* --------------------------- CATEGORY BAR --------------------------- */

function CategoryBar({item, maxValue, theme}) {
  const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
  return (
    <View style={catStyles.row}>
      <View style={catStyles.labelRow}>
        <View
          style={[catStyles.dot, {backgroundColor: item.color}]}
        />
        <LocalizedText
          style={[catStyles.label, {color: theme.colors.text}]}
          numberOfLines={1}>
          {item.label}
        </LocalizedText>
        <LocalizedText
          style={[catStyles.count, {color: theme.colors.textSecondary}]}>
          {item.value}
        </LocalizedText>
      </View>
      <View
        style={[catStyles.track, {backgroundColor: theme.colors.border}]}>
        <View
          style={[
            catStyles.fill,
            {width: `${pct}%`, backgroundColor: item.color},
          ]}
        />
      </View>
    </View>
  );
}

const catStyles = StyleSheet.create({
  row: {marginBottom: 12},
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {width: 8, height: 8, borderRadius: 4, marginRight: 8},
  label: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  count: {fontSize: 12, fontWeight: '800', letterSpacing: 0.2},
  track: {height: 6, borderRadius: 3, overflow: 'hidden'},
  fill: {height: '100%', borderRadius: 3},
});

/* --------------------------- METRIC CARD --------------------------- */

function MetricCard({
  Icon,
  iconColor,
  label,
  value,
  suffix,
  trend,
  theme,
}) {
  return (
    <View
      style={[
        metricStyles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}>
      <View style={metricStyles.top}>
        <View
          style={[
            metricStyles.iconWrap,
            {backgroundColor: iconColor + '18'},
          ]}>
          <Icon size={14} color={iconColor} strokeWidth={2.6} />
        </View>
        {trend !== undefined && trend !== 0 && (
          <View
            style={[
              metricStyles.trend,
              {
                backgroundColor:
                  trend > 0 ? '#10B981' + '18' : '#EF4444' + '18',
              },
            ]}>
            {trend > 0 ? (
              <TrendingUp size={10} color="#10B981" strokeWidth={3} />
            ) : (
              <TrendingDown size={10} color="#EF4444" strokeWidth={3} />
            )}
            <LocalizedText
              style={[
                metricStyles.trendText,
                {color: trend > 0 ? '#10B981' : '#EF4444'},
              ]}>
              {Math.abs(trend)}%
            </LocalizedText>
          </View>
        )}
      </View>
      <LocalizedText style={[metricStyles.value, {color: theme.colors.text}]}>
        {value}
        {suffix ? (
          <LocalizedText
            style={[
              metricStyles.suffix,
              {color: theme.colors.textSecondary},
            ]}>
            {suffix}
          </LocalizedText>
        ) : null}
      </LocalizedText>
      <LocalizedText
        style={[metricStyles.label, {color: theme.colors.textSecondary}]}
        numberOfLines={1}>
        {label}
      </LocalizedText>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    width: '48.5%',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 10,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {fontSize: 10, fontWeight: '900', letterSpacing: 0.2},
  value: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  suffix: {fontSize: 12, fontWeight: '700'},
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.2,
  },
});

/* --------------------------- MAIN SCREEN --------------------------- */

function StatsScreen({navigation}) {
  const {theme} = useTheme();
  const {tasks} = useTodos();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  const [range, setRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [focusHistory, setFocusHistory] = useState([]);

  useEffect(() => {
    let active = true;
    getItem('@todomaster/focus_session_history', [])
      .then(saved => {
        if (!active) return;
        setFocusHistory(Array.isArray(saved) ? saved : []);
      })
      .catch(error => console.warn('[StatsScreen] focus history load failed:', error));
    return () => {
      active = false;
    };
  }, []);

  const focusSummary = useMemo(() => {
    const rangeStart = getRangeStart(range);
    const matching = focusHistory.filter(session => {
      if (!session || session.type !== 'focus') return false;
      const finishedAt = new Date(session.finishedAt);
      return !Number.isNaN(finishedAt.getTime()) &&
        (!rangeStart || finishedAt >= rangeStart);
    });
    return {
      count: matching.length,
      minutes: matching.reduce((sum, session) => sum + Math.max(0, Number(session.minutes) || 0), 0),
      recent: matching.slice().sort((a, b) =>
        new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
      ).slice(0, 3),
    };
  }, [focusHistory, range]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  const ringSize = useMemo(() => {
    if (width < 340) return 100;
    if (width < 375) return 110;
    if (width < 414) return 118;
    return 124;
  }, [width]);

  /* --------------------------- FILTER BY RANGE --------------------------- */
  const filteredTasks = useMemo(() => {
    const list = (tasks || []).filter(t => t && !t.deleted);
    const start = getRangeStart(range);
    if (!start) return list;

    return list.filter(t => {
      const createdTs = t.createdAt ? new Date(t.createdAt) : null;
      const completedTs = t.completedAt ? new Date(t.completedAt) : null;
      const relevant = completedTs || createdTs;
      if (!relevant) return true;
      return relevant >= start;
    });
  }, [tasks, range]);

  /* --------------------------- STATS --------------------------- */
  const stats = useMemo(() => {
    const list = filteredTasks;
    const total = list.length;
    const completed = list.filter(t => t.completed).length;
    const active = total - completed;
    const highPriority = list.filter(
      t => !t.completed && t.priority === 'high',
    ).length;
    const overdue = list.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const dd = String(t.dueDate);
      const m = dd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return false;
      const due = new Date(+m[1], +m[2] - 1, +m[3]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today;
    }).length;

    const favorites = list.filter(t => t.favorite).length;
    const completion =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      active,
      highPriority,
      overdue,
      favorites,
      completion,
    };
  }, [filteredTasks]);

  /* --------------------------- PREVIOUS PERIOD (FOR TREND) --------------------------- */
  const previousStats = useMemo(() => {
    const list = (tasks || []).filter(t => t && !t.deleted);
    const start = getRangeStart(range);
    if (!start) return null;

    const durationMs = Date.now() - start.getTime();
    const prevStart = new Date(start.getTime() - durationMs);
    const prevEnd = start;

    const prevTasks = list.filter(t => {
      const ts = t.completedAt
        ? new Date(t.completedAt)
        : t.createdAt
        ? new Date(t.createdAt)
        : null;
      if (!ts) return false;
      return ts >= prevStart && ts < prevEnd;
    });

    const prevTotal = prevTasks.length;
    const prevCompleted = prevTasks.filter(t => t.completed).length;
    const prevRate =
      prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 100) : 0;

    return {total: prevTotal, completed: prevCompleted, rate: prevRate};
  }, [tasks, range]);

  const trend = useMemo(() => {
    if (!previousStats || previousStats.rate === 0) return 0;
    return Math.round(stats.completion - previousStats.rate);
  }, [stats.completion, previousStats]);

  /* --------------------------- ACTIVITY DATA --------------------------- */
  const activityData = useMemo(() => {
    const today = new Date();
    const buckets = range === 'year' || range === 'all' ? 12 : 7;
    const data = [];

    if (range === 'year' || range === 'all') {
      // Monthly buckets
      const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
      for (let i = buckets - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
        const count = (tasks || [])
          .filter(t => t && !t.deleted)
          .filter(t => {
            const ts = t.completedAt
              ? new Date(t.completedAt)
              : t.createdAt
              ? new Date(t.createdAt)
              : null;
            if (!ts) return false;
            return `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}` === monthKey;
          }).length;

        data.push({
          label: monthNames[d.getMonth()],
          value: count,
          isCurrent: i === 0,
        });
      }
    } else {
      // Daily buckets
      for (let i = buckets - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = dateKey(d);
        const count = (tasks || [])
          .filter(t => t && !t.deleted)
          .filter(t => {
            const ts = t.completedAt
              ? new Date(t.completedAt)
              : t.createdAt
              ? new Date(t.createdAt)
              : null;
            if (!ts) return false;
            return dateKey(ts) === key;
          }).length;

        data.push({
          label: SHORT_DAYS[d.getDay()],
          value: count,
          isCurrent: i === 0,
        });
      }
    }

    return data;
  }, [tasks, range]);

  const activityMax = Math.max(...activityData.map(d => d.value), 1);
  const activityTotal = activityData.reduce((s, d) => s + d.value, 0);

  /* --------------------------- PRIORITY DISTRIBUTION --------------------------- */
  const priorityData = useMemo(() => {
    const counts = {high: 0, medium: 0, low: 0};
    filteredTasks.forEach(t => {
      if (t.completed) return;
      const p = t.priority || 'medium';
      if (counts[p] !== undefined) counts[p]++;
    });
    return [
      {label: 'High', value: counts.high, color: PRIORITY_COLORS.high},
      {label: 'Medium', value: counts.medium, color: PRIORITY_COLORS.medium},
      {label: 'Low', value: counts.low, color: PRIORITY_COLORS.low},
    ];
  }, [filteredTasks]);

  const priorityTotal = priorityData.reduce((s, p) => s + p.value, 0);

  /* --------------------------- CATEGORY PERFORMANCE --------------------------- */
  const categoryData = useMemo(() => {
    const map = {};
    filteredTasks.forEach(t => {
      const cat = (t.category || 'Other').trim();
      if (!map[cat]) map[cat] = {total: 0, completed: 0};
      map[cat].total++;
      if (t.completed) map[cat].completed++;
    });

    return Object.entries(map)
      .map(([label, d]) => ({
        label,
        value: d.total,
        completed: d.completed,
        color: CATEGORY_COLORS[label] || theme.colors.primary,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredTasks, theme.colors.primary]);

  const categoryMax = Math.max(...categoryData.map(c => c.value), 1);

  /* --------------------------- INSIGHTS --------------------------- */
  const insights = useMemo(() => {
    const list = (tasks || []).filter(t => t && !t.deleted);

    // Streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const has = list.some(t => {
        if (
          t.completedAt &&
          dateKey(new Date(t.completedAt)) === key
        )
          return true;
        if (t.createdAt && dateKey(new Date(t.createdAt)) === key) return true;
        return false;
      });
      if (has) streak++;
      else if (i > 0) break;
    }

    // Best day (last 7 days)
    let bestIdx = 0;
    activityData.forEach((d, i) => {
      if (d.value > activityData[bestIdx].value) bestIdx = i;
    });
    const best = activityData[bestIdx];

    // Avg per day
    const avg =
      activityData.length > 0
        ? (activityTotal / activityData.length).toFixed(1)
        : '0.0';

    // Completion rate
    const rate = stats.completion;

    return {
      streak,
      bestDay: best,
      avg,
      rate,
    };
  }, [tasks, activityData, activityTotal, stats.completion]);

  /* --------------------------- ACHIEVEMENTS --------------------------- */
  const achievements = useMemo(() => {
    const list = [];
    if (stats.completed >= 1)
      list.push({
        key: 'first',
        label: 'First done',
        Icon: CheckCircle2,
        color: '#10B981',
      });
    if (stats.completed >= 10)
      list.push({
        key: 'ten',
        label: '10 done',
        Icon: Target,
        color: '#6366F1',
      });
    if (stats.completed >= 50)
      list.push({
        key: 'fifty',
        label: '50 done',
        Icon: Award,
        color: '#8B5CF6',
      });
    if (stats.completion >= 100)
      list.push({
        key: 'all',
        label: 'Perfectionist',
        Icon: Crown,
        color: '#F59E0B',
      });
    if (insights.streak >= 3)
      list.push({
        key: 'streak3',
        label: '3-day streak',
        Icon: Flame,
        color: '#EF4444',
      });
    if (insights.streak >= 7)
      list.push({
        key: 'streak7',
        label: 'Week streak',
        Icon: Trophy,
        color: '#EAB308',
      });
    if (stats.favorites >= 5)
      list.push({
        key: 'fav',
        label: 'Curator',
        Icon: Star,
        color: '#F59E0B',
      });
    return list;
  }, [stats, insights]);

  /* --------------------------- HANDLERS --------------------------- */
  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  function changeRange(key) {
    if (key === range) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRange(key);
  }

  /* --------------------------- RENDER --------------------------- */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={openDrawer}
            style={styles.menuBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu">
            <Menu size={18} color={theme.colors.text} strokeWidth={2.6} />
          </Pressable>

          <View style={styles.headerContent}>
            <LocalizedText style={styles.title}>Statistics</LocalizedText>
            <LocalizedText style={styles.subtitle}>
              Track your productivity in detail
            </LocalizedText>
          </View>

          <View
            style={[
              styles.headerIcon,
              {backgroundColor: theme.colors.primary + '14'},
            ]}>
            <Activity
              size={18}
              color={theme.colors.primary}
              strokeWidth={2.6}
            />
          </View>
        </View>

        {/* TIME RANGE SELECTOR */}
        <View
          style={[
            styles.rangeBar,
            {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
          ]}>
          {TIME_RANGES.map(r => {
            const selected = range === r.key;
            return (
              <Pressable
                key={r.key}
                onPress={() => changeRange(r.key)}
                accessibilityRole="button"
                accessibilityLabel={`Range ${r.label}`}
                style={[
                  styles.rangeItem,
                  selected && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}>
                <LocalizedText
                  style={[
                    styles.rangeText,
                    {
                      color: selected
                        ? '#FFFFFF'
                        : theme.colors.textSecondary,
                    },
                  ]}>
                  {r.label}
                </LocalizedText>
              </Pressable>
            );
          })}
        </View>

        {/* HERO CARD */}
        <View
          style={[
            styles.heroCard,
            {backgroundColor: theme.colors.primary},
          ]}>
          <View style={styles.heroDecor1} pointerEvents="none" />
          <View style={styles.heroDecor2} pointerEvents="none" />

          <View style={styles.heroContent}>
            <View style={styles.ringWrap}>
              <ProgressRing
                size={ringSize}
                strokeWidth={10}
                percent={stats.completion}
                color="#FFFFFF"
                trackColor="rgba(255,255,255,0.22)">
                <LocalizedText style={styles.ringPercent}>
                  {stats.completion}%
                </LocalizedText>
                <LocalizedText style={styles.ringLabel}>done</LocalizedText>
              </ProgressRing>
            </View>

            <View style={styles.heroRight}>
              <LocalizedText style={styles.heroEyebrow} numberOfLines={1}>
                COMPLETION
              </LocalizedText>
              <LocalizedText style={styles.heroBig} numberOfLines={1}>
                {stats.completed}
                <LocalizedText style={styles.heroBigSub}> / {stats.total}</LocalizedText>
              </LocalizedText>

              <View style={styles.heroMiniRow}>
                <View style={styles.heroMiniItem}>
                  <CheckCircle2
                    size={11}
                    color="rgba(255,255,255,0.9)"
                    strokeWidth={2.6}
                  />
                  <LocalizedText style={styles.heroMiniText}>
                    {stats.completed} done
                  </LocalizedText>
                </View>
                <View style={styles.heroMiniItem}>
                  <Clock
                    size={11}
                    color="rgba(255,255,255,0.9)"
                    strokeWidth={2.6}
                  />
                  <LocalizedText style={styles.heroMiniText}>
                    {stats.active} left
                  </LocalizedText>
                </View>
              </View>

              {trend !== 0 && (
                <View style={styles.trendPill}>
                  {trend > 0 ? (
                    <TrendingUp size={11} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <TrendingDown size={11} color="#FFFFFF" strokeWidth={3} />
                  )}
                  <LocalizedText style={styles.trendPillText}>
                    {trend > 0 ? '+' : ''}
                    {trend}% vs previous
                  </LocalizedText>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* QUICK METRICS */}
        <View style={styles.metricsGrid}>
          <MetricCard
            Icon={Layers}
            iconColor="#6366F1"
            label="Total Tasks"
            value={stats.total}
            theme={theme}
          />
          <MetricCard
            Icon={CheckCircle2}
            iconColor="#10B981"
            label="Completed"
            value={stats.completed}
            theme={theme}
          />
          <MetricCard
            Icon={Clock}
            iconColor="#F59E0B"
            label="Active"
            value={stats.active}
            theme={theme}
          />
          <MetricCard
            Icon={AlertTriangle}
            iconColor="#EF4444"
            label="High Priority"
            value={stats.highPriority}
            theme={theme}
          />
          <MetricCard
            Icon={Calendar}
            iconColor="#F97316"
            label="Overdue"
            value={stats.overdue}
            theme={theme}
          />
          <MetricCard
            Icon={Star}
            iconColor="#EAB308"
            label="Favorites"
            value={stats.favorites}
            theme={theme}
          />
        </View>

        {/* FOCUS SESSION HISTORY */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIconWrap, {backgroundColor: '#EC4899' + '18'}]}>
                <Timer size={15} color="#EC4899" strokeWidth={2.6} />
              </View>
              <View style={styles.cardHeaderText}>
                <LocalizedText style={[styles.cardTitle, {color: theme.colors.text}]}>
                  Focus Sessions
                </LocalizedText>
                <LocalizedText style={[styles.cardSubtitle, {color: theme.colors.textSecondary}]}>
                  Saved Pomodoro history · {range === 'week' ? '7 days' : range === 'month' ? '30 days' : range === 'year' ? '1 year' : 'all time'}
                </LocalizedText>
              </View>
            </View>
          </View>

          <View style={{flexDirection: 'row', gap: 10, marginBottom: focusSummary.recent.length ? 14 : 0}}>
            <View style={{flex: 1, padding: 12, borderRadius: 13, backgroundColor: theme.colors.background}}>
              <LocalizedText style={{fontSize: 10, fontWeight: '800', color: theme.colors.textSecondary}}>
                COMPLETED SESSIONS
              </LocalizedText>
              <LocalizedText style={{fontSize: 22, fontWeight: '900', color: theme.colors.text, marginTop: 4}}>
                {focusSummary.count}
              </LocalizedText>
            </View>
            <View style={{flex: 1, padding: 12, borderRadius: 13, backgroundColor: theme.colors.background}}>
              <LocalizedText style={{fontSize: 10, fontWeight: '800', color: theme.colors.textSecondary}}>
                FOCUS MINUTES
              </LocalizedText>
              <LocalizedText style={{fontSize: 22, fontWeight: '900', color: theme.colors.text, marginTop: 4}}>
                {focusSummary.minutes}
              </LocalizedText>
            </View>
          </View>

          {focusSummary.recent.map((session, index) => (
            <View
              key={String(session.id ?? session.finishedAt ?? index)}
              style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 10}}>
              <View style={{width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EC489918'}}>
                <Timer size={14} color="#EC4899" />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <LocalizedText style={{fontSize: 12, fontWeight: '800', color: theme.colors.text}} numberOfLines={1}>
                  {session.task || 'Focus session'}
                </LocalizedText>
                <LocalizedText style={{fontSize: 10, color: theme.colors.textSecondary, marginTop: 2}}>
                  {new Date(session.finishedAt).toLocaleString()}
                </LocalizedText>
              </View>
              <LocalizedText style={{fontSize: 12, fontWeight: '900', color: theme.colors.text}}>
                {Number(session.minutes) || 0}m
              </LocalizedText>
            </View>
          ))}

          {focusSummary.count === 0 ? (
            <LocalizedText style={{fontSize: 12, color: theme.colors.textSecondary, paddingVertical: 8}}>
              No completed focus sessions in this range yet.
            </LocalizedText>
          ) : null}
        </View>

        {/* ACTIVITY CHART */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View
                style={[
                  styles.cardIconWrap,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <BarChart3
                  size={15}
                  color={theme.colors.primary}
                  strokeWidth={2.6}
                />
              </View>
              <View style={styles.cardHeaderText}>
                <LocalizedText
                  style={[styles.cardTitle, {color: theme.colors.text}]}
                  numberOfLines={1}>
                  Activity
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.cardSubtitle,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  {range === 'year' || range === 'all'
                    ? 'By month'
                    : 'Last 7 days'}
                </LocalizedText>
              </View>
            </View>

            <View
              style={[
                styles.weekBadge,
                {
                  backgroundColor: theme.colors.primary + '12',
                  borderColor: theme.colors.primary + '30',
                },
              ]}>
              <TrendingUp
                size={10}
                color={theme.colors.primary}
                strokeWidth={3}
              />
              <LocalizedText
                style={[
                  styles.weekBadgeText,
                  {color: theme.colors.primary},
                ]}>
                {activityTotal}
              </LocalizedText>
            </View>
          </View>

          <ActivityChart
            data={activityData}
            maxValue={activityMax}
            theme={theme}
          />
        </View>

        {/* PRIORITY DONUT */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View
                style={[
                  styles.cardIconWrap,
                  {backgroundColor: '#8B5CF6' + '18'},
                ]}>
                <PieChart size={15} color="#8B5CF6" strokeWidth={2.6} />
              </View>
              <View style={styles.cardHeaderText}>
                <LocalizedText
                  style={[styles.cardTitle, {color: theme.colors.text}]}
                  numberOfLines={1}>
                  Priority Breakdown
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.cardSubtitle,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  {priorityTotal} active
                </LocalizedText>
              </View>
            </View>
          </View>

          <View style={styles.donutRow}>
            <View style={styles.donutWrap}>
              <DonutChart
                data={priorityData}
                size={108}
                strokeWidth={12}
                theme={theme}
              />
              <View style={styles.donutCenter} pointerEvents="none">
                {priorityTotal > 0 ? (
                  <>
                    <LocalizedText
                      style={[
                        styles.donutNum,
                        {color: theme.colors.text},
                      ]}>
                      {priorityTotal}
                    </LocalizedText>
                    <LocalizedText
                      style={[
                        styles.donutLabel,
                        {color: theme.colors.textSecondary},
                      ]}>
                      active
                    </LocalizedText>
                  </>
                ) : (
                  <CheckCircle2
                    size={22}
                    color={theme.colors.success || '#10B981'}
                    strokeWidth={2.2}
                  />
                )}
              </View>
            </View>

            <View style={styles.legendCol}>
              {priorityData.map(item => {
                const pct =
                  priorityTotal > 0
                    ? Math.round((item.value / priorityTotal) * 100)
                    : 0;
                return (
                  <View key={item.label} style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        {backgroundColor: item.color},
                      ]}
                    />
                    <LocalizedText
                      style={[
                        styles.legendLabel,
                        {color: theme.colors.text},
                      ]}
                      numberOfLines={1}>
                      {item.label}
                    </LocalizedText>
                    <LocalizedText
                      style={[
                        styles.legendValue,
                        {color: theme.colors.textSecondary},
                      ]}>
                      {item.value}
                    </LocalizedText>
                    <LocalizedText
                      style={[styles.legendPct, {color: item.color}]}>
                      {pct}%
                    </LocalizedText>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* CATEGORY PERFORMANCE */}
        {categoryData.length > 0 && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[
                    styles.cardIconWrap,
                    {backgroundColor: '#14B8A6' + '18'},
                  ]}>
                  <Target size={15} color="#14B8A6" strokeWidth={2.6} />
                </View>
                <View style={styles.cardHeaderText}>
                  <LocalizedText
                    style={[styles.cardTitle, {color: theme.colors.text}]}
                    numberOfLines={1}>
                    Category Performance
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.cardSubtitle,
                      {color: theme.colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    Tasks per category
                  </LocalizedText>
                </View>
              </View>
            </View>

            <View style={{marginTop: 2}}>
              {categoryData.map(item => (
                <CategoryBar
                  key={item.label}
                  item={item}
                  maxValue={categoryMax}
                  theme={theme}
                />
              ))}
            </View>
          </View>
        )}

        {/* INSIGHTS */}
        <LocalizedText
          style={[styles.sectionHeading, {color: theme.colors.textLight}]}>
          INSIGHTS
        </LocalizedText>

        <View style={styles.insightsGrid}>
          <MetricCard
            Icon={Flame}
            iconColor="#F97316"
            label="Day streak"
            value={insights.streak}
            suffix={insights.streak === 1 ? ' day' : ' days'}
            theme={theme}
          />
          <MetricCard
            Icon={Zap}
            iconColor="#F59E0B"
            label="Avg / day"
            value={insights.avg}
            theme={theme}
          />
          <MetricCard
            Icon={Award}
            iconColor="#8B5CF6"
            label="Best day"
            value={insights.bestDay ? insights.bestDay.value : 0}
            suffix=" tasks"
            theme={theme}
          />
          <MetricCard
            Icon={Rocket}
            iconColor="#EC4899"
            label="Completion rate"
            value={insights.rate}
            suffix="%"
            theme={theme}
          />
        </View>

        {/* ACHIEVEMENTS */}
        {achievements.length > 0 && (
          <>
            <LocalizedText
              style={[
                styles.sectionHeading,
                {color: theme.colors.textLight, marginTop: 12},
              ]}>
              ACHIEVEMENTS
            </LocalizedText>

            <View
              style={[
                styles.achievementsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View style={styles.achievementsGrid}>
                {achievements.map(a => {
                  const AIcon = a.Icon;
                  return (
                    <View
                      key={a.key}
                      style={[
                        styles.achievementItem,
                        {backgroundColor: a.color + '14'},
                      ]}>
                      <View
                        style={[
                          styles.achievementIcon,
                          {backgroundColor: a.color + '20'},
                        ]}>
                        <AIcon
                          size={16}
                          color={a.color}
                          strokeWidth={2.6}
                        />
                      </View>
                      <LocalizedText
                        style={[
                          styles.achievementLabel,
                          {color: a.color},
                        ]}
                        numberOfLines={1}>
                        {a.label}
                      </LocalizedText>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* FOOTER SPACER */}
        <View style={{height: 20}} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12) + 90,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    menuBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerContent: {flex: 1, minWidth: 0},
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Range */
    rangeBar: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 14,
    },
    rangeItem: {
      flex: 1,
      paddingVertical: 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    rangeText: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.4,
    },

    /* Hero */
    heroCard: {
      paddingTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 20,
      borderRadius: 22,
      marginBottom: 14,
      overflow: 'hidden',
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.26,
      shadowRadius: 18,
      elevation: 8,
      minHeight: 170,
    },
    heroDecor1: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(255,255,255,0.08)',
      top: -60,
      right: -50,
    },
    heroDecor2: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(255,255,255,0.06)',
      bottom: -40,
      left: -20,
    },
    heroContent: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 130,
    },
    ringWrap: {flexShrink: 0, alignItems: 'center', justifyContent: 'center'},
    ringPercent: {
      fontSize: 22,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.5,
      lineHeight: 24,
      includeFontPadding: false,
    },
    ringLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginTop: 2,
      includeFontPadding: false,
    },
    heroRight: {
      flex: 1,
      minWidth: 0,
      marginLeft: 14,
      justifyContent: 'center',
    },
    heroEyebrow: {
      fontSize: 9.5,
      fontWeight: '900',
      color: 'rgba(255,255,255,0.75)',
      letterSpacing: 1.3,
    },
    heroBig: {
      marginTop: 3,
      fontSize: 26,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.9,
      includeFontPadding: false,
    },
    heroBigSub: {
      fontSize: 15,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.7)',
    },
    heroMiniRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 6,
    },
    heroMiniItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    heroMiniText: {
      fontSize: 11,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.9)',
    },
    trendPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    trendPillText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },

    /* Metrics */
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 4,
    },

    /* Card */
    card: {
      marginTop: 14,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
    },
    cardHeaderText: {flex: 1, minWidth: 0},
    cardIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      flexShrink: 0,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    cardSubtitle: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.1,
      marginTop: 1,
    },
    weekBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
      flexShrink: 0,
      marginLeft: 8,
    },
    weekBadgeText: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* Donut */
    donutRow: {flexDirection: 'row', alignItems: 'center'},
    donutWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    donutCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    donutNum: {
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    donutLabel: {
      fontSize: 9.5,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginTop: 1,
    },
    legendCol: {flex: 1, minWidth: 0, marginLeft: 14, gap: 8},
    legendRow: {flexDirection: 'row', alignItems: 'center', gap: 7},
    legendDot: {width: 8, height: 8, borderRadius: 4, flexShrink: 0},
    legendLabel: {
      flex: 1,
      minWidth: 0,
      fontSize: 12.5,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    legendValue: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.2,
      minWidth: 18,
      textAlign: 'right',
    },
    legendPct: {
      fontSize: 11.5,
      fontWeight: '900',
      letterSpacing: 0.2,
      minWidth: 38,
      textAlign: 'right',
    },

    /* Section */
    sectionHeading: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginTop: 18,
      marginBottom: 10,
    },
    insightsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    /* Achievements */
    achievementsCard: {
      padding: 12,
      borderRadius: 18,
      borderWidth: 1,
    },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    achievementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
    },
    achievementIcon: {
      width: 24,
      height: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    achievementLabel: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.1,
    },
  });
}

export default StatsScreen;