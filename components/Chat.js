import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, SystemMessage } from 'react-native-gifted-chat';
// import firebase from 'firebase';
// import firestore from 'firebase';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            uid: 0,
            user: {
                _id: '',
                name: '',
                avatar: '',
            }
        };

        //initializing firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);

            // web app's Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyATwzXvTaRhh8Btvik1_emhOpOAWY8lbw8",
                authDomain: "chat-app-c9e34.firebaseapp.com",
                projectId: "chat-app-c9e34",
                storageBucket: "chat-app-c9e34.appspot.com",
                messagingSenderId: "189988602389",
                appId: "1:189988602389:web:f796804b979bff1b07441c",
                measurementId: "G-L9RNWLHC4W"
            };
        }

        // reference to the Firestore messages collection
        this.referenceChatMessages = firebase.firestore().collection("messages");
    }

    componentDidMount() {
        // get username prop from Start.js
        let { name } = this.props.route.params;
        this.props.navigation.setOptions({ title: name });

        // listen to authentication events
        this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                firebase.auth().signInAnonymously();
            }

            // update user state with currently active data
            this.setState({
                uid: user.uid,
                messages: [],
                text: 'Hello developer',
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
        });
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

    componentWillUnmount() {
        // stop listening to authentication
        this.authUnsubscribe();
        // stop listening for changes
        this.unsubscribe();
    }

    addMessage() {
        const message = this.state.messages[0];
        // add a new message to the collection
        this.referenceChatMessages.add({
            _id: message._id,
            text: message.text || '',
            createdAt: message.createdAt,
            user: this.state.user,
        });
    }
    // calback function for when user sends a message
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            this.addMessage();
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

    //    renderSystemMessage(props) {
    //        return <SystemMessage {...props} textStyle={{ color: '#736357' }} />;
    //    }

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
                        //                        renderSystemMessage={this.renderSystemMessage}
                        messages={this.state.messages}
                        onSend={messages => this.onSend(messages)}
                        user={{
                            _id: this.state.user._id,
                            name: this.state.name,
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
