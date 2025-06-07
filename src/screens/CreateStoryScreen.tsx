import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Image } from 'react-native';
import StyledButton from '~/components/StyledButton';
import BottomNavBar from '~/navigation/BottomNavBar';

type StoryPage = {
  page: number;
  text: string;
  imageUrl: string;
};



export default function CreateStoryScreen() {
  const [prompt, setPrompt] = useState('');
  const [numPages, setNumPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [title, setTitle] = useState('');
  const profileId = 3; // en dur pour l’instant

  // const [characters, setCharacters] = useState(['']);

  // const handleAddCharacter = () => {
  //   if (characters.length < 5) {
  //     setCharacters([...characters, '']);
  //   }
  // };

  // const handleCharacterChange = (text, index) => {
  //   const updated = [...characters];
  //   updated[index] = text;
  //   setCharacters(updated);
  // };

  // const handleSubmit = () => {
  //   console.log({ prompt, numPages });
  // };

  const handleSubmit = async () => {
    setLoading(true);
    setStoryPages([]);
    try {
      const response = await fetch('http://localhost:3000/story/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          numberOfPages: numPages,
          title,
          profileId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l’histoire');
      }

      const story = await response.json();
      console.log('Histoire générée:', story);

      // Optionnel : naviguer vers un écran de résultat
      // navigation.navigate('StoryResult', { story });

    } catch (error) {
      console.error('Erreur côté front:', error);
      alert('Erreur lors de la création de l’histoire.');
    }
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

        <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
          <Text className="text-lg font-semibold mb-2">Titre de l’histoire</Text>
          <TextInput
            className="border border-gray-400 rounded-lg p-2"
            placeholder="Ex: Pacha et la forêt magique"
            value={title}
            onChangeText={setTitle}
          />
        </View>


        {/* Personnages */}
        {/* <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
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
        </View> */}

        <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
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
        </View>

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
      {/* === Modal de chargement + résultat === */}
      <Modal visible={loading || storyPages.length > 0} animationType="slide">
        <View className="flex-1 bg-white p-4">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#0D1821" />
              <Text className="mt-4 text-lg font-semibold">Génération en cours...</Text>
            </View>
          ) : (
            <ScrollView>
              <Text className="text-xl font-bold mb-4 text-center">✨ Voici votre histoire !</Text>
              {storyPages.map((page, index) => (
                <View key={index} className="mb-6">
                  <Text className="font-bold mb-2">Page {page.page}</Text>
                  <Image
                    source={{ uri: page.imageUrl }}
                    style={{ width: '100%', height: 200, borderRadius: 16 }}
                    resizeMode="cover"
                  />
                  <Text className="mt-2 text-base">{page.text}</Text>
                </View>
              ))}
              <TouchableOpacity
                className="mt-4 bg-black px-4 py-3 rounded-3xl items-center"
                onPress={() => setStoryPages([])} // fermer modal
              >
                <Text className="text-white font-semibold text-lg">Fermer</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      <BottomNavBar />
    </View>
  );
}
