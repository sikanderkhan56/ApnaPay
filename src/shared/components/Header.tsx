import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme';
import { Icon } from '@/shared/components/Icon';

export function Header({
  title,
  onBack,
  showBack = true,
}: {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}) {
  const navigation = useNavigation();
  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable
          onPress={onBack ?? (() => navigation.goBack())}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="back" color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
