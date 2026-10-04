import { AppState, Modal, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { DEMO } from '@/config/demo';
import { useSessionStore } from '@/store/useSessionStore';
import { colors, radius } from '@/theme';
import { Button } from '@/shared/components/Button';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const unlocked = useSessionStore(s => s.unlocked);
  const lock = useSessionStore(s => s.lock);
  const touch = useSessionStore(s => s.touch);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active' && useSessionStore.getState().unlocked) {
        lock();
      }
    });
    return () => sub.remove();
  }, [lock]);

  useEffect(() => {
    if (!unlocked) {
      setWarning(false);
      return;
    }

    const timer = setInterval(() => {
      const idle = Date.now() - useSessionStore.getState().lastActivityAt;
      if (idle >= DEMO.sessionTimeoutMs) {
        setWarning(false);
        lock();
      } else if (idle >= DEMO.sessionTimeoutMs - DEMO.sessionWarningMs) {
        setWarning(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lock, unlocked]);

  return (
    <View
      style={styles.fill}
      onTouchStart={() => {
        touch();
        setWarning(false);
      }}>
      {children}
      <Modal visible={warning && unlocked} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Still there?</Text>
            <Text style={styles.body}>
              For your security, ApnaPay will lock after a short period of inactivity.
            </Text>
            <Button
              label="Stay signed in"
              onPress={() => {
                touch();
                setWarning(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    gap: 12,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
