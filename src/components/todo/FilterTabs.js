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
import {useTranslation} from '../../i18n/translations';

function FilterTabs({selectedFilter, onChange}) {
  const {theme} = useTheme();
  const {t} = useTranslation();

  const FILTERS = [
    {
      key: 'all',
      label: t('all', 'All'),
      color: '#6366F1',
      Icon: List,
    },
    {
      key: 'active',
      label: t('active', 'Active'),
      color: '#F59E0B',
      Icon: Clock,
    },
    {
      key: 'completed',
      label: t('completed', 'Done'),
      color: '#10B981',
      Icon: CheckCircle2,
    },
  ];

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
              },
            ]}
            onPress={() => onChange(filter.key)}
            accessibilityRole="tab"
            accessibilityState={{selected}}>
            <IconComponent
              size={15}
              color={selected ? '#FFFFFF' : filter.color}
              strokeWidth={2.6}
            />

            <Text
              style={[
                styles.text,
                {color: selected ? '#FFFFFF' : filter.color},
                selected && styles.selectedText,
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
      marginVertical: theme.spacing.lg,
    },

    tab: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 8,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },

    text: {
      fontSize: theme.typography.bodySmall,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    selectedText: {
      fontWeight: '800',
    },
  });
}

export default FilterTabs;
