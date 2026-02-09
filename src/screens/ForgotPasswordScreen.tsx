import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import { api } from '~/services/api';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { mapApiError } from '~/utils/errorMapper';
import LottieView from 'lottie-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import { useAuth } from '~/context/AuthContext';

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Refs pour les inputs du code
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown pour renvoyer le code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.emailRequired'),
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.forgotPassword(email.trim().toLowerCase());
      Toast.show({
        type: 'success',
        text1: t('forgotPassword.codeSent'),
        text2: t('forgotPassword.checkEmail'),
        props: { emoji: '📧' },
      });
      setStep('code');
      setCountdown(60);
    } catch (error: any) {
      // Si c'est un utilisateur OAuth
      if (error?.data?.code === 'OAUTH_USER') {
        Toast.show({
          type: 'info',
          text1: t('common.information'),
          text2: t('forgotPassword.oauthUser'),
          props: { emoji: 'ℹ️' },
        });
      } else {
        // On affiche quand même le message de succès (sécurité)
        Toast.show({
          type: 'success',
          text1: t('forgotPassword.codeSent'),
          text2: t('forgotPassword.checkEmail'),
          props: { emoji: '📧' },
        });
        setStep('code');
        setCountdown(60);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    // Accepter seulement les chiffres
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus sur l'input suivant
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Si tous les chiffres sont remplis, vérifier automatiquement
    if (value && index === 5 && newCode.every((c) => c !== '')) {
      Keyboard.dismiss();
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeString?: string) => {
    const codeToVerify = codeString || code.join('');
    if (codeToVerify.length !== 6) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('forgotPassword.codeRequired'),
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.verifyResetCode(email.trim().toLowerCase(), codeToVerify);
      Toast.show({
        type: 'success',
        text1: t('forgotPassword.codeValid'),
        text2: t('forgotPassword.enterNewPassword'),
        props: { emoji: '✅' },
      });
      setStep('password');
    } catch (error: any) {
      if (error?.data?.code === 'CODE_EXPIRED') {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('forgotPassword.codeExpired'),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('forgotPassword.codeInvalid'),
        });
      }
      // Reset le code
      setCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.passwordMinLength'),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.passwordMismatch'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.resetPassword(
        email.trim().toLowerCase(),
        code.join(''),
        newPassword
      );

      Toast.show({
        type: 'success',
        text1: t('forgotPassword.success'),
        text2: t('forgotPassword.passwordChanged'),
        props: { emoji: '🔑' },
      });

      // Si le backend renvoie des tokens, connecter l'utilisateur automatiquement
      if (result.accessToken && result.refreshToken) {
        await login(result.accessToken, result.refreshToken);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          })
        );
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: mapApiError(error, t),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    await handleSendCode();
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center mb-6 gap-2">
      {['email', 'code', 'password'].map((s, index) => (
        <View
          key={s}
          className={`h-2 rounded-full ${
            step === s
              ? 'w-8 bg-[#38b6ff]'
              : index < ['email', 'code', 'password'].indexOf(step)
              ? 'w-2 bg-[#38b6ff]'
              : 'w-2 bg-gray-300'
          }`}
        />
      ))}
    </View>
  );

  const renderEmailStep = () => (
    <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(200)}>
      <View className="items-center mb-6">
        <View className="w-20 h-20 bg-[#38b6ff]/20 rounded-full items-center justify-center mb-4">
          <Feather name="mail" size={40} color="#38b6ff" />
        </View>
        <Text className="text-2xl font-baloo-bold text-gray-800 text-center">
          {t('forgotPassword.title')}
        </Text>
        <Text className="text-gray-500 font-baloo text-center mt-2">
          {t('forgotPassword.emailDescription')}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-baloo-medium mb-1 ml-1">{t('auth.email')}</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-xl p-4"
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor="#6B7280"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity
        className={`${isLoading ? 'bg-gray-400' : 'bg-[#38b6ff]'} rounded-xl h-14 justify-center items-center mb-4`}
        onPress={handleSendCode}
        disabled={isLoading}
      >
        {isLoading ? (
          <LottieView
            source={require('../../assets/animations/LoadingWhite.json')}
            autoPlay
            loop
            style={{ width: 100, height: 100 }}
          />
        ) : (
          <Text className="text-white text-lg font-baloo-semibold">{t('forgotPassword.sendCode')}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCodeStep = () => (
    <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(200)}>
      <View className="items-center mb-6">
        <View className="w-20 h-20 bg-[#38b6ff]/20 rounded-full items-center justify-center mb-4">
          <Feather name="shield" size={40} color="#38b6ff" />
        </View>
        <Text className="text-2xl font-baloo-bold text-gray-800 text-center">
          {t('forgotPassword.enterCode')}
        </Text>
        <Text className="text-gray-500 font-baloo text-center mt-2">
          {t('forgotPassword.codeDescription', { email })}
        </Text>
      </View>

      {/* Code inputs */}
      <View className="flex-row justify-between mb-6 px-2">
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (codeInputRefs.current[index] = ref)}
            className={`w-12 h-14 border-2 rounded-xl text-center text-2xl font-baloo-bold ${
              digit ? 'border-[#38b6ff] bg-[#38b6ff]/10' : 'border-gray-300'
            }`}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(value) => handleCodeChange(value, index)}
            onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        className={`${isLoading ? 'bg-gray-400' : 'bg-[#38b6ff]'} rounded-xl h-14 justify-center items-center mb-4`}
        onPress={() => handleVerifyCode()}
        disabled={isLoading}
      >
        {isLoading ? (
          <LottieView
            source={require('../../assets/animations/LoadingWhite.json')}
            autoPlay
            loop
            style={{ width: 100, height: 100 }}
          />
        ) : (
          <Text className="text-white text-lg font-baloo-semibold">{t('forgotPassword.verify')}</Text>
        )}
      </TouchableOpacity>

      {/* Resend code */}
      <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0}>
        <Text className={`text-center font-baloo ${countdown > 0 ? 'text-gray-400' : 'text-[#38b6ff]'}`}>
          {countdown > 0
            ? t('forgotPassword.resendIn', { seconds: countdown })
            : t('forgotPassword.resendCode')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPasswordStep = () => (
    <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(200)}>
      <View className="items-center mb-6">
        <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-4">
          <Feather name="lock" size={40} color="#22c55e" />
        </View>
        <Text className="text-2xl font-baloo-bold text-gray-800 text-center">
          {t('forgotPassword.newPassword')}
        </Text>
        <Text className="text-gray-500 font-baloo text-center mt-2">
          {t('forgotPassword.passwordDescription')}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-baloo-medium mb-1 ml-1">{t('auth.password')}</Text>
        <View className="relative">
          <TextInput
            className="w-full border border-gray-300 rounded-xl p-4 pr-12"
            placeholder={t('forgotPassword.newPasswordPlaceholder')}
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-baloo-medium mb-1 ml-1">{t('auth.confirmPassword')}</Text>
        <View className="relative">
          <TextInput
            className="w-full border border-gray-300 rounded-xl p-4 pr-12"
            placeholder={t('auth.confirmPasswordPlaceholder')}
            placeholderTextColor="#6B7280"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className={`${isLoading ? 'bg-gray-400' : 'bg-green-500'} rounded-xl h-14 justify-center items-center mb-4`}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <LottieView
            source={require('../../assets/animations/LoadingWhite.json')}
            autoPlay
            loop
            style={{ width: 100, height: 100 }}
          />
        ) : (
          <Text className="text-white text-lg font-baloo-semibold">{t('forgotPassword.resetPassword')}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#87CEEB]"
    >
      <View className="flex-1 justify-center items-center px-6">
        {/* Back button */}
        <TouchableOpacity
          className="absolute top-12 left-4 z-50 p-2"
          onPress={() => {
            if (step === 'email') {
              navigation.goBack();
            } else if (step === 'code') {
              setStep('email');
            } else {
              setStep('code');
            }
          }}
        >
          <Feather name="arrow-left" size={28} color="#1f2937" />
        </TouchableOpacity>

        <View className="w-[160%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
          <View className="w-[60%]">
            {renderStepIndicator()}
            {step === 'email' && renderEmailStep()}
            {step === 'code' && renderCodeStep()}
            {step === 'password' && renderPasswordStep()}

            {step === 'email' && (
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-[#38b6ff] text-center font-baloo mt-2">
                  {t('forgotPassword.backToLogin')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
