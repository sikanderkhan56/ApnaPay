import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { LogoMark } from '@/shared/components/Icon';
import { colors } from '@/theme';
import { useSessionStore } from '@/store/useSessionStore';
import { AuthNavigator } from '@/app/navigation/AuthNavigator';
import { AppNavigator } from '@/app/navigation/AppNavigator';
import { UnlockScreen } from '@/features/auth/UnlockScreen';
import type { RootStackParamList } from '@/app/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Splash() {
  return (
    <View style={styles.splash}>
      <StatusBar barStyle="dark-content" />
      <LogoMark variant="lockup" size={240} />
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
}

export function RootNavigator() {
  const hydrated = useSessionStore(s => s.hydrated);
  const hydrate = useSessionStore(s => s.hydrate);
  const user = useSessionStore(s => s.user);
  const hasMpin = useSessionStore(s => s.hasMpin);
  const onboardingComplete = useSessionStore(s => s.onboardingComplete);
  const unlocked = useSessionStore(s => s.unlocked);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <Splash />;
  }

  const needsAuth = !user || !hasMpin || !onboardingComplete;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {needsAuth ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : unlocked ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Unlock" component={UnlockScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 8,
  },
});
