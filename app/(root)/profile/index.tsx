import React from 'react';
import { View, Text } from 'react-native';
import {Button} from "~/components/ui/button";
import {useAuth} from "~/app/context/auth";

const ProfileScreen: React.FC = () => {
    const {signOut} = useAuth();

    return (
        <View className="flex-1 justify-center items-center">
            <Text className="text-lg">This is the Profile screen</Text>
            <Button variant="default" onPress={() => signOut()}><Text>Logout</Text></Button>
        </View>
    );
};

export default ProfileScreen;
