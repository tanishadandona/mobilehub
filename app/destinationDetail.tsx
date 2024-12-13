import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { auth, firestore } from './(auth)/config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Destination } from '../navigation/types';
import firebase from 'firebase/compat/app';

const { width } = Dimensions.get('window');

const DestinationDetailScreen: React.FC = () => {
  const { destination } = useLocalSearchParams();
  const [parsedDestination, setParsedDestination] = useState<Destination | null>(null);
  const [tips, setTips] = useState<any[]>([]);
  const [newTip, setNewTip] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState<boolean>(true);
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    if (destination) {
      try {
        const parsedData = JSON.parse(destination as string) as Destination;
        setParsedDestination(parsedData);
      } catch (error) {
        Alert.alert('Error', 'Invalid destination data.');
      }
    }
  }, [destination]);

  useEffect(() => {
    if (parsedDestination) {
      const fetchTips = async () => {
        try {
          const snapshot = await firestore
            .collection('destinations')
            .doc(parsedDestination.id)
            .collection('tips')
            .orderBy('timestamp', 'desc')
            .get();
          const fetchedTips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTips(fetchedTips);
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch tips.');
        } finally {
          setLoadingTips(false);
        }
      };

      const fetchReactions = async () => {
        const reactionDoc = await firestore
          .collection('destinations')
          .doc(parsedDestination.id)
          .get();
        if (reactionDoc.exists) {
          const { likes = 0, dislikes = 0 } = reactionDoc.data() as any;
          setLikes(likes);
          setDislikes(dislikes);
        }

        const userReactionDoc = await firestore
          .collection('destinations')
          .doc(parsedDestination.id)
          .collection('reactions')
          .doc(auth.currentUser?.uid)
          .get();
        if (userReactionDoc.exists) {
          const userReactionData = userReactionDoc.data();
          setUserReaction(userReactionData?.reaction || null);
        }
      };

      fetchTips();
      fetchReactions();
    }
  }, [parsedDestination]);

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (!parsedDestination) return;

    const destinationDocRef = firestore
      .collection('destinations')
      .doc(parsedDestination.id);
    const userReactionDocRef = destinationDocRef
      .collection('reactions')
      .doc(auth.currentUser?.uid);

    try {
      await firestore.runTransaction(async (transaction) => {
        const destinationDoc = await transaction.get(destinationDocRef);
        if (!destinationDoc.exists) return;

        const userReactionDoc = await transaction.get(userReactionDocRef);

        if (userReactionDoc.exists) {
          const existingReaction = userReactionDoc.data()?.reaction;

          if (existingReaction === reaction) {
            transaction.update(destinationDocRef, {
              [reaction === 'like' ? 'likes' : 'dislikes']: firebase.firestore.FieldValue.increment(-1),
            });
            transaction.delete(userReactionDocRef);
            if (reaction === 'like') setLikes(likes - 1);
            else setDislikes(dislikes - 1);
            setUserReaction(null);
          } else {
            transaction.update(destinationDocRef, {
              likes: reaction === 'like' ? firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(-1),
              dislikes: reaction === 'dislike' ? firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(-1),
            });
            transaction.update(userReactionDocRef, { reaction });
            if (reaction === 'like') {
              setLikes(likes + 1);
              setDislikes(dislikes - 1);
            } else {
              setDislikes(dislikes + 1);
              setLikes(likes - 1);
            }
            setUserReaction(reaction);
          }
        } else {
          transaction.update(destinationDocRef, {
            [reaction === 'like' ? 'likes' : 'dislikes']: firebase.firestore.FieldValue.increment(1),
          });
          transaction.set(userReactionDocRef, { reaction });
          if (reaction === 'like') setLikes(likes + 1);
          else setDislikes(dislikes + 1);
          setUserReaction(reaction);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update reaction.');
    }
  };

  const handleAddTip = async () => {
    if (newTip.trim() === '') {
      Alert.alert('Error', 'Tip cannot be empty.');
      return;
    }

    try {
      const tip = {
        text: newTip,
        userId: auth.currentUser?.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await firestore.collection('destinations').doc(parsedDestination?.id).collection('tips').add(tip);
      setNewTip('');
      const snapshot = await firestore
        .collection('destinations')
        .doc(parsedDestination?.id)
        .collection('tips')
        .orderBy('timestamp', 'desc')
        .get();
      const updatedTips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTips(updatedTips);
    } catch (error) {
      Alert.alert('Error', 'Failed to add tip.');
    }
  };

  const handleDeleteTip = async (tipId: string) => {
    try {
      await firestore.collection('destinations').doc(parsedDestination?.id).collection('tips').doc(tipId).delete();
      const snapshot = await firestore
        .collection('destinations')
        .doc(parsedDestination?.id)
        .collection('tips')
        .orderBy('timestamp', 'desc')
        .get();
      const updatedTips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTips(updatedTips);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete tip.');
    }
  };

  if (!parsedDestination) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load destination details.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View key={item.id} style={styles.tipContainer}>
      <Text style={styles.tipText}>{item.text}</Text>
      {item.userId === auth.currentUser?.uid && (
        <TouchableOpacity onPress={() => handleDeleteTip(item.id)}>
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        style={styles.container}
        data={tips}
        ListHeaderComponent={
          <>
            <Image source={{ uri: parsedDestination.imageUrl }} style={styles.image} />
            <View style={styles.reactionContainer}>
              <TouchableOpacity
                style={[styles.reactionButton, userReaction === 'like' && styles.activeReaction]}
                onPress={() => handleReaction('like')}
              >
                <Ionicons
                  name="thumbs-up"
                  size={24}
                  color={userReaction === 'like' ? '#007AFF' : '#888'}
                />
                <Text style={styles.reactionText}>{likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reactionButton, userReaction === 'dislike' && styles.activeReaction]}
                onPress={() => handleReaction('dislike')}
              >
                <Ionicons
                  name="thumbs-down"
                  size={24}
                  color={userReaction === 'dislike' ? '#FF3B30' : '#888'}
                />
                <Text style={styles.reactionText}>{dislikes}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{parsedDestination.name}</Text>
            <Text style={styles.description}>{parsedDestination.description}</Text>
            <Text style={styles.subTitle}>How to Reach</Text>
            <Text style={styles.description}>{parsedDestination.howToReach}</Text>
            <Text style={styles.subTitle}>General Tips</Text>
            <Text style={styles.description}>{parsedDestination.tips}</Text>
            <Text style={styles.subTitle}>User Tips</Text>
            {loadingTips ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : tips.length === 0 ? (
              <Text style={styles.noTipsText}>No tips available yet. Be the first to add one!</Text>
            ) : null}
          </>
        }
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListFooterComponent={
          <View style={styles.tipInputContainer}>
            <TextInput
              style={styles.tipInput}
              placeholder="Leave a tip..."
              placeholderTextColor="#888"
              value={newTip}
              onChangeText={setNewTip}
            />
            <TouchableOpacity style={styles.addTipButton} onPress={handleAddTip}>
              <Text style={styles.addTipButtonText}>Add Tip</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 5,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  reactionText: {
    fontSize: 16,
    marginLeft: 5,
  },
  activeReaction: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  noTipsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  tipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  tipInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  addTipButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addTipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    elevation: 2,
  },
  tipText: {
    fontSize: 16,
    flex: 1,
  },
});

export default DestinationDetailScreen;
