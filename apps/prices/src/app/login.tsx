import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Txt } from '@/components/home/primitives';
import { Brand, Radius } from '@/constants/theme';
import {
  AuthError,
  DEMO_CREDENTIALS,
  isValidEmail,
  signInWithGoogle,
  signInWithPassword,
} from '@/data/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

const close = () => (router.canGoBack() ? router.back() : router.replace('/settings' as Href));

type Pending = null | 'password' | 'google';

export default function LoginScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const passwordRef = useRef<TextInputInstance>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && pending === null;

  const submit = async () => {
    if (!canSubmit) return;
    if (!isValidEmail(email)) {
      setError('Ingresa un correo válido.');
      return;
    }
    setError(null);
    setPending('password');
    try {
      app.signIn(await signInWithPassword(email, password));
      close();
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'No pudimos iniciar sesión. Intenta de nuevo.');
      setPending(null);
    }
  };

  const google = async () => {
    if (pending) return;
    setError(null);
    setPending('google');
    try {
      app.signIn(await signInWithGoogle());
      close();
    } catch {
      setError('No pudimos conectar con Google.');
      setPending(null);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError(null);
  };

  const fieldStyle = (name: 'email' | 'password') => [
    styles.field,
    {
      backgroundColor: c.surface,
      borderColor: error ? c.deal : focused === name ? c.primary : c.border,
      boxShadow: focused === name ? `0 0 0 4px ${error ? c.dealSoft : c.primarySoft}` : 'none',
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: c.background }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.inner}>
          <View style={styles.topBar}>
            <PressableScale
              activeScale={0.9}
              accessibilityLabel="Cerrar"
              onPress={close}
              style={[styles.round, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Ionicons name="close" size={20} color={c.text} />
            </PressableScale>
          </View>

          {/* Brand */}
          <Animated.View entering={FadeIn.duration(260)} style={styles.brand}>
            <View style={[styles.logoTile, { backgroundColor: Brand.green, boxShadow: `0 16px 32px -16px ${Brand.green}` }]}>
              <Image
                source={require('@/assets/images/preci-mark-white.png')}
                style={{ width: 30, height: 38 }}
                contentFit="contain"
                accessibilityLabel="Preci"
              />
            </View>
            <Txt variant="display" style={styles.center}>
              Bienvenido a Preci
            </Txt>
            <Txt variant="body" color="textSecondary" style={styles.center}>
              Inicia sesión para guardar tus listas, favoritos y alertas en todos tus dispositivos.
            </Txt>
          </Animated.View>

          {/* Google */}
          <PressableScale
            onPress={google}
            disabled={pending !== null}
            accessibilityRole="button"
            style={[styles.google, { backgroundColor: c.surface, borderColor: c.border }]}>
            {pending === 'google' ? (
              <ActivityIndicator color={c.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color={c.text} />
                <Txt variant="bodyStrong">Continuar con Google</Txt>
              </>
            )}
          </PressableScale>

          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: c.border }]} />
            <Txt variant="caption" color="textTertiary">
              o con tu correo
            </Txt>
            <View style={[styles.line, { backgroundColor: c.border }]} />
          </View>

          {/* Email / password */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Txt variant="captionStrong" color="textSecondary">
                Correo electrónico
              </Txt>
              <View style={fieldStyle('email')}>
                <Ionicons name="mail-outline" size={18} color={focused === 'email' ? c.primary : c.textTertiary} />
                <TextInput
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError(null);
                  }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  placeholder="tu@correo.com"
                  placeholderTextColor={c.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  submitBehavior="submit"
                  editable={pending === null}
                  selectionColor={c.primary}
                  style={[styles.input, { color: c.text }, Platform.OS === 'web' && styles.noOutline]}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Txt variant="captionStrong" color="textSecondary">
                Contraseña
              </Txt>
              <View style={fieldStyle('password')}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focused === 'password' ? c.primary : c.textTertiary}
                />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setError(null);
                  }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={submit}
                  placeholder="••••••••"
                  placeholderTextColor={c.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  editable={pending === null}
                  selectionColor={c.primary}
                  style={[styles.input, { color: c.text }, Platform.OS === 'web' && styles.noOutline]}
                />
                <Pressable
                  hitSlop={10}
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={c.textTertiary} />
                </Pressable>
              </View>
            </View>

            {error && (
              <Animated.View
                entering={FadeIn.duration(160)}
                exiting={FadeOut.duration(120)}
                accessibilityLiveRegion="polite"
                style={[styles.error, { backgroundColor: c.dealSoft }]}>
                <Ionicons name="alert-circle" size={16} color={c.deal} />
                <Txt variant="caption" color="deal" style={styles.flex}>
                  {error}
                </Txt>
              </Animated.View>
            )}

            <PressableScale
              onPress={submit}
              disabled={!canSubmit}
              accessibilityRole="button"
              style={[
                styles.submit,
                canSubmit || pending === 'password'
                  ? { backgroundColor: c.primary, boxShadow: `0 12px 20px -12px ${c.primary}` }
                  : { backgroundColor: c.surfaceMuted },
              ]}>
              {pending === 'password' ? (
                <ActivityIndicator color={c.onPrimary} />
              ) : (
                <Txt variant="bodyStrong" style={{ color: canSubmit ? c.onPrimary : c.textTertiary }}>
                  Iniciar sesión
                </Txt>
              )}
            </PressableScale>
          </View>

          {/* Demo hint — remove when real auth exists */}
          <Pressable
            onPress={fillDemo}
            style={({ pressed }) => [styles.demo, { borderColor: c.border }, pressed && styles.pressed]}>
            <Ionicons name="flask-outline" size={14} color={c.textTertiary} />
            <Txt variant="caption" color="textTertiary" style={styles.flex}>
              Modo demo: toca para usar {DEMO_CREDENTIALS.email}
            </Txt>
          </Pressable>

          <Pressable onPress={close} hitSlop={8} style={styles.guest}>
            <Txt variant="captionStrong" color="textSecondary">
              Continuar como invitado
            </Txt>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  pressed: { opacity: 0.6 },
  noOutline: {
    // @ts-expect-error web-only style
    outlineStyle: 'none',
  },
  scroll: { flexGrow: 1 },
  inner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logoTile: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  google: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: { flex: 1, height: 1 },
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  field: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: 500,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.sm,
  },
  submit: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  guest: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
});
