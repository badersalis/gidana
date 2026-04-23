import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView, StatusBar } from 'react-native';
import { Button, Checkbox, SegmentedButtons, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { propertyApi } from '../../api/properties';
import { COLORS } from '../../utils/theme';

const PROPERTY_TYPES = ['Studio', 'Appartement', 'Maison'];
const CURRENCIES = ['XOF', 'EUR', 'USD'];
const SHOWER_TYPES = ['interne', 'externe'];

export default function AddPropertyScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [country, setCountry] = useState('');
  const [propertyType, setPropertyType] = useState('Appartement');
  const [transactionType, setTransactionType] = useState('À louer');
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [surface, setSurface] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showerType, setShowerType] = useState('interne');
  const [hasWater, setHasWater] = useState(false);
  const [hasElectricity, setHasElectricity] = useState(false);
  const [hasCourtyard, setHasCourtyard] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  async function pickImages() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour ajouter des photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    
    if (!result.canceled) {
      const remainingSlots = 10 - images.length;
      const newImages = result.assets.slice(0, remainingSlots).map((a) => a.uri);
      
      if (newImages.length < result.assets.length) {
        Alert.alert('Limite atteinte', `Vous ne pouvez ajouter que ${remainingSlots} photo(s) supplémentaire(s)`);
      }
      
      setImages((prev) => [...prev, ...newImages]);
    }
  }

  async function removeImage(index: number) {
    Alert.alert(
      'Supprimer l\'image',
      'Voulez-vous vraiment supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => setImages((prev) => prev.filter((_, i) => i !== index))
        }
      ]
    );
  }

  async function handleSubmit() {
    if (!title || !neighborhood || !country || !rooms || !bathrooms || !price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (*)');
      return;
    }
    if (images.length < 3) {
      Alert.alert('Erreur', 'Minimum 3 photos requises (vous en avez ' + images.length + ')');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('neighborhood', neighborhood);
    formData.append('country', country);
    formData.append('property_type', propertyType);
    formData.append('transaction_type', transactionType);
    formData.append('rooms', rooms);
    formData.append('bathrooms', bathrooms);
    formData.append('surface', surface);
    formData.append('price', price);
    formData.append('currency', currency);
    formData.append('whatsapp_contact', whatsapp);
    formData.append('phone_contact', phone);
    formData.append('exact_address', address);
    formData.append('shower_type', showerType);
    formData.append('has_water', String(hasWater));
    formData.append('has_electricity', String(hasElectricity));
    formData.append('has_courtyard', String(hasCourtyard));

    images.forEach((uri, idx) => {
      const ext = uri.split('.').pop() ?? 'jpg';
      formData.append('images', {
        uri,
        type: `image/${ext}`,
        name: `image_${Date.now()}_${idx}.${ext}`,
      } as any);
    });

    try {
      await propertyApi.create(formData);
      Alert.alert('Succès', 'Propriété ajoutée avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.error ?? 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter une propriété</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionSubtitle}>{images.length}/10</Text>
          </View>
          <Text style={styles.sectionDescription}>Ajoutez au moins 3 photos (max 10)</Text>
          
          <View style={styles.imageGrid}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => removeImage(idx)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                  <View style={styles.removeImageBackground} />
                </TouchableOpacity>
                <View style={styles.imageNumber}>
                  <Text style={styles.imageNumberText}>{idx + 1}</Text>
                </View>
              </View>
            ))}
            {images.length < 10 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages} activeOpacity={0.7}>
                <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                <Text style={styles.addImageText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>
          <TextInput 
            mode="outlined" 
            label="Titre *" 
            value={title} 
            onChangeText={setTitle} 
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
          />
          <TextInput 
            mode="outlined" 
            label="Description" 
            value={description} 
            onChangeText={setDescription} 
            multiline 
            numberOfLines={4} 
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
          />

          <Text style={styles.label}>Type de bien</Text>
          <SegmentedButtons
            value={propertyType}
            onValueChange={setPropertyType}
            buttons={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
            style={styles.segmented}
            theme={{ colors: { primary: COLORS.primary } }}
          />

          <Text style={styles.label}>Type de transaction</Text>
          <SegmentedButtons
            value={transactionType}
            onValueChange={setTransactionType}
            buttons={[
              { value: 'À louer', label: '📍 Location' }, 
              { value: 'À vendre', label: '💰 Vente' }
            ]}
            style={styles.segmented}
            theme={{ colors: { primary: COLORS.primary } }}
          />
        </View>

        {/* Localisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation</Text>
          <TextInput 
            mode="outlined" 
            label="Quartier *" 
            value={neighborhood} 
            onChangeText={setNeighborhood} 
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="map-marker-outline" />}
          />
          <TextInput 
            mode="outlined" 
            label="Pays *" 
            value={country} 
            onChangeText={setCountry} 
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="flag-outline" />}
          />
          <TextInput 
            mode="outlined" 
            label="Adresse exacte (optionnel)" 
            value={address} 
            onChangeText={setAddress} 
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="home-outline" />}
          />
        </View>

        {/* Caractéristiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.row}>
            <TextInput 
              mode="outlined" 
              label="Pièces *" 
              value={rooms} 
              onChangeText={setRooms} 
              keyboardType="numeric" 
              style={[styles.input, styles.half]}
              outlineColor="#e9ecef"
              activeOutlineColor={COLORS.primary}
              left={<TextInput.Icon icon="door" />}
            />
            <TextInput 
              mode="outlined" 
              label="Salle de bain *" 
              value={bathrooms} 
              onChangeText={setBathrooms} 
              keyboardType="numeric" 
              style={[styles.input, styles.half]}
              outlineColor="#e9ecef"
              activeOutlineColor={COLORS.primary}
              left={<TextInput.Icon icon="water" />}
            />
          </View>
          <TextInput 
            mode="outlined" 
            label="Surface (m²)" 
            value={surface} 
            onChangeText={setSurface} 
            keyboardType="numeric" 
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="ruler" />}
          />

          <Text style={styles.label}>Type de douche</Text>
          <SegmentedButtons
            value={showerType}
            onValueChange={setShowerType}
            buttons={SHOWER_TYPES.map((t) => ({ 
              value: t, 
              label: t === 'interne' ? '🚿 Interne' : '🌳 Externe' 
            }))}
            style={styles.segmented}
            theme={{ colors: { primary: COLORS.primary } }}
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkboxItem} 
              onPress={() => setHasWater(!hasWater)}
              activeOpacity={0.7}
            >
              <Checkbox.Android 
                status={hasWater ? 'checked' : 'unchecked'} 
                color={COLORS.primary}
              />
              <Text style={styles.checkboxLabel}>💧 Eau courante</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkboxItem} 
              onPress={() => setHasElectricity(!hasElectricity)}
              activeOpacity={0.7}
            >
              <Checkbox.Android 
                status={hasElectricity ? 'checked' : 'unchecked'} 
                color={COLORS.primary}
              />
              <Text style={styles.checkboxLabel}>⚡ Électricité</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkboxItem} 
              onPress={() => setHasCourtyard(!hasCourtyard)}
              activeOpacity={0.7}
            >
              <Checkbox.Android 
                status={hasCourtyard ? 'checked' : 'unchecked'} 
                color={COLORS.primary}
              />
              <Text style={styles.checkboxLabel}>🌳 Cour</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prix et contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prix et contact</Text>
          <View style={styles.row}>
            <TextInput 
              mode="outlined" 
              label="Prix *" 
              value={price} 
              onChangeText={setPrice} 
              keyboardType="numeric" 
              style={[styles.input, styles.half]}
              outlineColor="#e9ecef"
              activeOutlineColor={COLORS.primary}
              left={<TextInput.Icon icon="cash" />}
            />
            <SegmentedButtons
              value={currency}
              onValueChange={setCurrency}
              buttons={CURRENCIES.map((c) => ({ value: c, label: c }))}
              style={[styles.segmented, styles.half]}
              theme={{ colors: { primary: COLORS.primary } }}
            />
          </View>
          <TextInput 
            mode="outlined" 
            label="WhatsApp" 
            value={whatsapp} 
            onChangeText={setWhatsapp} 
            keyboardType="phone-pad" 
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="whatsapp" />}
          />
          <TextInput 
            mode="outlined" 
            label="Téléphone" 
            value={phone} 
            onChangeText={setPhone} 
            keyboardType="phone-pad" 
            style={styles.input}
            outlineColor="#e9ecef"
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="phone" />}
          />
        </View>

        <Button
          mode="contained" 
          onPress={handleSubmit}
          loading={loading} 
          disabled={loading}
          style={styles.submitBtn} 
          contentStyle={styles.submitContent}
          buttonColor={COLORS.primary}
        >
          {loading ? 'Publication en cours...' : 'Publier la propriété'}
        </Button>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  scroll: { 
    padding: 16, 
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontFamily: 'Poppins-Bold', 
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.primary,
  },
  sectionDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginBottom: 16,
  },
  label: { 
    fontSize: 13, 
    fontFamily: 'Poppins-Medium',
    color: '#666', 
    marginBottom: 6, 
    marginTop: 8,
  },
  input: { 
    marginBottom: 12, 
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  segmented: { 
    marginBottom: 12,
  },
  row: { 
    flexDirection: 'row', 
    gap: 12,
  },
  half: { 
    flex: 1,
  },
  imageGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
  },
  imageWrapper: { 
    position: 'relative',
    width: 100,
    height: 100,
  },
  imageThumb: { 
    width: 100, 
    height: 100, 
    borderRadius: 12,
  },
  removeImage: { 
    position: 'absolute', 
    top: -8, 
    right: -8,
    zIndex: 1,
  },
  removeImageBackground: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    top: 0,
    right: 0,
  },
  imageNumber: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  imageNumberText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: COLORS.primary,
  },
  checkboxContainer: {
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  submitBtn: { 
    marginTop: 8, 
    borderRadius: 12,
  },
  submitContent: { 
    paddingVertical: 8,
    height: 50,
  },
});