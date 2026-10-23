import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export default function EmptyState({ icon = 'construct-outline', title, message }: Props) {
  return (
    <View style={styles.box}>
      <Ionicons name={icon} size={40} color={colors.muted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  title: { fontSize: font.lg, fontWeight: '700', color: colors.ink },
  message: { fontSize: font.md, color: colors.muted, textAlign: 'center' },
});
