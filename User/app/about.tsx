import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/lib/store';

const AboutApp = () => {
    const darkMode = useAppStore((state) => state.darkMode);
    const styles = getStyles(darkMode);

    return (
        <View style={styles.container}>
            <View style={styles.logoSection}>
                <View style={styles.logoPlaceholder}>
                    <Ionicons name="flash" size={50} color="white" />
                </View>
                <Text style={styles.appName}>SkillConnect</Text>
                <Text style={styles.version}>Version 1.0.4 (Stable)</Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.aboutText}>
                    Connecting the world's best professionals with local needs. We provide high-quality,
                    verified home services at the touch of a button.
                </Text>

                <View style={styles.divider} />

                <Text style={styles.linkText}>Terms of Service</Text>
                <Text style={styles.linkText}>Privacy Policy</Text>
                <Text style={styles.linkText}>Open Source Licenses</Text>
            </View>

            <Text style={styles.footer}>Made with ❤️ in India</Text>
        </View>
    );
};

const getStyles = (darkMode: boolean) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: darkMode ? Colors.backgroundDark : Colors.white, 
        alignItems: 'center', 
        padding: 40 
    },
    logoSection: { alignItems: 'center', marginTop: 60 },
    logoPlaceholder: { 
        width: 100, 
        height: 100, 
        backgroundColor: Colors.primary, 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    appName: { fontSize: 26, fontWeight: '800', color: darkMode ? Colors.textDark : Colors.text },
    version: { color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary, marginTop: 5 },
    infoSection: { marginTop: 40, width: '100%' },
    aboutText: { 
        textAlign: 'center', 
        lineHeight: 22, 
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary, 
        fontSize: 15 
    },
    divider: { height: 1, backgroundColor: darkMode ? Colors.borderDark : Colors.border, marginVertical: 30 },
    linkText: { 
        fontSize: 16, 
        color: Colors.primary, 
        fontWeight: '600', 
        marginBottom: 20, 
        textAlign: 'center' 
    },
    footer: { 
        position: 'absolute', 
        bottom: 40, 
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary, 
        fontSize: 12 
    }
});

export default AboutApp;
