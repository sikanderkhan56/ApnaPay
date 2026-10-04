import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Circle, Polyline } from 'react-native-svg';
import { colors } from '@/theme';

export type IconName =
  | 'send'
  | 'receive'
  | 'bill'
  | 'load'
  | 'add'
  | 'history'
  | 'qr'
  | 'user'
  | 'bank'
  | 'wallet'
  | 'cnic'
  | 'card'
  | 'agent'
  | 'back'
  | 'eye'
  | 'eyeOff'
  | 'check'
  | 'lock'
  | 'shield'
  | 'phone'
  | 'home'
  | 'scan'
  | 'chevron'
  | 'fingerprint';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({ name, size = 22, color = colors.text }: Props) {
  const stroke = color;
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'send':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 12h16M13 5l7 7-7 7" {...common} />
        </Svg>
      );
    case 'receive':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M20 12H4M11 19l-7-7 7-7" {...common} />
        </Svg>
      );
    case 'bill':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M7 3h10v18l-2-1.4-3 1.4-3-1.4L7 21V3z" {...common} />
          <Path d="M9 8h6M9 12h6M9 16h3" {...common} />
        </Svg>
      );
    case 'load':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="7" y="3" width="10" height="18" rx="2" {...common} />
          <Path d="M11 6h2" {...common} />
        </Svg>
      );
    case 'add':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8" {...common} />
          <Path d="M12 8v8M8 12h8" {...common} />
        </Svg>
      );
    case 'history':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 12a8 8 0 1 0 2.3-5.6" {...common} />
          <Polyline points="4 4 4 8 8 8" {...common} />
          <Path d="M12 8v5l3 2" {...common} />
        </Svg>
      );
    case 'qr':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="4" y="4" width="6" height="6" {...common} />
          <Rect x="14" y="4" width="6" height="6" {...common} />
          <Rect x="4" y="14" width="6" height="6" {...common} />
          <Path d="M14 14h3v3h-3zM20 14v6M14 20h3" {...common} />
        </Svg>
      );
    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="8" r="3.2" {...common} />
          <Path d="M5.5 19c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" {...common} />
        </Svg>
      );
    case 'bank':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16M12 4l9 6H3l9-6z" {...common} />
        </Svg>
      );
    case 'wallet':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="6" width="18" height="13" rx="2" {...common} />
          <Path d="M3 10h18" {...common} />
          <Circle cx="17" cy="14.5" r="1" fill={stroke} />
        </Svg>
      );
    case 'cnic':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="6" width="18" height="12" rx="2" {...common} />
          <Circle cx="8" cy="12" r="2" {...common} />
          <Path d="M13 10h6M13 14h4" {...common} />
        </Svg>
      );
    case 'card':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="6" width="18" height="12" rx="2" {...common} />
          <Path d="M3 10h18" {...common} />
        </Svg>
      );
    case 'agent':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 20V9l8-5 8 5v11" {...common} />
          <Path d="M9 20v-6h6v6" {...common} />
        </Svg>
      );
    case 'back':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M15 5l-7 7 7 7" {...common} />
        </Svg>
      );
    case 'eye':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" {...common} />
          <Circle cx="12" cy="12" r="3" {...common} />
        </Svg>
      );
    case 'eyeOff':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2M9.9 5.1A11 11 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-4.2 4.8M6.1 6.1C3.7 7.9 2 12 2 12s4 7 10 7a11 11 0 0 0 4.2-.8" {...common} />
        </Svg>
      );
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 12l5 5 9-10" {...common} />
        </Svg>
      );
    case 'lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="5" y="11" width="14" height="9" rx="2" {...common} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...common} />
        </Svg>
      );
    case 'shield':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6l8-3z" {...common} />
        </Svg>
      );
    case 'phone':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="7" y="3" width="10" height="18" rx="2" {...common} />
          <Path d="M11 18h2" {...common} />
        </Svg>
      );
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 11l8-7 8 7v9H4v-9z" {...common} />
        </Svg>
      );
    case 'scan':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3M4 12h16" {...common} />
        </Svg>
      );
    case 'chevron':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M9 6l6 6-6 6" {...common} />
        </Svg>
      );
    case 'fingerprint':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3a7 7 0 0 1 7 7" {...common} />
          <Path d="M12 3a5 5 0 0 0-5 5v4" {...common} />
          <Path d="M12 7a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0" {...common} />
          <Path d="M9 11v3a6 6 0 0 0 6 6" {...common} />
          <Path d="M15 10.5V12a8 8 0 0 1-8 8" {...common} />
        </Svg>
      );
    default:
      return <View />;
  }
}

export function IconButton({
  name,
  onPress,
  color = colors.text,
  background = colors.primarySoft,
}: {
  name: IconName;
  onPress?: () => void;
  color?: string;
  background?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.iconBtn, { backgroundColor: background }]}>
      <Icon name={name} color={color} />
    </Pressable>
  );
}

export function LogoMark({
  size = 64,
  variant = 'mark',
}: {
  size?: number;
  variant?: 'mark' | 'lockup';
}) {
  return (
    <Image
      source={
        variant === 'lockup'
          ? require('../../assets/apnapay-logo.png')
          : require('../../assets/apnapay-mark.png')
      }
      accessibilityRole="image"
      accessibilityLabel="ApnaPay"
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
