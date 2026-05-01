import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PlatformBlur from '~/components/PlatformBlur';
import { useTranslation } from 'react-i18next';
import { useUpdateGroup } from '~/hooks/useUpdateGroup';
import { useDeleteGroup } from '~/hooks/useDeleteGroup';
import { useLeaveGroup } from '~/hooks/useLeaveGroup';
import Toast from 'react-native-toast-message';

type GroupCardProps = {
    group: any;
    isNight: boolean;
    onPress: () => void;
    isOwner?: boolean;
};

export default function GroupCard({ group, isNight, onPress, isOwner = false }: GroupCardProps) {
    const { t } = useTranslation();
    const memberCount = group._count?.members || 0;
    const storiesCount = group._count?.stories || 0;

    const [editVisible, setEditVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [leaveVisible, setLeaveVisible] = useState(false);
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description || '');

    const updateGroup = useUpdateGroup();
    const deleteGroup = useDeleteGroup();
    const leaveGroup = useLeaveGroup();

    const handleEdit = (e: any) => {
        e.stopPropagation();
        setName(group.name);
        setDescription(group.description || '');
        setEditVisible(true);
    };

    const handleDelete = (e: any) => {
        e.stopPropagation();
        setDeleteVisible(true);
    };

    const confirmEdit = async () => {
        try {
            await updateGroup.mutateAsync({ groupId: group.id, name, description });
            setEditVisible(false);
            Toast.show({ type: 'success', text1: t('groups.updateSuccess') });
        } catch {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('groups.updateError') });
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteGroup.mutateAsync(group.id);
            setDeleteVisible(false);
            Toast.show({ type: 'success', text1: t('groups.deleteSuccess') });
        } catch {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('groups.deleteError') });
        }
    };

    const handleLeave = (e: any) => {
        e.stopPropagation();
        setLeaveVisible(true);
    };

    const confirmLeave = async () => {
        try {
            await leaveGroup.mutateAsync(group.id);
            setLeaveVisible(false);
            Toast.show({ type: 'success', text1: t('groups.leaveSuccess') });
        } catch {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('groups.leaveError') });
        }
    };

    const inputStyle = {
        backgroundColor: isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        padding: 12,
        color: isNight ? '#fff' : '#1e293b',
        fontFamily: 'Baloo2_400Regular',
        fontSize: 16,
        marginBottom: 12,
    };

    return (
        <>
            <TouchableOpacity onPress={onPress} className="mb-3">
                <PlatformBlur
                    intensity={90}
                    tint={isNight ? "dark" : "light"}
                    className="p-4 md:p-6 rounded-2xl overflow-hidden"
                    style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
                >
                    <Text className={`${isNight ? "text-white" : "text-slate-800"} text-xl md:text-2xl font-baloo-semibold`}>
                        {group.name}
                    </Text>
                    <Text className={`${isNight ? "text-white/70" : "text-slate-600"} text-base md:text-lg font-baloo mt-1`}>
                        {group.description || t('groups.noDescription')}
                    </Text>
                    <View className="flex-row items-center justify-between mt-2 gap-4">
                        <View className="flex-row items-center gap-4">
                            <View className='flex flex-row items-center gap-1'>
                                <Feather name="users" size={14} color={isNight ? '#94a3b8' : '#64748b'} />
                                <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} text-sm md:text-base font-baloo ml-1`}>
                                    {t('groups.membersCount', { count: memberCount })}
                                </Text>
                            </View>
                            <View className='flex flex-row items-center gap-1'>
                                <Feather name="book" size={14} color={isNight ? '#94a3b8' : '#64748b'} />
                                <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} text-sm md:text-base font-baloo ml-1`}>
                                    {t('groups.storiesCount', { count: storiesCount })}
                                </Text>
                            </View>
                        </View>
                        {isOwner ? (
                            <View className="flex-row items-center gap-4">
                                <TouchableOpacity onPress={handleEdit} hitSlop={8}>
                                    <Feather name="edit-2" size={16} color={isNight ? '#94a3b8' : '#64748b'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} hitSlop={8}>
                                    <Feather name="trash-2" size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleLeave} hitSlop={8}>
                                <Feather name="log-out" size={16} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                </PlatformBlur>
            </TouchableOpacity>

            {/* Modal édition */}
            <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <PlatformBlur
                        intensity={90}
                        tint={isNight ? 'dark' : 'light'}
                        className="w-full max-w-lg rounded-3xl overflow-hidden"
                        style={{ backgroundColor: isNight ? '#1e293b' : '#fff' }}
                    >
                        <View className="bg-[#0D1821] p-6">
                            <Text className="text-white text-2xl font-baloo-bold text-center">{t('groups.editGroup')}</Text>
                        </View>
                        <View className="p-6">
                            <Text className={`${isNight ? 'text-white/70' : 'text-slate-500'} text-sm font-baloo-semibold mb-1`}>
                                {t('groups.groupName')}
                            </Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={inputStyle}
                                placeholderTextColor={isNight ? '#64748b' : '#94a3b8'}
                            />
                            <Text className={`${isNight ? 'text-white/70' : 'text-slate-500'} text-sm font-baloo-semibold mb-1`}>
                                {t('groups.groupDescription')}
                            </Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                style={{ ...inputStyle, minHeight: 80, textAlignVertical: 'top' }}
                                multiline
                                placeholderTextColor={isNight ? '#64748b' : '#94a3b8'}
                            />
                            <View className="flex-row gap-3 mt-2">
                                <TouchableOpacity
                                    className={`flex-1 py-4 rounded-xl items-center ${isNight ? 'bg-slate-700' : 'bg-gray-200'}`}
                                    onPress={() => setEditVisible(false)}
                                >
                                    <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-base`}>
                                        {t('common.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 py-4 rounded-xl items-center bg-[#0D1821]"
                                    onPress={confirmEdit}
                                    disabled={updateGroup.isPending || !name.trim()}
                                >
                                    <Text className="text-white font-baloo-semibold text-base">
                                        {t('common.save')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </PlatformBlur>
                </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Modal confirmation quitter le groupe */}
            <Modal visible={leaveVisible} transparent animationType="fade" onRequestClose={() => setLeaveVisible(false)}>
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <PlatformBlur
                        intensity={90}
                        tint={isNight ? 'dark' : 'light'}
                        className="w-full max-w-lg rounded-3xl overflow-hidden"
                        style={{ backgroundColor: isNight ? '#1e293b' : '#fff' }}
                    >
                        <View className="bg-orange-500 p-6 items-center">
                            <Feather name="log-out" size={40} color="#fff" style={{ marginBottom: 8 }} />
                            <Text className="text-white text-2xl font-baloo-bold text-center">{t('groups.leaveGroup')}</Text>
                        </View>
                        <View className="p-6">
                            <Text className={`${isNight ? 'text-white/80' : 'text-gray-600'} font-baloo text-base text-center mb-6`}>
                                {t('groups.leaveGroupConfirm', { name: group.name })}
                            </Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className={`flex-1 py-4 rounded-xl items-center ${isNight ? 'bg-slate-700' : 'bg-gray-200'}`}
                                    onPress={() => setLeaveVisible(false)}
                                >
                                    <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-base`}>
                                        {t('common.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 py-4 rounded-xl items-center bg-orange-500"
                                    onPress={confirmLeave}
                                    disabled={leaveGroup.isPending}
                                >
                                    <Text className="text-white font-baloo-semibold text-base">
                                        {t('common.confirm')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </PlatformBlur>
                </View>
            </Modal>

            {/* Modal confirmation suppression */}
            <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <PlatformBlur
                        intensity={90}
                        tint={isNight ? 'dark' : 'light'}
                        className="w-full max-w-lg rounded-3xl overflow-hidden"
                        style={{ backgroundColor: isNight ? '#1e293b' : '#fff' }}
                    >
                        <View className="bg-red-500 p-6 items-center">
                            <Feather name="alert-triangle" size={40} color="#fff" style={{ marginBottom: 8 }} />
                            <Text className="text-white text-2xl font-baloo-bold text-center">{t('groups.deleteGroup')}</Text>
                        </View>
                        <View className="p-6">
                            <Text className={`${isNight ? 'text-white/80' : 'text-gray-600'} font-baloo text-base text-center mb-6`}>
                                {t('groups.deleteGroupConfirm', { name: group.name })}
                            </Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className={`flex-1 py-4 rounded-xl items-center ${isNight ? 'bg-slate-700' : 'bg-gray-200'}`}
                                    onPress={() => setDeleteVisible(false)}
                                >
                                    <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-base`}>
                                        {t('common.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 py-4 rounded-xl items-center bg-red-500"
                                    onPress={confirmDelete}
                                    disabled={deleteGroup.isPending}
                                >
                                    <Text className="text-white font-baloo-semibold text-base">
                                        {t('common.confirm')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </PlatformBlur>
                </View>
            </Modal>
        </>
    );
}
