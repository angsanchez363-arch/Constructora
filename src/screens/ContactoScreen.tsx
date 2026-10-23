// SEMANA 1: Core Components, Flexbox y StyleSheet (pantalla informativa).
import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

interface Dato {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  url?: string;
}

const DATOS: Dato[] = [
  { icon: 'location-outline', label: 'Oficina principal', value: 'Cra. 13 # 85-20, Bogotá' },
  { icon: 'call-outline', label: 'Teléfono', value: '+57 601 555 0142', url: 'tel:+576015550142' },
  { icon: 'mail-outline', label: 'Correo', value: 'obras@cimientos.example.com', url: 'mailto:obras@cimientos.example.com' },
  { icon: 'time-outline', label: 'Horario', value: 'Lunes a viernes, 7:00 a. m. - 5:00 p. m.' },
];

const SERVICIOS = ['Construcción residencial', 'Obra industrial', 'Remodelaciones', 'Interventoría y supervisión'];

export default function ContactoScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Constructora Cimientos</Text>
      <Text style={styles.subtitle}>Más de 15 años levantando vivienda e infraestructura en Bogotá y Cundinamarca.</Text>

      <View style={styles.card}>
        {DATOS.map((d) => {
          const row = (
            <View style={styles.row}>
              <Ionicons name={d.icon} size={22} color={colors.blueprint} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{d.label}</Text>
                <Text style={[styles.rowValue, d.url && styles.link]}>{d.value}</Text>
              </View>
            </View>
          );
          return d.url ? (
            <Pressable key={d.label} accessibilityRole="link" onPress={() => Linking.openURL(d.url as string)}>
              {row}
            </Pressable>
          ) : (
            <View key={d.label}>{row}</View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Servicios</Text>
      <View style={styles.tags}>
        {SERVICIOS.map((s) => (
          <View key={s} style={styles.tag}>
            <Text style={styles.tagText}>{s}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: font.md, color: colors.muted, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: font.sm, color: colors.muted },
  rowValue: { fontSize: font.md, color: colors.ink, fontWeight: '600' },
  link: { color: colors.blueprint },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.ink, marginTop: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { backgroundColor: colors.ink, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm },
  tagText: { color: colors.surface, fontSize: font.sm, fontWeight: '600' },
});
