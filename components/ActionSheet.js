import React from 'react';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase';
import { firestore } from 'firebase';
import { ActionSheetIOS } from 'react-native';


export default class ActionSheet extends React.Component {

    render() {
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Button
                title="Pick an image from the library"
                onPress={this.pickImage}
            />

            <Button
                title="Take a photo"
                onPress={this.takePhoto}
            />
        </View>
    }

}