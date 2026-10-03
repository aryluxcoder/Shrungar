import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

// Long side of uploaded photos. Keeps files small so they stay within Firebase's free storage.
const MAX_SIDE = 1600;

async function shrink(asset: ImagePicker.ImagePickerAsset) {
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > MAX_SIDE || asset.height > MAX_SIDE) {
    context.resize(asset.width >= asset.height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
  return saved.uri;
}

// Lets the user pick up to `limit` photos and returns local, resized JPEG files.
export async function pickPhotos(limit: number) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 1,
  });
  if (result.canceled) return [];
  return Promise.all(result.assets.slice(0, limit).map(shrink));
}
