import {
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  statusBar?: 'light' | 'dark';
};

export function Screen({ children, scroll, padded = true, style, statusBar = 'dark' }: Props) {
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={[
        styles.body,
        padded ? styles.padded : null,
        padded ? { paddingBottom: insets.bottom + 16, paddingTop: insets.top + 4 } : null,
        style,
      ]}>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.root} behavior="height">
      <StatusBar barStyle={statusBar === 'light' ? 'light-content' : 'dark-content'} />
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: 20,
  },
  scroll: {
    flexGrow: 1,
  },
});
