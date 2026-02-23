import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as yup from 'yup';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useReportStory, ReportReason } from '~/hooks/useReportStory';
import { useSound } from '~/context/SoundContext';

interface ReportStoryModalProps {
  visible: boolean;
  onClose: () => void;
  storyId: number;
  isNight: boolean;
}

const REPORT_MESSAGE_MAX = 200;
const reportMessageSchema = yup.string().max(REPORT_MESSAGE_MAX);

export default function ReportStoryModal({ visible, onClose, storyId, isNight }: ReportStoryModalProps) {
  const { t } = useTranslation();
  const { playSound } = useSound();
  const reportStoryMutation = useReportStory();

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const [reportMessageError, setReportMessageError] = useState<string | null>(null);

  const reportReasons: { value: ReportReason; label: string }[] = [
    { value: 'INAPPROPRIATE', label: t('report.inappropriate') },
    { value: 'OFFENSIVE', label: t('report.offensive') },
  ];

  const handleClose = () => {
    setSelectedReason(null);
    setReportMessage('');
    setReportMessageError(null);
    onClose();
  };

  const handleMessageChange = async (text: string) => {
    setReportMessage(text);
    try {
      await reportMessageSchema.validate(text);
      setReportMessageError(null);
    } catch {
      setReportMessageError(t('report.messageTooLong', { max: REPORT_MESSAGE_MAX }));
    }
  };

  const handleSubmit = () => {
    if (!selectedReason) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('click');
    reportStoryMutation.mutate(
      { storyId, reason: selectedReason, message: reportMessage || undefined },
      {
        onSuccess: () => {
          playSound('success');
          Toast.show({ type: 'success', text1: t('common.success'), text2: t('report.reportSent') });
          handleClose();
        },
        onError: (error: any) => {
          Toast.show({ type: 'error', text1: t('common.error'), text2: error?.message || t('report.reportError') });
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <BlurView
          intensity={90} tint={isNight ? 'dark' : 'light'}
          className="rounded-3xl p-6 mx-4 w-11/12 max-w-md overflow-hidden"
          style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff' }}
        >
          <View className="items-center mb-4">
            <Feather name="flag" size={32} color="#ef4444" />
            <Text className={`text-2xl font-baloo-bold ${isNight ? 'text-white' : 'text-gray-900'} mt-2`}>
              {t('report.reportStory')}
            </Text>
            <Text className={`text-center font-baloo ${isNight ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {t('report.reportDescription')}
            </Text>
          </View>

          {/* Raisons */}
          <View className="mb-4">
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedReason(reason.value); }}
                className="mb-2"
              >
                <BlurView
                  intensity={90} tint={isNight ? 'dark' : 'light'}
                  className={`p-3 rounded-xl overflow-hidden ${selectedReason === reason.value ? 'border-2 border-red-500' : ''}`}
                  style={{ backgroundColor: selectedReason === reason.value ? (isNight ? '#ef444430' : '#ef444420') : (isNight ? '#1e293b90' : '#38b6ff10') }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`font-baloo-semibold ${isNight ? 'text-white' : 'text-gray-900'}`}>{reason.label}</Text>
                    {selectedReason === reason.value && <Feather name="check-circle" size={20} color="#ef4444" />}
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>

          {/* Message optionnel */}
          <TextInput
            placeholder={t('report.messagePlaceholder')}
            placeholderTextColor={isNight ? '#64748b' : '#94a3b8'}
            value={reportMessage}
            onChangeText={handleMessageChange}
            multiline
            numberOfLines={3}
            className={`p-3 rounded-xl font-baloo ${isNight ? 'text-white' : 'text-gray-900'}`}
            style={{
              backgroundColor: isNight ? '#0f172a' : '#f1f5f9',
              textAlignVertical: 'top',
              minHeight: 80,
              borderWidth: reportMessageError ? 1 : 0,
              borderColor: '#ef4444',
            }}
          />
          <View className="flex-row justify-between items-center mb-4 mt-1 px-1">
            {reportMessageError
              ? <Text className="text-red-500 font-baloo text-xs">{reportMessageError}</Text>
              : <View />
            }
            <Text className={`font-baloo text-xs ${reportMessage.length > REPORT_MESSAGE_MAX ? 'text-red-500' : isNight ? 'text-gray-500' : 'text-gray-400'}`}>
              {reportMessage.length}/{REPORT_MESSAGE_MAX}
            </Text>
          </View>

          {/* Boutons */}
          <View className="flex-col gap-3">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selectedReason || !!reportMessageError || reportStoryMutation.isPending}
              className={`p-4 rounded-xl items-center ${!selectedReason || !!reportMessageError ? 'bg-red-300' : 'bg-red-600'}`}
            >
              <Text className="text-white font-baloo-semibold text-lg">
                {reportStoryMutation.isPending ? t('report.sending') : t('report.send')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); playSound('pop'); handleClose(); }}
              className={`${isNight ? 'bg-gray-700' : 'bg-gray-200'} p-4 rounded-xl items-center`}
            >
              <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}
