import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { bubbleIn, Pulse, rise, TypingDots } from '@/components/motion';
import { useKeyboardOpen, useTabBarSpace } from '@/components/tab-bar';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Shop } from '@/constants/shop';
import { Colors, Fonts } from '@/constants/theme';
import { callShop, openShopMap, openWhatsApp } from '@/lib/links';
import { QuickAnswers, useShop } from '@/store/shop-store';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const keyboardOpen = useKeyboardOpen();
  const { user, chat, typing, sendChat } = useShop();
  const [draft, setDraft] = useState('');
  const list = useRef<ScrollView>(null);

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    if (!user) return router.push('/sign-in');
    sendChat(text);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <View style={[styles.top, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={rise()}>
          <Txt display size={26} accessibilityRole="header">
            Help & chat
          </Txt>
          <Txt weight="bold" size={12} color={Colors.sage}>
            ● Shop team replies {Shop.hours ? `· ${Shop.hours}` : 'during shop hours'}
          </Txt>
        </Animated.View>

        {!keyboardOpen ? (
          <>
            <Animated.View entering={rise(1)}>
              <Tap
                onPress={() => openWhatsApp('Hi Shrungar, I have an enquiry about a bulk order')}
                style={styles.whatsapp}>
                <Pulse color="rgba(255,255,255,0.35)" size={52}>
                  <View style={styles.whatsappIcon}>
                    <Icon name="whatsapp" size={28} color={Colors.white} />
                  </View>
                </Pulse>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt weight="bold" size={16} color={Colors.white}>
                    Chat on WhatsApp
                  </Txt>
                  <Txt size={13} color={Colors.whatsappMist}>
                    Enquiries, bulk & big orders, gifting, custom work
                  </Txt>
                </View>
                <Icon name="external" size={18} color={Colors.white} />
              </Tap>
            </Animated.View>

            <Animated.View entering={rise(2)} style={styles.twoUp}>
              <Tap onPress={callShop} style={styles.contact}>
                <Icon name="phone" size={18} color={Colors.accent} />
                <Txt weight="bold" size={14}>
                  Call shop
                </Txt>
              </Tap>
              <Tap onPress={openShopMap} style={styles.contact}>
                <Icon name="pin" size={18} color={Colors.accent} />
                <Txt weight="bold" size={14}>
                  Visit shop
                </Txt>
              </Tap>
            </Animated.View>

            <Animated.View entering={rise(3)}>
              <Txt size={12} color={Colors.muted} style={{ textAlign: 'center', lineHeight: 17 }}>
                {Shop.address}
              </Txt>
            </Animated.View>
          </>
        ) : null}
      </View>

      <View style={[styles.sheet, { paddingBottom: keyboardOpen ? 10 : tabSpace + 8 }]}>
        <Txt size={12} color={Colors.faint} style={{ textAlign: 'center' }}>
          In-app chat · replies from our shop
        </Txt>
        <ScrollView
          ref={list}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled">
          {chat.map((m) => {
            const mine = m.from === 'me';
            return (
              <Animated.View
                key={m.id}
                entering={bubbleIn(mine)}
                style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Txt size={14} color={mine ? Colors.white : Colors.ink} style={{ lineHeight: 20 }}>
                  {m.text}
                </Txt>
              </Animated.View>
            );
          })}
          {typing ? (
            <Animated.View entering={bubbleIn(false)} style={[styles.bubble, styles.theirs, { paddingVertical: 14 }]}>
              <TypingDots />
            </Animated.View>
          ) : null}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
          {Object.keys(QuickAnswers).map((q) => (
            <Tap key={q} onPress={() => sendChat(q)} style={styles.quick}>
              <Txt weight="semibold" size={13}>
                {q}
              </Txt>
            </Tap>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <View style={styles.inputWrap}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={sendDraft}
              returnKeyType="send"
              placeholder={user ? 'Type a message…' : 'Sign in to message the shop'}
              placeholderTextColor={Colors.faint}
              accessibilityLabel="Message"
              style={styles.input}
            />
          </View>
          <Tap accessibilityLabel="Send message" onPress={sendDraft} style={styles.send}>
            <Icon name="send" size={20} color={Colors.white} />
          </Tap>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  top: { paddingHorizontal: 20, paddingBottom: 14, gap: 14 },
  whatsapp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.whatsapp,
    borderRadius: 22,
    padding: 16,
  },
  whatsappIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoUp: { flexDirection: 'row', gap: 10 },
  contact: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 18,
    paddingHorizontal: 16,
    gap: 10,
  },
  messages: { gap: 10, paddingVertical: 4 },
  bubble: { maxWidth: '78%', paddingVertical: 11, paddingHorizontal: 14 },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.accent,
    borderRadius: 18,
    borderBottomRightRadius: 6,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.chip,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
  },
  quick: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
  },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  inputWrap: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.page,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: { height: '100%', fontFamily: Fonts.regular, fontSize: 15, color: Colors.ink },
  send: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
