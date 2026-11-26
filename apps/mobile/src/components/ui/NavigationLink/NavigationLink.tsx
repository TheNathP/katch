import { Link, type LinkProps } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import Button from '@/components/ui/Button';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './NavigationLink.styles';

type NavigationLinkProps = Pick<LinkProps, 'dismissTo' | 'href' | 'replace'> & {
  /** Shown as text, or only read by screen readers for `plain` with `children`. */
  label: string;
  /** `plain`: no background, `children` centered in a column. */
  variant?: 'primarySolid' | 'plain';
  /** Custom content of the `plain` variant, shown instead of the label. */
  children?: ReactNode;
};

export default function NavigationLink({ dismissTo, href, label, replace, variant, children }: NavigationLinkProps) {
  const theme = useTheme();
  const [plainPressed, setPlainPressed] = useState(false);

  if (variant === 'plain') {
    // `Link asChild` merges the child's style as an object: a style function or
    // array would be dropped, so the pressed state is tracked here instead.
    return (
      <Link dismissTo={dismissTo} href={href} replace={replace} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={children ? label : undefined}
          onPressIn={() => setPlainPressed(true)}
          onPressOut={() => setPlainPressed(false)}
          style={StyleSheet.flatten([styles.plain, plainPressed && styles.plainPressed])}>
          {children ?? <ThemedText>{label}</ThemedText>}
        </Pressable>
      </Link>
    );
  }

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
