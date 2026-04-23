import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/theme';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore((s) => s.login);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!identifier || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.error ?? 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="home" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Gidana</Text>
          <Text style={styles.subtitle}>Trouvez votre logement idéal</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Email ou téléphone"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
          />
          <TextInput
            mode="outlined"
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={COLORS.primary}
          >
            Se connecter
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>
              Pas de compte ?{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Tabs')}
            style={styles.guestLink}
          >
            <Text style={styles.guestText}>Explorer sans compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logoBadge: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, 
    shadowRadius: 12, 
    elevation: 8,
  },
  title: { 
    fontSize: 28, 
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: { 
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  form: { gap: 16 },
  input: { 
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  button: { 
    marginTop: 8, 
    borderRadius: 50,
  },
  buttonContent: { 
    paddingVertical: 6,
    height: 50,
  },
  registerLink: { 
    alignItems: 'center', 
    paddingVertical: 12,
  },
  registerText: { 
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  guestLink: { 
    alignItems: 'center', 
    paddingVertical: 8,
  },
  guestText: { 
    fontFamily: 'Poppins-Regular',
    fontSize: 13, 
    color: COLORS.textLight,
    textDecorationLine: 'underline',
  },
});