import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import {Shield, FileText, X, CheckCircle2, AlertTriangle, Sparkles, UserCheck} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';

function LegalModal({visible, initialTab = 'privacy', onClose}) {
  const {theme} = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          {/* Sheet Handle */}
          <View style={styles.handleWrap}>
            <View
              style={[
                styles.handle,
                {backgroundColor: theme.colors.border},
              ]}
            />
          </View>

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={{flex: 1}}>
              <Text style={[styles.title, {color: theme.colors.text}]}>
                {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms & Disclaimer'}
              </Text>
              <Text
                style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
                TodoMaster • 100% Free & Transparent
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={[
                styles.closeBtn,
                {backgroundColor: theme.colors.background},
              ]}>
              <X size={16} color={theme.colors.text} strokeWidth={2.4} />
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={[styles.tabBar, {backgroundColor: theme.colors.background}]}>
            <Pressable
              onPress={() => setActiveTab('privacy')}
              style={[
                styles.tabBtn,
                activeTab === 'privacy' && [
                  styles.tabBtnActive,
                  {backgroundColor: theme.colors.surface},
                ],
              ]}>
              <Shield
                size={14}
                color={
                  activeTab === 'privacy'
                    ? theme.colors.primary
                    : theme.colors.textLight
                }
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'privacy'
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    fontWeight: activeTab === 'privacy' ? '800' : '600',
                  },
                ]}>
                Privacy Policy
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('terms')}
              style={[
                styles.tabBtn,
                activeTab === 'terms' && [
                  styles.tabBtnActive,
                  {backgroundColor: theme.colors.surface},
                ],
              ]}>
              <FileText
                size={14}
                color={
                  activeTab === 'terms'
                    ? theme.colors.primary
                    : theme.colors.textLight
                }
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'terms'
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    fontWeight: activeTab === 'terms' ? '800' : '600',
                  },
                ]}>
                Terms & Disclaimer
              </Text>
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {activeTab === 'privacy' ? (
              /* ================= PRIVACY POLICY ================= */
              <View>
                {/* Free Pro Badge */}
                <View
                  style={[
                    styles.highlightBox,
                    {
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      borderColor: 'rgba(99, 102, 241, 0.25)',
                    },
                  ]}>
                  <Sparkles size={16} color={theme.colors.primary} strokeWidth={2.5} />
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        styles.highlightTitle,
                        {color: theme.colors.primary},
                      ]}>
                      100% Free Pro Features — Zero Hidden Costs
                    </Text>
                    <Text
                      style={[
                        styles.highlightBody,
                        {color: theme.colors.textSecondary},
                      ]}>
                      All premium features (Pomodoro Focus, Voice Typing, Alarms, Analytics & Custom Themes) are completely free for everyone with no ads and no subscriptions.
                    </Text>
                  </View>
                </View>

                {/* Section 1 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    1. Zero Data Collection & Local Storage
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    Your privacy is our utmost priority. TodoMaster operates entirely on your device. All your tasks, categories, voice memos, completed statistics, and personal profile are saved <Text style={{fontWeight: '800', color: theme.colors.text}}>100% locally on your smartphone</Text>. We do NOT maintain servers that store, read, or track your data.
                  </Text>
                </View>

                {/* Section 2 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    2. Android Permissions & Usage
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    We only request permissions that are essential to deliver core functionality:
                  </Text>

                  <View style={styles.bulletItem}>
                    <CheckCircle2 size={14} color="#10B981" strokeWidth={2.4} />
                    <Text style={[styles.bulletText, {color: theme.colors.textSecondary}]}>
                      <Text style={{fontWeight: '700', color: theme.colors.text}}>Microphone (RECORD_AUDIO): </Text>
                      Used solely in real-time when you tap the voice button for speech-to-text typing. No audio recordings are ever uploaded, stored, or sent to any remote server.
                    </Text>
                  </View>

                  <View style={styles.bulletItem}>
                    <CheckCircle2 size={14} color="#10B981" strokeWidth={2.4} />
                    <Text style={[styles.bulletText, {color: theme.colors.textSecondary}]}>
                      <Text style={{fontWeight: '700', color: theme.colors.text}}>Notifications (POST_NOTIFICATIONS): </Text>
                      Used strictly to deliver timely alerts for due tasks, reminders, and Pomodoro focus sessions you set.
                    </Text>
                  </View>

                  <View style={styles.bulletItem}>
                    <CheckCircle2 size={14} color="#10B981" strokeWidth={2.4} />
                    <Text style={[styles.bulletText, {color: theme.colors.textSecondary}]}>
                      <Text style={{fontWeight: '700', color: theme.colors.text}}>Exact Alarm (SCHEDULE_EXACT_ALARM): </Text>
                      Required so your timer and alarms ring at the exact second configured by you, even when the screen is locked.
                    </Text>
                  </View>

                  <View style={styles.bulletItem}>
                    <CheckCircle2 size={14} color="#10B981" strokeWidth={2.4} />
                    <Text style={[styles.bulletText, {color: theme.colors.textSecondary}]}>
                      <Text style={{fontWeight: '700', color: theme.colors.text}}>Boot Completed (RECEIVE_BOOT_COMPLETED): </Text>
                      Automatically reschedules your pending task alarms if your phone is rebooted or restarted.
                    </Text>
                  </View>
                </View>

                {/* Section 3 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    3. No Third-Party Tracking or Ads
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    TodoMaster contains <Text style={{fontWeight: '800', color: theme.colors.text}}>zero third-party advertisement SDKs</Text> and zero monetization trackers. We never sell, rent, or share any personal information with third parties.
                  </Text>
                </View>

                {/* Section 4 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    4. Children's Privacy
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    This app does not knowingly collect personally identifiable information from anyone under the age of 13. Because all data is stored locally, it complies fully with COPPA and Google Play Family Policies.
                  </Text>
                </View>
              </View>
            ) : (
              /* ================= TERMS & DISCLAIMER ================= */
              <View>
                {/* Legal Disclaimer Box */}
                <View
                  style={[
                    styles.highlightBox,
                    {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      borderColor: 'rgba(239, 68, 68, 0.25)',
                    },
                  ]}>
                  <AlertTriangle size={16} color="#EF4444" strokeWidth={2.5} />
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        styles.highlightTitle,
                        {color: '#EF4444'},
                      ]}>
                      Limitation of Liability & Disclaimer
                    </Text>
                    <Text
                      style={[
                        styles.highlightBody,
                        {color: theme.colors.textSecondary},
                      ]}>
                      TodoMaster is provided free of charge "AS IS". The developer accepts no legal liability for missed alarms, third-party OS battery killers, or accidental local data loss.
                    </Text>
                  </View>
                </View>

                {/* Section 1 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    1. Acceptance of Terms
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    By downloading, installing, or using TodoMaster, you agree to be bound by these terms. If you do not agree with any part of these terms, please discontinue using the application.
                  </Text>
                </View>

                {/* Section 2 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    2. Original Work & Authorship
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    TodoMaster is an original, independently created application designed, engineered, and maintained by <Text style={{fontWeight: '800', color: theme.colors.text}}>Rohit Kumar</Text>. All intellectual property, UI design, sound architecture, and software code are original works.
                  </Text>
                </View>

                {/* Section 3 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    3. Device Battery Optimization & Alarms
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    Certain Android manufacturers (e.g., Xiaomi MIUI, Samsung OneUI, OnePlus OxygenOS, Realme, Vivo) enforce aggressive battery-saver modes ("Doze Mode" or "Deep Sleep") that can suppress background alerts and alarms.
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary, marginTop: 6}]}>
                    <Text style={{fontWeight: '700', color: theme.colors.text}}>User Responsibility: </Text>
                    It is the user's responsibility to exclude TodoMaster from system battery optimization if precise notifications are desired. The developer is not liable for reminders delayed by device operating systems.
                  </Text>
                </View>

                {/* Section 4 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    4. Backup & Data Integrity
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    Because data is held solely on your device, clearing app storage, performing a factory reset, or uninstalling the app will permanently erase your local tasks. You are advised to export or note critical information.
                  </Text>
                </View>

                {/* Section 5 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
                    5. Fair & Lawful Use
                  </Text>
                  <Text style={[styles.bodyText, {color: theme.colors.textSecondary}]}>
                    You agree to use TodoMaster solely for lawful, productive purposes and not to reverse engineer or distribute unauthorized modifications of the software.
                  </Text>
                </View>
              </View>
            )}

            {/* Developer Contact Card */}
            <View
              style={[
                styles.devCard,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View style={styles.devCardHeader}>
                <UserCheck size={16} color={theme.colors.primary} strokeWidth={2.4} />
                <Text style={[styles.devCardTitle, {color: theme.colors.text}]}>
                  App Creator & Support
                </Text>
              </View>
              <Text style={[styles.devCardBody, {color: theme.colors.textSecondary}]}>
                Developed with care by <Text style={{fontWeight: '800', color: theme.colors.text}}>Rohit Kumar</Text> (Software Engineer).
              </Text>
              <Text style={[styles.devCardContact, {color: theme.colors.textLight}]}>
                Official Developer Support: WhatsApp +91 8084350824
              </Text>
            </View>

            <View style={{height: 24}} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabBtnActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  tabText: {
    fontSize: 12.5,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  highlightBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  devCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  devCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  devCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  devCardBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  devCardContact: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
});

export default LegalModal;
