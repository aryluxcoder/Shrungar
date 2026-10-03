import { Alert, Linking, Platform } from 'react-native';

import { Shop } from '@/constants/shop';

export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export function openWhatsApp(message = 'Hi Shrungar') {
  if (!Shop.whatsappNumber) {
    notify('WhatsApp coming soon', 'The shop WhatsApp number has not been added yet.');
    return;
  }
  Linking.openURL(`https://wa.me/${Shop.whatsappNumber}?text=${encodeURIComponent(message)}`);
}

export function callShop() {
  if (!Shop.phoneNumber) {
    notify('Phone coming soon', 'The shop phone number has not been added yet.');
    return;
  }
  Linking.openURL(`tel:${Shop.phoneNumber}`);
}

export function openShopMap() {
  Linking.openURL(Shop.mapsUrl);
}
