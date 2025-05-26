import { TouchableOpacity, Text, View } from 'react-native';

type StyledButtonProps = {
    title: string;
    icon?: React.ReactNode;
    onPress?: () => void;
};

const StyledButton = ({ title, icon, onPress }: StyledButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="bg-[#0D1821] color-white rounded-3xl w-1/2 flex-1 flex-col p-4"
    >
        <Text className="text-white text-bold font-bold text-start mb-4">{title}</Text>
        {icon && <View className="self-end">{icon}</View>}
    </TouchableOpacity>
);

export default StyledButton;
