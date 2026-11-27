import { StyleSheet } from 'react-native';

import { MaxContentWidth, OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three },
  header: { gap: Spacing.three },
  headerWithPhotos: { paddingBottom: Spacing.three },
  footer: { gap: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.three },
  tabs: { flexDirection: 'row', padding: Spacing.one, gap: Spacing.one, borderRadius: 24 },
  tab: { flex: 1, minHeight: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 20, paddingVertical: Spacing.one },
  activeTab: { backgroundColor: OnboardingColors.lime },
  activeTabText: { color: OnboardingColors.ink },
  pressed: { opacity: 0.55 },
  panel: { borderRadius: 23, borderWidth: 1, padding: 10, gap: Spacing.two },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.one },
  arrow: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  previous: { transform: [{ rotate: '180deg' }] },
  arrowIcon: { width: 18, height: 18 },
  monthText: { flex: 1, fontSize: 20, fontWeight: '900', textAlign: 'center', paddingVertical: Spacing.one },
  galleryRow: { gap: Spacing.two },
  rowSeparator: { height: Spacing.two },
  collection: {
    flexDirection: 'row', alignSelf: 'stretch', alignItems: 'center', gap: Spacing.two,
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, minHeight: 52, borderRadius: 18, borderWidth: 1,
  },
  collectionText: { flex: 1 },
});
