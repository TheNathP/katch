import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  headerTitle: { fontWeight: '900' },
  section: { gap: Spacing.two, marginBottom: Spacing.three },
  heading: { fontSize: 21, lineHeight: 26, fontWeight: '900', letterSpacing: -0.45 },
  card: { paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 10 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
  label: { flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pressed: { opacity: 0.65 },
  primary: { marginTop: Spacing.one },
  ghost: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  confirmation: { padding: 12, gap: Spacing.two, borderRadius: 16, borderWidth: 1 },
  modal: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: OnboardingColors.ink, opacity: 0.49 },
  modalContent: { flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center' },
  dialog: {
    width: '100%', maxWidth: 520, padding: 18, gap: 14, borderWidth: 1,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
  },
  dialogTitle: { fontSize: 22, lineHeight: 28, fontWeight: '900' },
  dialogActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  dialogAction: { flex: 1, minWidth: 116, minHeight: 54, paddingVertical: Spacing.two, paddingHorizontal: 10 },
  dialogCancel: { borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' },
});
