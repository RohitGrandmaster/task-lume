import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import AppButton from './AppButton';
import useTheme from '../../hooks/useTheme';

function ConfirmModal({
  visible,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  // Support both naming conventions used across the app
  cancelText,
  confirmText,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  danger = false,
  loading = false,
  icon: Icon,
  iconColor,
}) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const resolvedCancel = cancelText || cancelLabel || 'Cancel';
  const resolvedConfirm = confirmText || confirmLabel || 'Confirm';

  const activeIconColor =
    iconColor || (danger ? theme.colors.danger : theme.colors.primary);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={loading ? undefined : onCancel}>
      <Pressable style={styles.overlay} onPress={loading ? undefined : onCancel}>
        <Pressable
          style={styles.modal}
          onPress={e => e.stopPropagation()}>
          {Icon ? (
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: `${activeIconColor}18`,
                  borderColor: `${activeIconColor}35`,
                },
              ]}>
              <Icon
                size={24}
                color={activeIconColor}
                strokeWidth={2.4}
              />
            </View>
          ) : null}

          <Text style={styles.title}>{title}</Text>

          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}

          <View style={styles.actions}>
            <View style={styles.action}>
              <AppButton
                title={resolvedCancel}
                variant="secondary"
                disabled={loading}
                onPress={onCancel}
              />
            </View>

            <View style={styles.action}>
              <AppButton
                title={resolvedConfirm}
                variant={danger ? 'danger' : 'primary'}
                loading={loading}
                disabled={loading}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(theme) {
  const isDark = theme.mode === 'dark';

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isDark
        ? 'rgba(0,0,0,0.65)'
        : 'rgba(15, 23, 42, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },

    modal: {
      width: '100%',
      maxWidth: 380,
      borderRadius: 24,
      padding: 24,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.elevated,
    },

    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      marginBottom: 16,
    },

    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },

    message: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },

    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },

    action: {
      flex: 1,
    },
  });
}

export default ConfirmModal;
