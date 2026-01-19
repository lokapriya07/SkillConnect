import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

interface VerificationBadgeProps {
  status?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge = ({ status, size = 'md' }: VerificationBadgeProps) => {
  if (status !== 'verified') return null;

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  return (
    <View style={styles.container}>
      <ShieldCheck size={iconSize} color="#2563eb" fill="#dbeafe" />
      <Text style={[styles.text, styles[size]]}>Verified</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    color: '#2563eb',
    fontWeight: '600',
  },
  sm: { fontSize: 10 },
  md: { fontSize: 12 },
  lg: { fontSize: 14 },
});