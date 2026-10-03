import { Alert, Linking, Platform } from 'react-native';

import { Shop } from '@/constants/shop';

export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

// Yes/no question before something that can't be undone.
export function confirmAction(title: string, message: string, confirmLabel: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
}

// Opens a WhatsApp chat with a customer (10-digit Indian mobile number).
export function openWhatsAppTo(mobile: string, message: string) {
  Linking.openURL(`https://wa.me/91${mobile.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(message)}`);
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
