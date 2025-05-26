import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import StyledButton from '~/components/StyledButton';
import BottomNavBar from '~/navigation/BottomNavBar';

export default function CreateStoryScreen() {
  const [prompt, setPrompt] = useState('');
  const [numPages, setNumPages] = useState(1);
  const [characters, setCharacters] = useState(['']);

  const handleAddCharacter = () => {
    if (characters.length < 5) {
      setCharacters([...characters, '']);
    }
  };

  const handleCharacterChange = (text, index) => {
    const updated = [...characters];
    updated[index] = text;
    setCharacters(updated);
  };

  const handleSubmit = () => {
    console.log({ prompt, numPages, characters });
  };

  return (
    <View className="flex-1 bg-[#F0F4EF] pt-4 px-4">
      <Text className="text-2xl font-bold pt-4">Quelle aventure</Text>
      <Text className="text-2xl font-bold pb-2">allez vous créer aujourd'hui ?</Text>
      <Text className="text-base font-light pb-4">Ici, toutes vos idées prennent vie !</Text>


      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Prompt */}
        <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
          <Text className="text-lg font-semibold mb-2">Résumé de l'histoire</Text>
          <TextInput
            className="border border-gray-400 rounded-lg p-2"
            placeholder="Ex: Une aventure magique dans les montagnes"
            value={prompt}
            onChangeText={setPrompt}
          />
        </View>

        {/* Personnages */}
        <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
          <Text className="text-lg font-semibold mb-2">Personnages (max 5)</Text>
          {characters.map((char, index) => (
            <TextInput
              key={index}
              className="border border-gray-400 rounded-lg p-2 mb-2"
              placeholder={`Personnage ${index + 1}`}
              value={char}
              onChangeText={(text) => handleCharacterChange(text, index)}
            />
          ))}


          {characters.length < 5 && (
            <TouchableOpacity
              className=" self-start bg-green-500 px-3 py-2 rounded-lg"
              onPress={handleAddCharacter}
            >
              <Text className="text-white">+ Ajouter un personnage</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* <View className="p-4 rounded-3xl bg-[#B4CDED] text-center">
          <Text className="text-lg font-semibold mb-2">Nombre de pages</Text>
          <View className="flex-row flex-wrap">
            {[...Array(10)].map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setNumPages(i + 1)}
                className={`px-3 py-1 m-1 rounded-lg border ${numPages === i + 1 ? 'bg-slate-700 border-slate-700' : 'border-gray-400'
                  }`}
              >
                <Text className={numPages === i + 1 ? 'text-white' : 'text-black'}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        <View className="gap-4 flex flex-row w-full">
          <StyledButton title="Pages" icon='+' />
          <StyledButton title="Animations" icon='+' />
        </View>

        {/* Bouton de création */}
        <TouchableOpacity
          className="bg-[#0D1821] px-4 py-3 rounded-3xl items-center mt-4"
          onPress={handleSubmit}
        >
          <Text className="text-white font-semibold text-lg">Créer mon histoire ! </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}
