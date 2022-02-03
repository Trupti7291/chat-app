import React from 'react';
import { Image, Button, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions'
import * as Location from 'expo-location'

export default class ActionSheet extends React.Component {

    state = {
        image: null,
        location: null
    }

    pickImage = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status === 'granted') {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'Images',
            }).catch(error => console.log(error));

            if (!result.cancelled) {
                this.setState({
                    image: result
                });
            }

        }
    }

    takePhoto = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
        if (status === 'granted') {
            let result = await ImagePicker.launchCameraAsync().catch(error => console.log(error));

            if (!result.cancelled) {
                this.setState({
                    image: result
                });
            }
        }
    }

    getLocation = async () => {
        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            let result = await Location.getCurrentPositionAsync({}).catch(error => console.log(error));

            if (result) {
                this.setState({
                    location: result
                });
            }
        }
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Button
                    title="Pick an image from the library"
                    onPress={this.pickImage}
                />

                <Button
                    title="Take a photo"
                    onPress={this.takePhoto}
                />

                {this.state.image &&
                    <Image source={{ uri: this.state.image.uri }} style={{ width: 200, height: 200 }} />}

                <Button
                    title="Get my location"
                    onPress={this.getLocation}
                />

                {this.state.location &&
                    <MapView
                        style={{ width: 300, height: 200 }}
                        region={{
                            latitude: this.state.location.coords.latitude,
                            longitude: this.state.location.coords.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    />}
            </View>
        );
    }
}