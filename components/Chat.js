import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from "@react-native-async-storage/async-storage";
// import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

// import firebase from 'firebase';
// import firestore from 'firebase';
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
    constructor() {
        super();

        // firebase adding credential in order to connect to firebase
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyATwzXvTaRhh8Btvik1_emhOpOAWY8lbw8",
                authDomain: "chat-app-c9e34.firebaseapp.com",
                projectId: "chat-app-c9e34",
                storageBucket: "chat-app-c9e34.appspot.com",
                messagingSenderId: "189988602389",
                appId: "1:189988602389:web:f796804b979bff1b07441c",
                measurementId: "G-L9RNWLHC4W"
            });
        }

        // reference to the Firestore messages collection
        this.referenceChatMessages = firebase.firestore().collection('messages');

        this.state = {
            messages: [],
            uid: 0,
            user: {
                _id: '',
                name: '',
                avatar: '',
            },
            isConnected: false,
            image: null,
        };
    }

    // get messages from AsyncStorage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    // save messages on the asyncStorage
    async saveMessages() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message);
        }
    }

    // delete message from asyncStorage
    async deleteMessages() {
        try {
            await AsyncStorage.removeItem('messages');
            this.setState({
                messages: []
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    componentDidMount() {
        // get username prop from Start.js
        let { name } = this.props.route.params;
        this.props.navigation.setOptions({ title: name });

        // // tell you if you should fetch data from asyncStorage or Firestore.
        // NetInfo.fetch().then(connection => {
        //     if (connection.isConnected) {
        //         console.log('online');

        // listen to authentication events
        this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                firebase.auth().signInAnonymously();
            }

            // update user state with currently active data
            this.setState({
                uid: user.uid,
                messages: [],
                user: {
                    _id: user.uid,
                    name: name,
                    avatar: 'https://placeimg.com/140/140/any',
                },
            });

            // listens for updates in the collection
            this.unsubscribe = this.referenceChatMessages
                .orderBy("createdAt", "desc")
                .onSnapshot(this.onCollectionUpdate);

            //referencing messages of current user
            this.refMsgsUser = firebase
                .firestore()
                .collection('messages')
                .where('uid', '==', this.state.uid);
        });

        // save messages locally to AsyncStorage
        this.saveMessages();

        //     } else {
        //         this.setState({ isConnected: false });
        //         console.log('offline');
        //         this.getMessages();
        //     }
        // });

    }

    componentWillUnmount() {
        // stop listening to authentication
        this.authUnsubscribe();
        // stop listening for changes
        this.unsubscribe();
    }


    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            var data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt.toDate(),
                image: data.image || null,
                location: data.location || null,
                user: {
                    _id: data.user._id,
                    name: data.user.name,
                    avatar: data.user.avatar,
                },
            });
        });

        this.setState({
            messages: messages,
        });
    };

    /**
   * checks networkstatus of user
   * @function handleConnectivityChange
   */
    handleConnectivityChange = (state) => {
        const isConnected = state.isConnected;
        if (isConnected == true) {
            this.setState({
                isConnected: true,
            });
            this.unsubscribe = this.referenceChatMessages
                .orderBy("createdAt", "desc")
                .onSnapshot(this.onCollectionUpdate);
        } else {
            this.setState({
                isConnected: false,
            });
        }
    };

    addMessage() {
        const message = this.state.messages[0];
        // add a new message to the collection
        this.referenceChatMessages.add({
            _id: message._id,
            text: message.text || '',
            createdAt: message.createdAt,
            user: message.user,
            image: message.image || null,
            location: message.location || null,
        });
    }

    //define title in navigation bar
    static navigationOptions = ({ navigation }) => {
        return {
            title: `${navigation.state.params.userName}'s Chat`,
        };
    };

    // calback function for when user sends a message
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            this.addMessage();
            this.saveMessages();
        });
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#dbb35a',
                    },
                    left: {
                        backgroundColor: 'white',
                    },
                }}
            />
        );
    }


    // hides inputbar when offline
    renderInputToolbar = (props) => {
        console.log("renderInputToolbar --> props", props.isConnected);
        if (props.isConnected === false) {
            return <InputToolbar {...props} />
        } else {
            return <InputToolbar {...props} />;
        }
    };

    renderSystemMessage(props) {
        return <SystemMessage {...props} textStyle={{ color: '#736357' }} />;
    }

    // displays the communication features
    renderCustomActions = (props) => <CustomActions {...props} />;

    //custom map view
    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    }

    render() {
        let name = this.props.route.params.name;
        this.props.navigation.setOptions({ title: name });

        let bgColor = this.props.route.params.bgColor;

        return (
            <View style={styles.container}>
                <View
                    style={{
                        backgroundColor: bgColor,
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <GiftedChat
                        style={styles.giftedChat}
                        renderBubble={this.renderBubble.bind(this)}
                        renderSystemMessage={this.renderSystemMessage}
                        renderInputToolbar={this.renderInputToolbar.bind(this)}
                        renderActions={this.renderCustomActions}
                        renderCustomView={this.renderCustomView}
                        messages={this.state.messages}
                        isConnected={this.state.isConnected}
                        onSend={messages => this.onSend(messages)}
                        user={{
                            _id: this.state.user._id,
                            name: this.state.user.name,
                            avatar: this.state.user.avatar,

                        }}
                    />
                    {Platform.OS === 'ios' ? <KeyboardAvoidingView behavior="height" /> : null
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    giftedChat: {
        color: '#000',
    },
});
