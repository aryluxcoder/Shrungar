import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { pop, rise } from '@/components/motion';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Button, Field, ScreenHeader } from '@/components/ui';
import { Features } from '@/constants/shop';
import { Colors } from '@/constants/theme';
import { formatDate, initial } from '@/lib/format';
import { pickPhotos } from '@/lib/photos';
import { useShop } from '@/store/shop-store';
import type { Review } from '@/store/types';

const tints = ['#F6C9D6', '#DDEBE5', '#FDEFD8', '#E3E1F2'];

function Bar({ star, share }: { star: number; share: number }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.set(withDelay(300, withTiming(share, { duration: 1000, easing: Easing.bezier(0.2, 0.8, 0.2, 1) })));
  }, [share, width]);
  const fill = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));
  return (
    <View style={styles.barRow}>
      <Txt size={12} color={Colors.muted} style={{ width: 10 }}>
        {star}
      </Txt>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, fill]} />
      </View>
    </View>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const { user, toggleHelpful, addComment } = useShop();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const liked = !!user && review.helpfulBy.includes(user.id);
  const helpfulCount = review.helpfulBy.length;

  const send = () => {
    if (!user) return router.push('/sign-in');
    if (!comment.trim()) return;
    addComment(review.id, comment.trim());
    setComment('');
  };

  return (
    <Animated.View entering={rise(Math.min(index + 3, 5))} style={styles.card}>
      <View style={styles.reviewHead}>
        <View style={[styles.avatar, { backgroundColor: tints[index % tints.length] }]}>
          <Txt weight="bold">{initial(review.userName)}</Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt weight="bold" size={14}>
            {review.userName}
          </Txt>
          <Txt size={12} color={Colors.muted}>
            {review.verified ? 'Verified buyer · ' : ''}
            {formatDate(review.createdAt)}
          </Txt>
        </View>
        <View style={styles.ratingChip}>
          <Txt weight="bold" size={13} color={Colors.marigoldInk}>
            ★ {review.rating}
          </Txt>
        </View>
      </View>

      <Txt size={14} color={Colors.inkSoft} style={{ lineHeight: 21 }}>
        {review.text}
      </Txt>

      {review.photo ? <Image source={review.photo} style={styles.reviewPhoto} contentFit="cover" /> : null}

      {review.reply ? (
        <View style={styles.reply}>
          <Txt weight="bold" size={13} color={Colors.accent}>
            Shrungar replied
          </Txt>
          <Txt size={13} style={{ lineHeight: 19 }}>
            {review.reply}
          </Txt>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Tap
          accessibilityState={{ selected: liked }}
          onPress={() => (user ? toggleHelpful(review.id) : router.push('/sign-in'))}
          style={[styles.pill, liked && { backgroundColor: Colors.blush }]}>
          <Txt weight="semibold" size={13} color={liked ? Colors.accentDeep : Colors.body}>
            ♥ Helpful{helpfulCount ? ` · ${helpfulCount}` : ''}
          </Txt>
        </Tap>
        <Tap onPress={() => setOpen(!open)} style={styles.pill}>
          <Txt weight="semibold" size={13} color={Colors.body}>
            Comment{review.comments.length ? ` · ${review.comments.length}` : ''}
          </Txt>
        </Tap>
      </View>

      {open ? (
        <Animated.View entering={FadeIn.duration(250)} style={{ gap: 8 }}>
          {review.comments.map((c) => (
            <View key={c.id} style={styles.comment}>
              <Txt weight="bold" size={12}>
                {c.userName}{' '}
                <Txt size={12} color={Colors.muted}>
                  · {formatDate(c.createdAt)}
                </Txt>
              </Txt>
              <Txt size={13} style={{ lineHeight: 19 }}>
                {c.text}
              </Txt>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field
              value={comment}
              onChangeText={setComment}
              placeholder={user ? 'Add a comment…' : 'Sign in to comment'}
              onSubmitEditing={send}
              returnKeyType="send"
              accessibilityLabel="Your comment"
              style={styles.commentField}
            />
            <Tap accessibilityLabel="Send comment" onPress={send} style={styles.send}>
              <Icon name="send" size={18} color={Colors.white} />
            </Tap>
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, reviewsFor, postReview, productById } = useShop();
  const product = productById(id);
  const [rating, setRating] = useState(0);
  const [draft, setDraft] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [hint, setHint] = useState('');

  const reviews = product ? reviewsFor(product.id) : [];
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const pickPhoto = async () => {
    const [picked] = await pickPhotos(1);
    if (picked) setPhoto(picked);
  };

  const post = () => {
    if (!product) return;
    if (!rating) return setHint('Tap a star to rate');
    if (!draft.trim()) return setHint('Write a few words about it');
    if (!user) return router.push('/sign-in');
    postReview({ productId: product.id, rating, text: draft.trim(), photo });
    setRating(0);
    setDraft('');
    setPhoto(undefined);
    setHint('');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
        <ScreenHeader title="Reviews" subtitle={product?.name ?? ''} />

        <Animated.View entering={rise(1)} style={[styles.card, styles.summary]}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Txt display size={40} style={{ lineHeight: 44 }}>
              {reviews.length ? average.toFixed(1) : 'New'}
            </Txt>
            <Txt size={12} color={Colors.muted}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Txt>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            {[5, 4, 3, 2, 1].map((star) => (
              <Bar
                key={star}
                star={star}
                share={reviews.length ? reviews.filter((r) => r.rating === star).length / reviews.length : 0}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={rise(2)} style={[styles.card, { gap: 12 }]}>
          <Txt weight="bold" size={15}>
            Write a review
          </Txt>
          <View style={{ flexDirection: 'row', gap: 4 }} accessibilityRole="radiogroup" accessibilityLabel="Your rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <Tap
                key={n}
                accessibilityRole="radio"
                accessibilityLabel={n === 1 ? '1 star' : `${n} stars`}
                accessibilityState={{ checked: n === rating }}
                onPress={() => {
                  setRating(n);
                  setHint('');
                }}
                style={styles.starButton}>
                <Icon name="star" size={32} color={Colors.marigold} fill={n <= rating ? Colors.marigold : 'none'} strokeWidth={1.6} />
              </Tap>
            ))}
          </View>
          <Field
            multiline
            value={draft}
            onChangeText={(t) => {
              setDraft(t);
              setHint('');
            }}
            placeholder="How did you like it? Fabric, finish, delivery…"
            accessibilityLabel="Your review"
            style={styles.reviewField}
          />
          {photo ? (
            <Animated.View entering={pop()} style={styles.thumbWrap}>
              <Image source={photo} style={styles.thumb} contentFit="cover" />
              <Tap accessibilityLabel="Remove photo" onPress={() => setPhoto(undefined)} style={styles.thumbRemove}>
                <Icon name="close" size={14} color={Colors.white} />
              </Tap>
            </Animated.View>
          ) : null}
          {hint ? (
            <Txt weight="semibold" size={13} color={Colors.accent}>
              {hint}
            </Txt>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {Features.reviewPhotos ? (
              <Tap onPress={pickPhoto} style={styles.addPhoto}>
                <Icon name="camera" size={18} color={Colors.body} />
                <Txt weight="semibold" size={14} color={Colors.body}>
                  {photo ? 'Change' : 'Add photo'}
                </Txt>
              </Tap>
            ) : null}
            <Button label={user ? 'Post review' : 'Sign in to post'} height={46} style={{ flex: 1 }} onPress={post} />
          </View>
        </Animated.View>

        {reviews.length ? (
          reviews.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)
        ) : (
          <Animated.View entering={rise(3)} style={styles.empty}>
            <Txt size={14} color={Colors.muted} style={{ textAlign: 'center', lineHeight: 21 }}>
              No reviews yet. Bought this piece? Your words help other shoppers.
            </Txt>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 22, padding: 16, gap: 10 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 18 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: Colors.barTrack, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.marigold },
  starButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  reviewField: { backgroundColor: Colors.page, borderWidth: 1.5, borderColor: Colors.line, boxShadow: 'none' },
  thumbWrap: { width: 84, height: 84 },
  thumb: { width: 84, height: 84, borderRadius: 14 },
  thumbRemove: {
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
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 23,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.dashed,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  ratingChip: { backgroundColor: Colors.marigoldSoft, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8 },
  reviewPhoto: { width: '100%', height: 180, borderRadius: 14 },
  reply: { marginLeft: 14, padding: 12, borderRadius: 14, backgroundColor: Colors.page, gap: 2 },
  pill: { height: 36, paddingHorizontal: 12, borderRadius: 18, backgroundColor: Colors.chip, justifyContent: 'center' },
  comment: { backgroundColor: Colors.page, borderRadius: 14, padding: 10, gap: 2 },
  commentField: { flex: 1, height: 44, backgroundColor: Colors.page, boxShadow: 'none', fontSize: 14 },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { paddingVertical: 24, paddingHorizontal: 20 },
});
