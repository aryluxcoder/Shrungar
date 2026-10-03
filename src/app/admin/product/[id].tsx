import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminOnly } from '@/components/admin';
import { Icon } from '@/components/icons';
import { rise } from '@/components/motion';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Button, Field, Label, ScreenHeader, TextLink } from '@/components/ui';
import { Colors } from '@/constants/theme';
import {
  Categories,
  ColourOptions,
  CraftOptions,
  SizeOptions,
  patternFor,
  type CategoryId,
  type Product,
  type Swatch,
} from '@/data/catalogue';
import { confirmAction } from '@/lib/links';
import { pickPhotos } from '@/lib/photos';
import { useShop } from '@/store/shop-store';

const MAX_PHOTOS = 5;
const SHIPS = 'Ships across India';

function Choice({ label, on, dot, onPress }: { label: string; on: boolean; dot?: string; onPress: () => void }) {
  return (
    <Tap
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.choice, on && { backgroundColor: Colors.ink }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <Txt weight="bold" size={13} color={on ? Colors.white : Colors.ink}>
        {label}
      </Txt>
    </Tap>
  );
}

function ProductForm({ existing }: { existing?: Product }) {
  const insets = useSafeAreaInsets();
  const { admin } = useShop();

  const [productId] = useState(() => existing?.id ?? admin.newProductId());
  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []);
  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<CategoryId>(existing?.category ?? 'clothes');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [detail, setDetail] = useState(existing?.detail ?? '');
  const [craft, setCraft] = useState(existing?.tags.find((t) => t !== SHIPS) ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [colours, setColours] = useState<Swatch[]>(existing?.colours ?? []);
  const [sizes, setSizes] = useState<string[]>(existing?.sizes ?? []);
  const [shown, setShown] = useState(existing?.status !== 'hidden');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Keep any colours or sizes an older product used that aren't in the standard lists.
  const colourChoices = [...ColourOptions, ...colours.filter((c) => !ColourOptions.some((o) => o.name === c.name))];
  const sizeChoices = [...SizeOptions, ...sizes.filter((s) => !SizeOptions.includes(s))];
  const craftChoices = craft && !CraftOptions.includes(craft) ? [...CraftOptions, craft] : CraftOptions;

  const savingLabel = photos.some((p) => !p.startsWith('http')) ? 'Uploading photos…' : 'Saving…';

  const toggleColour = (swatch: Swatch) => {
    const on = colours.some((c) => c.name === swatch.name);
    setColours(colourChoices.filter((c) => (c.name === swatch.name ? !on : colours.some((x) => x.name === c.name))));
  };
  const toggleSize = (size: string) => {
    const on = sizes.includes(size);
    setSizes(sizeChoices.filter((s) => (s === size ? !on : sizes.includes(s))));
  };

  const addPhotos = async () => {
    const picked = await pickPhotos(MAX_PHOTOS - photos.length);
    if (picked.length) setPhotos([...photos, ...picked].slice(0, MAX_PHOTOS));
  };

  const save = async () => {
    const amount = Math.round(Number(price.replace(/[^\d.]/g, '')));
    if (!name.trim()) return setError('Give the product a name');
    if (!amount) return setError('Enter a price');
    setSaving(true);
    setError('');
    try {
      await admin.saveProduct({
        id: productId,
        name: name.trim(),
        category,
        price: amount,
        detail: detail.trim(),
        tags: [craft, SHIPS].filter(Boolean),
        description: description.trim(),
        colours: colours.length ? colours : undefined,
        sizes: sizes.length ? sizes : undefined,
        photos,
        pattern: existing && existing.category === category ? existing.pattern : patternFor(category),
        status: shown ? 'active' : 'hidden',
      });
      router.back();
    } catch {
      setError('Could not save. Check your internet connection and try again.');
      setSaving(false);
    }
  };

  const remove = async () => {
    const sure = await confirmAction('Delete this product?', 'It will be removed from the shop for good. You can hide it instead.', 'Delete');
    if (!sure) return;
    try {
      await admin.deleteProduct(productId);
      router.back();
    } catch {
      setError('Could not delete. Check your internet connection and try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 28 }]}>
        <ScreenHeader title={existing ? 'Edit product' : 'New product'} />

        <Animated.View entering={rise(1)} style={{ gap: 10 }}>
          <Label>Photos</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 8, paddingRight: 8 }}>
            {photos.map((uri, i) => (
              <View key={uri} style={styles.thumbWrap}>
                <Tap
                  accessibilityLabel={i === 0 ? 'Cover photo' : 'Make this the cover photo'}
                  onPress={() => setPhotos([uri, ...photos.filter((p) => p !== uri)])}>
                  <Image source={uri} style={styles.thumb} contentFit="cover" />
                  {i === 0 ? (
                    <View style={styles.cover}>
                      <Txt weight="bold" size={11} color={Colors.white}>
                        Cover
                      </Txt>
                    </View>
                  ) : null}
                </Tap>
                <Tap
                  accessibilityLabel="Remove photo"
                  onPress={() => setPhotos(photos.filter((p) => p !== uri))}
                  style={styles.remove}>
                  <Icon name="close" size={14} color={Colors.white} />
                </Tap>
              </View>
            ))}
            {photos.length < MAX_PHOTOS ? (
              <Tap onPress={addPhotos} style={styles.addPhoto}>
                <Icon name="camera" size={24} color={Colors.body} />
                <Txt weight="semibold" size={12} color={Colors.body}>
                  Add photos
                </Txt>
              </Tap>
            ) : null}
          </ScrollView>
          <Txt size={12} color={Colors.muted}>
            Up to {MAX_PHOTOS}. Tap a photo to make it the cover.
          </Txt>
        </Animated.View>

        <Animated.View entering={rise(2)} style={{ gap: 8 }}>
          <Label>Name</Label>
          <Field
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError('');
            }}
            placeholder="e.g. Block-print cotton kurta"
            accessibilityLabel="Name"
          />
        </Animated.View>

        <Animated.View entering={rise(2)} style={{ gap: 8 }}>
          <Label>Category</Label>
          <View style={styles.wrap}>
            {Categories.map((c) => (
              <Choice key={c.id} label={c.label} on={c.id === category} onPress={() => setCategory(c.id)} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={rise(3)} style={styles.twoUp}>
          <View style={{ flex: 1, gap: 8 }}>
            <Label>Price (₹)</Label>
            <Field
              value={price}
              onChangeText={(t) => {
                setPrice(t);
                setError('');
              }}
              keyboardType="number-pad"
              placeholder="e.g. 1290"
              accessibilityLabel="Price in rupees"
            />
          </View>
          <View style={{ flex: 1.4, gap: 8 }}>
            <Label>Size or measurements</Label>
            <Field value={detail} onChangeText={setDetail} placeholder="e.g. 2 × 3 ft" accessibilityLabel="Size or measurements" />
          </View>
        </Animated.View>

        <Animated.View entering={rise(3)} style={{ gap: 8 }}>
          <Label>Craft</Label>
          <View style={styles.wrap}>
            {craftChoices.map((c) => (
              <Choice key={c} label={c} on={c === craft} onPress={() => setCraft(c === craft ? '' : c)} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={rise(4)} style={{ gap: 8 }}>
          <Label>Description</Label>
          <Field
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Fabric, how it is made, care instructions…"
            accessibilityLabel="Description"
          />
        </Animated.View>

        <Animated.View entering={rise(4)} style={{ gap: 8 }}>
          <Label>Colours customers can choose</Label>
          <View style={styles.wrap}>
            {colourChoices.map((c) => (
              <Choice
                key={c.name}
                label={c.name}
                dot={c.hex}
                on={colours.some((x) => x.name === c.name)}
                onPress={() => toggleColour(c)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={rise(5)} style={{ gap: 8 }}>
          <Label>Sizes customers can choose</Label>
          <View style={styles.wrap}>
            {sizeChoices.map((s) => (
              <Choice key={s} label={s} on={sizes.includes(s)} onPress={() => toggleSize(s)} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={rise(5)} style={{ gap: 8 }}>
          <Label>Visibility</Label>
          <View style={styles.wrap}>
            <Choice label="In the shop" on={shown} onPress={() => setShown(true)} />
            <Choice label="Hidden" on={!shown} onPress={() => setShown(false)} />
          </View>
        </Animated.View>

        {existing ? <TextLink label="Delete product" onPress={remove} /> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {error ? (
          <Txt weight="semibold" size={13} color={Colors.accent} style={{ textAlign: 'center' }}>
            {error}
          </Txt>
        ) : null}
        <Button
          label={saving ? savingLabel : 'Save product'}
          height={56}
          disabled={saving}
          onPress={save}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function EditProduct() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { admin } = useShop();
  const existing = admin.products.find((p) => p.id === id);

  if (id !== 'new' && !existing) {
    return (
      <View style={[styles.screen, styles.content, { paddingTop: insets.top + 16 }]}>
        <ScreenHeader title="Edit product" />
        <Txt size={15} color={Colors.muted}>
          Loading… If this takes long, the product may have been deleted.
        </Txt>
      </View>
    );
  }
  return <ProductForm key={id} existing={existing} />;
}

export default function AdminProductScreen() {
  return (
    <AdminOnly>
      <EditProduct />
    </AdminOnly>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 20 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  twoUp: { flexDirection: 'row', gap: 10 },
  choice: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)' },
  thumbWrap: { width: 96, height: 96 },
  thumb: { width: 96, height: 96, borderRadius: 16 },
  cover: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(43,22,34,0.75)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  remove: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.dashed,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  footer: { paddingHorizontal: 20, paddingTop: 10, gap: 8 },
});
