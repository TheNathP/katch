import { Link, type LinkProps } from 'expo-router';
import { Pressable } from 'react-native';

import Button from '@/components/ui/Button';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './NavigationLink.styles';

type NavigationLinkProps = Pick<LinkProps, 'dismissTo' | 'href' | 'replace'> & {
  label: string;
  variant?: 'primarySolid';
};

export default function NavigationLink({ dismissTo, href, label, replace, variant }: NavigationLinkProps) {
  const theme = useTheme();

  return (
    <Link dismissTo={dismissTo} href={href} replace={replace} asChild>
      {variant === 'primarySolid' ? (
        <Button accessibilityRole="link" label={label} variant={variant} />
      ) : (
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => [
            styles.link,
            { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
          ]}>
          <ThemedText>{label}</ThemedText>
        </Pressable>
      )}
    </Link>
  );
}
