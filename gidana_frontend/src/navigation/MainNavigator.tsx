import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import HomeScreen from '../screens/home/HomeScreen';
import PayServiceScreen from '../screens/payment/PayServiceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddPropertyScreen from '../screens/property/AddPropertyScreen';
import PropertyDetailScreen from '../screens/property/PropertyDetailScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import AddWalletScreen from '../screens/wallet/AddWalletScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Consistent header options with Poppins font
const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontFamily: 'Poppins-SemiBold', fontSize: 18 },
  headerShadowVisible: false,
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Explore: focused ? 'compass' : 'compass-outline',
            Favorites: focused ? 'heart' : 'heart-outline',
          };
          return <Ionicons name={(icons[route.name] ?? 'circle') as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { 
          paddingBottom: 8, 
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Accueil',
          tabBarLabel: 'Accueil',
        }} 
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ 
          title: 'Explorer',
          tabBarLabel: 'Explorer',
        }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ 
          title: 'Favoris',
          tabBarLabel: 'Favoris',
        }} 
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTIONS}>
      {/* Main Tabs - NO header */}
      <Stack.Screen name="Tabs" component={HomeTabs} options={{ headerShown: false }} />
      
      {/* Property screens */}
      <Stack.Screen 
        name="PropertyDetail" 
        component={PropertyDetailScreen} 
        options={{ 
          title: 'Détails', 
          headerTransparent: true, 
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: 'Poppins-SemiBold', color: '#fff' }
        }} 
      />
      <Stack.Screen 
        name="AddProperty" 
        component={AddPropertyScreen} 
        options={{ 
          title: 'Ajouter une propriété',
          headerTitleStyle: { fontFamily: 'Poppins-SemiBold' }
        }} 
      />
      
      {/* Payment screens (for future use) */}
      <Stack.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{ 
          title: 'Portefeuille',
          headerTitleStyle: { fontFamily: 'Poppins-SemiBold' }
        }} 
      />
      <Stack.Screen 
        name="AddWallet" 
        component={AddWalletScreen} 
        options={{ 
          title: 'Ajouter un portefeuille',
          headerTitleStyle: { fontFamily: 'Poppins-SemiBold' }
        }} 
      />
      <Stack.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
        options={{ 
          title: 'Transactions',
          headerTitleStyle: { fontFamily: 'Poppins-SemiBold' }
        }} 
      />
      <Stack.Screen 
        name="PayService" 
        component={PayServiceScreen} 
        options={{ 
          title: 'Payer un service',
          headerTitleStyle: { fontFamily: 'Poppins-SemiBold' }
        }} 
      />
      
      {/* Auth screens */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}