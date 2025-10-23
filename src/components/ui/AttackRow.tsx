/**
 * AttackRow Component - Display a natural attack with bonus and damage
 *
 * Shows attack name, attack bonus, damage, and optional special traits.
 */

import { View, Text, ViewProps, StyleSheet } from 'react-native';

export interface AttackRowProps extends Omit<ViewProps, 'style'> {
  name: string;
  bonus: string;
  damage: string;
  trait?: string;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(185, 122, 61, 0.4)', // Bronze-500/40
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#F9F5EB', // Parchment-50
    fontSize: 16,
    marginRight: 12,
  },
  bonus: {
    color: '#E8DCC8', // Parchment-200
    fontSize: 14,
  },
  damage: {
    color: '#F9F5EB', // Parchment-50
    fontSize: 16,
    marginRight: 8,
  },
  trait: {
    color: '#E8DCC8', // Parchment-200
    fontSize: 12,
  },
});

export function AttackRow({ name, bonus, damage, trait, ...props }: AttackRowProps) {
  return (
    <View style={styles.container} {...props}>
      <View style={styles.leftSection}>
        <Text style={styles.name}>
          {name}
        </Text>
        <Text style={styles.bonus}>
          {bonus}
        </Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.damage}>
          {damage}
        </Text>
        {trait && (
          <Text style={styles.trait}>
            {trait}
          </Text>
        )}
      </View>
    </View>
  );
}
