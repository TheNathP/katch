import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TabIcon from '@/components/ui/TabIcon';
import { useTheme } from '@/hooks/use-theme';
import { tabBarStyles } from '@/styles/tab-bar';
import { Colors, Spacing } from '@/styles/theme';

const tabs = [
  { name: 'index', title: 'Katch', label: 'Accueil', icon: 'home' },
  { name: 'amis', title: 'Mes amis', label: 'Amis', icon: 'community' },
  { name: 'defi', title: 'Capturer ma couleur', label: 'Capturer ma couleur', icon: 'camera' },
  { name: 'recompenses', title: 'Récompenses', label: 'Récompenses', icon: 'gift' },
  { name: 'profil', title: 'Mon profil', label: 'Profil', icon: 'profile' },
] as const;

export default function TabLayout() {
  const { bottom, left, right } = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: tabBarStyles.iconArea,
        tabBarStyle: [
          tabBarStyles.bar,
          {
            height: 72 + bottom,
            paddingHorizontal: Math.max(Spacing.three, left, right),
            backgroundColor: theme.tabBarBackground,
            borderColor: theme.tabBarBorder,
          },
        ],
      }}>
      {tabs.map(({ name, title, label, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarLabel: label,
            tabBarAccessibilityLabel: label,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={icon}
                focused={focused}
                color={focused ? Colors.light.tabBarIcon : theme.tabBarIcon}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
