import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';

function App() {
  const camera = useRef();
  const devices = useCameraDevices();
  const device = devices.back;

  const [showCamera, setShowCamera] = useState(false);
  const [imageSource, setImageSource] = useState('');

  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
      console.log(newCameraPermission);
      const newMicPermission = await Camera.requestMicrophonePermission();
      console.log(newMicPermission);
      requestMultiple([
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      ]).then(statuses => {
        console.log(
          'READ_EXTERNAL_STORAGE',
          statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE],
        );
        console.log(
          'WRITE_EXTERNAL_STORAGE',
          statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE],
        );
      });
    }
    getPermission();
  }, []);

  async function capturePhoto() {
    if (camera.current !== null) {
      const photo = await camera.current.takeSnapshot({
        quality: 30,
        skipMetadata: true,
      });
      setImageSource(photo.path);
      setShowCamera(false);
      savePhoto(photo.path);
      console.log(photo.path);
    }
  }
  async function savePhoto(data) {
    const filename = 'test';
    const path = `${RNFS.PicturesDirectoryPath}/${filename}.jpg`;
    const pathBase64 = `${RNFS.PicturesDirectoryPath}/${filename}-base64.txt`;
    await RNFS.copyFile(data, path);
    RNFS.readFile(path, 'base64').then(base64 => {
      RNFS.writeFile(pathBase64, base64);
      console.log(base64);
    });
  }

  if (device == null) {
    return <Text>Camera not available</Text>;
  }

  return (
    <View style={styles.container}>
      {showCamera ? (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            photo={true}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.camButton}
              onPress={() => capturePhoto()}
            />
          </View>
        </>
      ) : (
        <>
          <Button title="Launch Camera" onPress={() => setShowCamera(true)} />
          {imageSource !== '' ? (
            <Image
              style={styles.image}
              source={{
                uri: `file://'${imageSource}`,
              }}
            />
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'gray',
  },
  buttonContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: 'auto',
    aspectRatio: 9 / 16,
  },
});

export default App;
