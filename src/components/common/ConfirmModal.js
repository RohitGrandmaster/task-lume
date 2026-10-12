import {
  Modal,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import AppButton from './AppButton';
import useTheme from '../../hooks/useTheme';

function ConfirmModal({
  visible,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onCancel,
  onConfirm,
  danger = false,
  loading = false,
  icon: Icon,
  iconColor,
}) {
  const {theme} = useTheme();

  const styles = createStyles(theme);

  const activeIconColor =
    iconColor || (danger ? theme.colors.danger : theme.colors.primary);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={loading ? undefined : onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {Icon && (
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: `${activeIconColor}18`,
                  borderColor: `${activeIconColor}30`,
                },
              ]}>
              <Icon
                size={24}
                color={activeIconColor}
                strokeWidth={2.4}
              />
            </View>
          )}

          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.message}>
            {message}
          </Text>

          <View style={styles.actions}>
            <View style={styles.action}>
              <AppButton
                title={cancelText}
                variant="secondary"
                disabled={loading}
                onPress={onCancel}
              />
            </View>

            <View style={styles.action}>
              <AppButton
                title={confirmText}
                variant={
                  danger ? 'danger' : 'primary'
                }
                loading={loading}
                disabled={loading}
                onPress={onConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },

    modal: {
      width: '100%',
      maxWidth: 390,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xxl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },

    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      marginBottom: theme.spacing.lg,
    },

    title: {
      fontSize: theme.typography.heading,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },

    message: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.textSecondary,
    },

    actions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.xxl,
    },

    action: {
      flex: 1,
    },
  });
}

export default ConfirmModal;