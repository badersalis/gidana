import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/theme';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const register = useAuthStore((s) => s.register);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!firstName || !lastName || !identifier || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit avoir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email: identifierType === 'email' ? identifier : undefined,
        phone_number: identifierType === 'phone' ? identifier : undefined,
        password,
      });
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.error ?? 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez Gidana pour trouver votre logement idéal</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <TextInput
              mode="outlined" 
              label="Prénom" 
              value={firstName}
              onChangeText={setFirstName} 
              style={[styles.input, styles.halfInput]}
              outlineColor="#e9ecef"
              activeOutlineColor={COLORS.primary}
            />
            <TextInput
              mode="outlined" 
              label="Nom" 
              value={lastName}
              onChangeText={setLastName} 
              style={[styles.input, styles.halfInput]}
              outlineColor="#e9ecef"
              activeOutlineColor={COLORS.primary}
            />
          </View>

          <SegmentedButtons
            value={identifierType}
            onValueChange={(v) => setIdentifierType(v as any)}
            buttons={[
              { value: 'email', label: 'Email', style: { borderRadius: 12 } },
              { value: 'phone', label: 'Téléphone', style: { borderRadius: 12 } },
            ]}
            style={styles.segmented}
            theme={{ colors: { primary: COLORS.primary } }}
          />

          <TextInput
            mode="outlined"
            label={identifierType === 'email' ? 'Adresse email' : 'Téléphone (+XXXXXXXXXXX)'}
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType={identifierType === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            left={<TextInput.Icon icon={identifierType === 'email' ? 'email' : 'phone'} />}
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
          />

          <TextInput
            mode="outlined" 
            label="Mot de passe (min. 6 caractères)"
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
            onPress={handleRegister}
            loading={loading} 
            disabled={loading}
            style={styles.button} 
            contentStyle={styles.buttonContent}
            buttonColor={COLORS.primary}
          >
            S'inscrire
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Déjà un compte ?{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { flexGrow: 1, padding: 24 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 32, 
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary, 
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textLight,
    marginBottom: 32,
  },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  input: { 
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  halfInput: { flex: 1 },
  segmented: { marginBottom: 4 },
  button: { 
    marginTop: 8, 
    borderRadius: 50,
  },
  buttonContent: { 
    paddingVertical: 6,
    height: 50,
  },
  loginLink: { 
    alignItems: 'center', 
    paddingVertical: 12,
  },
  loginText: { 
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
});