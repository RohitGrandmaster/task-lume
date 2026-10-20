import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  List,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';

const FILTERS_CONFIG = [
  {
    key: 'all',
    label: 'All',
    getColor: theme => theme.colors.primary,
    Icon: List,
  },
  {
    key: 'active',
    label: 'Active',
    getColor: theme => theme.colors.warning,
    Icon: Clock,
  },
  {
    key: 'completed',
    label: 'Done',
    getColor: theme => theme.colors.success,
    Icon: CheckCircle2,
  },
];

function FilterTabs({selectedFilter, onChange}) {
  const {theme} = useTheme();

  const FILTERS = FILTERS_CONFIG.map(f => ({
    ...f,
    color: f.getColor(theme),
  }));

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {FILTERS.map(filter => {
        const selected = selectedFilter === filter.key;
        const IconComponent = filter.Icon;

        return (
          <Pressable
            key={filter.key}
            style={[
              styles.tab,
              selected && {
                backgroundColor: filter.color,
                borderColor: filter.color,
                ...theme.shadows.card,
              },
            ]}
            onPress={() => onChange(filter.key)}
            accessibilityRole="tab"
            accessibilityState={{selected}}>
            <IconComponent
              size={15}
              color={selected ? '#FFFFFF' : filter.color}
              strokeWidth={selected ? 2.7 : 2.3}
            />

            <Text
              style={[
                styles.text,
                {color: selected ? '#FFFFFF' : filter.color},
              ]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 8,
      marginVertical: theme.spacing.md,
    },

    tab: {
      flex: 1,
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 8,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },

    text: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.15,
    },
  });
}

export default FilterTabs;
