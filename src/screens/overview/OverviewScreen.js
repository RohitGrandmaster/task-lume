import React, {useMemo, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import Svg, {Circle} from 'react-native-svg';
import {
  Menu,
  Flame,
  Target,
  Award,
  TrendingUp,
  Zap,
  CheckCircle2,
  Clock,
  Star,
  CalendarCheck,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react-native';

import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';

/* --------------------------- HELPERS --------------------------- */

const pad = v => String(v).padStart(2, '0');
const dateKey = d =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const SHORT_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
};

/* --------------------------- PROGRESS RING --------------------------- */

function ProgressRing({
  size = 120,
  strokeWidth = 10,
  percent = 0,
  color = '#FFFFFF',
  trackColor = 'rgba(255,255,255,0.22)',
  children,
}) {
  // Buffer prevents stroke from being clipped at the container edge
  const BUFFER = 8;
  const containerSize = size + BUFFER * 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.min(Math.max(percent, 0), 100);
  const offset = circumference * (1 - safe / 100);

  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={containerSize} height={containerSize}>
        <Circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${containerSize / 2} ${containerSize / 2})`}
        />
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

/* --------------------------- WEEKLY BAR CHART --------------------------- */

function WeeklyBarChart({data, maxValue, theme}) {
  const CHART_HEIGHT = 130;

  return (
    <View style={weeklyStyles.wrap}>
      <View style={[weeklyStyles.chart, {height: CHART_HEIGHT}]}>
        {data.map((d, i) => {
          const ratio = maxValue > 0 ? d.value / maxValue : 0;
          const barHeight = Math.max(ratio * (CHART_HEIGHT - 22), 6);
          const isToday = d.isToday;

          return (
            <View key={i} style={weeklyStyles.barColumn}>
              {d.value > 0 && (
                <Text
                  style={[
                    weeklyStyles.barValue,
                    {
                      color: isToday
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    },
                  ]}>
                  {d.value}
                </Text>
              )}
              <View
                style={[
                  weeklyStyles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isToday
                      ? theme.colors.primary
                      : theme.colors.border,
                    shadowColor: isToday
                      ? theme.colors.primary
                      : 'transparent',
                    shadowOpacity: isToday ? 0.35 : 0,
                    shadowRadius: 8,
                    shadowOffset: {width: 0, height: 4},
                    elevation: isToday ? 4 : 0,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={weeklyStyles.labelsRow}>
        {data.map((d, i) => (
          <View key={i} style={weeklyStyles.labelColumn}>
            <Text
              style={[
                weeklyStyles.label,
                {
                  color: d.isToday
                    ? theme.colors.primary
                    : theme.colors.textLight,
                  fontWeight: d.isToday ? '900' : '700',
                },
              ]}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* --------------------------- DONUT CHART --------------------------- */

function DonutChart({data, size = 108, strokeWidth = 12, theme}) {
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
        data.map((segment, i) => {
          if (segment.value === 0) return null;
          const portion = segment.value / total;
          const dashLength = circumference * portion;
          const gap = circumference - dashLength;
          const rotate = (cumulative / total) * 360 - 90;
          cumulative += segment.value;

          return (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dashLength} ${gap}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
            />
          );
        })}
    </Svg>
  );
}

/* --------------------------- CATEGORY BAR --------------------------- */

function CategoryBar({item, maxValue, theme}) {
  const percent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
  const color = item.color || theme.colors.primary;

  return (
    <View style={catStyles.row}>
      <View style={catStyles.labelRow}>
        <View style={[catStyles.dot, {backgroundColor: color}]} />
        <Text
          style={[catStyles.label, {color: theme.colors.text}]}
          numberOfLines={1}>
          {item.label}
        </Text>
        <Text
          style={[catStyles.count, {color: theme.colors.textSecondary}]}>
          {item.value}
        </Text>
      </View>
      <View
        style={[
          catStyles.track,
          {backgroundColor: theme.colors.border},
        ]}>
        <View
          style={[
            catStyles.fill,
            {width: `${percent}%`, backgroundColor: color},
          ]}
        />
      </View>
    </View>
  );
}

/* --------------------------- INSIGHT CARD --------------------------- */

function InsightCard({icon: Icon, iconColor, label, value, suffix, theme}) {
  return (
    <View
      style={[
        insightStyles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}>
      <View
        style={[
          insightStyles.iconWrap,
          {backgroundColor: `${iconColor}18`},
        ]}>
        <Icon size={15} color={iconColor} strokeWidth={2.6} />
      </View>
      <Text
        style={[insightStyles.value, {color: theme.colors.text}]}
        numberOfLines={1}>
        {value}
        {suffix ? (
          <Text
            style={[
              insightStyles.suffix,
              {color: theme.colors.textSecondary},
            ]}>
            {suffix}
          </Text>
        ) : null}
      </Text>
      <Text
        style={[insightStyles.label, {color: theme.colors.textSecondary}]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* --------------------------- MAIN SCREEN --------------------------- */

function OverviewScreen() {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {tasks, loadTodos} = useTodos();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof loadTodos === 'function') {
        await loadTodos();
      }
    } catch (_) {}
    setTimeout(() => setRefreshing(false), 600);
  }, [loadTodos]);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Responsive ring size (chhota taaki buffer ke saath bhi fit ho)
  const ringSize = useMemo(() => {
    if (width < 340) return 88;
    if (width < 375) return 96;
    if (width < 414) return 104;
    return 110;
  }, [width]);

  /* ---------------- Self-contained Stats ---------------- */
  const stats = useMemo(() => {
    const list = (tasks || []).filter(t => !t.deleted);
    const total = list.length;
    const completed = list.filter(t => t.completed).length;
    const active = total - completed;

    const todayKey = dateKey(new Date());

    const isDueToday = task => {
      if (!task.dueDate) return false;
      const dd = String(task.dueDate).trim().toLowerCase();
      if (dd === 'today') return true;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) return dd === todayKey;
      return false;
    };

    const highPriority = list.filter(
      t => !t.completed && t.priority === 'high',
    ).length;

    const dueToday = list.filter(
      t => !t.completed && isDueToday(t),
    ).length;

    const favorites = list.filter(t => t.favorite).length;

    const completionPercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      active,
      highPriority,
      dueToday,
      favorites,
      completionPercentage,
    };
  }, [tasks]);

  const completion = stats.completionPercentage;

  const activeTasks = useMemo(
    () => (tasks || []).filter(t => !t.deleted),
    [tasks],
  );

  /* ---------------- Weekly activity ---------------- */
  const weeklyData = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = dateKey(d);

      const count = activeTasks.filter(t => {
        if (t.createdAt) {
          const created = new Date(t.createdAt);
          if (dateKey(created) === key) return true;
        }
        if (t.completedAt) {
          const done = new Date(t.completedAt);
          if (dateKey(done) === key) return true;
        }
        return false;
      }).length;

      days.push({
        label: SHORT_DAYS[d.getDay()],
        value: count,
        isToday: i === 0,
      });
    }
    return days;
  }, [activeTasks]);

  const weeklyMax = Math.max(...weeklyData.map(d => d.value), 1);
  const weeklyTotal = weeklyData.reduce((s, d) => s + d.value, 0);

  /* ---------------- Priority distribution ---------------- */
  const priorityData = useMemo(() => {
    const counts = {high: 0, medium: 0, low: 0};
    activeTasks.forEach(t => {
      if (t.completed) return;
      const p = t.priority || 'medium';
      if (counts[p] !== undefined) counts[p]++;
    });
    return [
      {label: 'High', value: counts.high, color: PRIORITY_COLORS.high},
      {
        label: 'Medium',
        value: counts.medium,
        color: PRIORITY_COLORS.medium,
      },
      {label: 'Low', value: counts.low, color: PRIORITY_COLORS.low},
    ];
  }, [activeTasks]);

  const priorityTotal = priorityData.reduce((s, p) => s + p.value, 0);

  /* ---------------- Category distribution ---------------- */
  const categoryData = useMemo(() => {
    const map = {};
    activeTasks.forEach(t => {
      if (t.completed) return;
      const cat = t.category || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    });

    return Object.entries(map)
      .map(([label, value]) => ({
        label,
        value,
        color: CATEGORY_COLORS[label] || theme.colors.primary,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [activeTasks, theme.colors.primary]);

  const categoryMax = Math.max(...categoryData.map(c => c.value), 1);

  /* ---------------- Insights ---------------- */
  const insights = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const has = activeTasks.some(t => {
        if (t.createdAt && dateKey(new Date(t.createdAt)) === key)
          return true;
        if (t.completedAt && dateKey(new Date(t.completedAt)) === key)
          return true;
        return false;
      });
      if (has) streak++;
      else if (i > 0) break;
    }

    const avg = (weeklyTotal / 7).toFixed(1);

    let bestIdx = 0;
    weeklyData.forEach((d, i) => {
      if (d.value > weeklyData[bestIdx].value) bestIdx = i;
    });
    const bestDay = weeklyData[bestIdx];

    return {
      streak,
      avg,
      bestDay: bestDay && bestDay.value > 0 ? bestDay : null,
      favorites: stats.favorites,
    };
  }, [activeTasks, weeklyData, weeklyTotal, stats.favorites]);

  /* ---------------- Daily tip ---------------- */
  const tip = useMemo(() => {
    if (stats.active === 0)
      return 'All tasks done! Great work today. Time to relax.';
    if (stats.highPriority > 0)
      return `You have ${stats.highPriority} high priority task${
        stats.highPriority > 1 ? 's' : ''
      }. Focus on those first.`;
    if (completion >= 70)
      return `You're at ${completion}% completion. Almost there — keep pushing!`;
    if (completion >= 40)
      return 'Good momentum. Complete one task at a time.';
    return 'Small progress every day adds up to big results.';
  }, [stats.active, stats.highPriority, completion]);

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
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 12) + 110},
        ]}>
        <View style={styles.container}>
          {/* ============ HEADER ============ */}
          <View style={styles.header}>
            <Pressable
              style={styles.menuBtn}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open drawer menu">
              <Menu size={18} color={theme.colors.text} strokeWidth={2.6} />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>Overview</Text>
              <Text style={styles.subtitle}>
                Your productivity at a glance
              </Text>
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

          {/* ============ HERO CARD ============ */}
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
                  percent={completion}
                  color="#FFFFFF"
                  trackColor="rgba(255,255,255,0.22)">
                  <Text style={styles.ringPercent}>{completion}%</Text>
                  <Text style={styles.ringLabel}>done</Text>
                </ProgressRing>
              </View>

              <View style={styles.heroRight}>
                <Text style={styles.heroEyebrow} numberOfLines={1}>
                  COMPLETION
                </Text>
                <Text style={styles.heroBig} numberOfLines={1}>
                  {stats.completed}
                  <Text style={styles.heroBigSub}> / {stats.total}</Text>
                </Text>

                <View style={styles.heroMiniRow}>
                  <View style={styles.heroMiniItem}>
                    <CheckCircle2
                      size={11}
                      color="rgba(255,255,255,0.9)"
                      strokeWidth={2.6}
                    />
                    <Text style={styles.heroMiniText} numberOfLines={1}>
                      {stats.completed} done
                    </Text>
                  </View>
                  <View style={styles.heroMiniItem}>
                    <Clock
                      size={11}
                      color="rgba(255,255,255,0.9)"
                      strokeWidth={2.6}
                    />
                    <Text style={styles.heroMiniText} numberOfLines={1}>
                      {stats.active} left
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ============ QUICK STATS PILLS ============ */}
          <View style={styles.pillRow}>
            <View
              style={[
                styles.pill,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.pillIconWrap,
                  {backgroundColor: PRIORITY_COLORS.high + '18'},
                ]}>
                <AlertTriangle
                  size={14}
                  color={PRIORITY_COLORS.high}
                  strokeWidth={2.6}
                />
              </View>
              <Text style={[styles.pillValue, {color: theme.colors.text}]}>
                {stats.highPriority}
              </Text>
              <Text
                style={[
                  styles.pillLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                High
              </Text>
            </View>

            <View
              style={[
                styles.pill,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.pillIconWrap,
                  {backgroundColor: '#3B82F6' + '18'},
                ]}>
                <CalendarCheck
                  size={14}
                  color="#3B82F6"
                  strokeWidth={2.6}
                />
              </View>
              <Text style={[styles.pillValue, {color: theme.colors.text}]}>
                {stats.dueToday}
              </Text>
              <Text
                style={[
                  styles.pillLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Due today
              </Text>
            </View>

            <View
              style={[
                styles.pill,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.pillIconWrap,
                  {backgroundColor: '#EAB308' + '18'},
                ]}>
                <Star
                  size={14}
                  color="#EAB308"
                  strokeWidth={2.6}
                  fill="#EAB308"
                />
              </View>
              <Text style={[styles.pillValue, {color: theme.colors.text}]}>
                {stats.favorites}
              </Text>
              <Text
                style={[
                  styles.pillLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Favorites
              </Text>
            </View>
          </View>

          {/* ============ WEEKLY ACTIVITY ============ */}
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
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    Weekly Activity
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    Last 7 days
                  </Text>
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
                  size={11}
                  color={theme.colors.primary}
                  strokeWidth={2.8}
                />
                <Text
                  style={[
                    styles.weekBadgeText,
                    {color: theme.colors.primary},
                  ]}>
                  {weeklyTotal}
                </Text>
              </View>
            </View>

            <WeeklyBarChart
              data={weeklyData}
              maxValue={weeklyMax}
              theme={theme}
            />
          </View>

          {/* ============ PRIORITY DONUT ============ */}
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
                  <PieChart
                    size={15}
                    color="#8B5CF6"
                    strokeWidth={2.6}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    Priority Breakdown
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {priorityTotal} active task
                    {priorityTotal !== 1 ? 's' : ''}
                  </Text>
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
                      <Text
                        style={[
                          styles.donutCenterNum,
                          {color: theme.colors.text},
                        ]}>
                        {priorityTotal}
                      </Text>
                      <Text
                        style={[
                          styles.donutCenterLabel,
                          {color: theme.colors.textSecondary},
                        ]}>
                        active
                      </Text>
                    </>
                  ) : (
                    <CheckCircle2
                      size={24}
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
                      <Text
                        style={[
                          styles.legendLabel,
                          {color: theme.colors.text},
                        ]}
                        numberOfLines={1}>
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.legendPct,
                          {color: item.color},
                        ]}>
                        {pct}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ============ CATEGORY BARS ============ */}
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
                    <Target
                      size={15}
                      color="#14B8A6"
                      strokeWidth={2.6}
                    />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      Top Categories
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      Where your focus goes
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.catList}>
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

          {/* ============ INSIGHTS ============ */}
          <View style={styles.insightsSection}>
            <Text
              style={[
                styles.sectionHeading,
                {color: theme.colors.textLight},
              ]}>
              INSIGHTS
            </Text>

            <View style={styles.insightsGrid}>
              <InsightCard
                icon={Flame}
                iconColor="#F97316"
                label="Day streak"
                value={insights.streak}
                suffix={insights.streak === 1 ? ' day' : ' days'}
                theme={theme}
              />
              <InsightCard
                icon={Zap}
                iconColor="#F59E0B"
                label="Avg / day"
                value={insights.avg}
                theme={theme}
              />
              <InsightCard
                icon={Award}
                iconColor="#8B5CF6"
                label="Best day"
                value={insights.bestDay ? insights.bestDay.value : 0}
                suffix=" tasks"
                theme={theme}
              />
              <InsightCard
                icon={Star}
                iconColor="#EAB308"
                label="Favorites"
                value={insights.favorites}
                theme={theme}
              />
            </View>
          </View>

          {/* ============ DAILY TIP ============ */}
          <View
            style={[
              styles.tipCard,
              {
                backgroundColor: theme.colors.primary + '12',
                borderColor: theme.colors.primary + '30',
              },
            ]}>
            <View
              style={[
                styles.tipIconWrap,
                {backgroundColor: theme.colors.primary + '20'},
              ]}>
              <Lightbulb
                size={16}
                color={theme.colors.primary}
                strokeWidth={2.6}
              />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text
                style={[styles.tipTitle, {color: theme.colors.primary}]}>
                Daily Tip
              </Text>
              <Text style={[styles.tipText, {color: theme.colors.text}]}>
                {tip}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------- SUB STYLES --------------------------- */

const weeklyStyles = StyleSheet.create({
  wrap: {
    marginTop: 6,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 3,
  },
  bar: {
    width: '100%',
    maxWidth: 26,
    borderRadius: 7,
    minHeight: 6,
  },
  barValue: {
    fontSize: 10.5,
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
  labelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
});

const catStyles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  count: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  track: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

const insightStyles = StyleSheet.create({
  card: {
    width: '48.5%',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  suffix: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
});

/* --------------------------- MAIN STYLES --------------------------- */

function createStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    container: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },
    menuBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    subtitle: {
      marginTop: 3,
      fontSize: 12.5,
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
      marginLeft: 10,
    },

    /* ============ HERO (RESPONSIVE, NO CUT) ============ */
    heroCard: {
      paddingTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 22,
      borderRadius: 22,
      overflow: 'hidden',
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.26,
      shadowRadius: 20,
      elevation: 8,
      minHeight: 172,
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
      minHeight: 132,
    },
    ringWrap: {
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
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

    /* Pills */
    pillRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 14,
    },
    pill: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 11,
      paddingHorizontal: 8,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: 'center',
    },
    pillIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    pillValue: {
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.4,
      lineHeight: 19,
    },
    pillLabel: {
      fontSize: 9.5,
      fontWeight: '700',
      letterSpacing: 0.2,
      marginTop: 2,
      textAlign: 'center',
    },

    /* Generic Card */
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
    cardHeaderText: {
      flex: 1,
      minWidth: 0,
    },
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

    /* Weekly badge */
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

    /* Donut row */
    donutRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
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
    donutCenterNum: {
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    donutCenterLabel: {
      fontSize: 9.5,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginTop: 1,
    },
    legendCol: {
      flex: 1,
      minWidth: 0,
      marginLeft: 14,
      gap: 8,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    legendLabel: {
      flex: 1,
      minWidth: 0,
      fontSize: 12.5,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    legendPct: {
      fontSize: 11.5,
      fontWeight: '900',
      letterSpacing: 0.2,
      minWidth: 38,
      textAlign: 'right',
    },

    /* Category list */
    catList: {
      marginTop: 2,
    },

    /* Insights */
    insightsSection: {
      marginTop: 18,
    },
    sectionHeading: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginBottom: 10,
    },
    insightsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    /* Tip */
    tipCard: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
    },
    tipIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    tipTitle: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    tipText: {
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
      letterSpacing: 0.1,
    },
  });
}

export default OverviewScreen;