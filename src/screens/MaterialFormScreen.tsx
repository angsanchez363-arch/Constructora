// SEMANA 2: inputs controlados, teclados numéricos y validación manual.
// SEMANA 3: se presenta como pantalla modal dentro del Stack de Materiales.
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Chip from '../components/Chip';
import FormField from '../components/FormField';
import { useMaterials } from '../context/MaterialsContext';
import { CATEGORIAS } from '../data/materials';
import { colors, font, radius, spacing } from '../theme';
import type { Categoria } from '../types/models';
import type { MaterialesStackScreenProps } from '../types/navigation';

interface Errors {
  name?: string;
  unit?: string;
  price?: string;
  stock?: string;
}

export default function MaterialFormScreen({ navigation }: MaterialesStackScreenProps<'MaterialForm'>) {
  const { addMaterial } = useMaterials();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Categoria>(CATEGORIAS[0]);
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 3) e.name = 'Escribe un nombre de al menos 3 caracteres.';
    if (unit.trim().length === 0) e.unit = 'Indica la unidad de venta (ej. bulto 50 kg).';
    const p = Number(price);
    if (!price || Number.isNaN(p) || p <= 0) e.price = 'Ingresa un precio mayor a 0.';
    const s = Number(stock);
    if (stock === '' || Number.isNaN(s) || s < 0 || !Number.isInteger(s)) e.stock = 'Ingresa una cantidad entera (0 o más).';
    return e;
  };

  const onSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const nuevo = addMaterial({
      name: name.trim(),
      category,
      unit: unit.trim(),
      price: Number(price),
      stock: Number(stock),
      description: description.trim(),
    });
    Alert.alert('Material guardado', `${nuevo.name} ya está en el catálogo.`, [
      { text: 'Aceptar', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Arena de río" error={errors.name} />

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Categoría</Text>
          <View style={styles.chips}>
            {CATEGORIAS.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>

        <FormField label="Unidad de venta" value={unit} onChangeText={setUnit} placeholder="Ej. m³" error={errors.unit} />
        <FormField label="Precio (COP)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Ej. 85000" error={errors.price} />
        <FormField label="Stock inicial" value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="Ej. 40" error={errors.stock} />
        <FormField
          label="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Para qué se usa, norma, rendimiento…"
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />

        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]} onPress={onSubmit} accessibilityRole="button">
          <Text style={styles.buttonText}>Guardar material</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  group: { gap: spacing.sm },
  groupLabel: { fontSize: font.sm, fontWeight: '700', color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  button: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center' },
  buttonText: { fontSize: font.lg, fontWeight: '800', color: colors.accentInk },
});
