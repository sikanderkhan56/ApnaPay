import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '@/features/auth/WelcomeScreen';
import { PhoneScreen } from '@/features/auth/PhoneScreen';
import { OtpScreen } from '@/features/auth/OtpScreen';
import { CreateMpinScreen } from '@/features/auth/CreateMpinScreen';
import { BiometricOptInScreen } from '@/features/auth/BiometricOptInScreen';
import type { AuthStackParamList } from '@/app/navigation/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Phone" component={PhoneScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="CreateMpin" component={CreateMpinScreen} />
      <Stack.Screen name="BiometricOptIn" component={BiometricOptInScreen} />
    </Stack.Navigator>
  );
}
