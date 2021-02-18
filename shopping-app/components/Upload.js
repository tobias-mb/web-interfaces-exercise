import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import UploadForm from './UploadForm';
import OpenCloseMenuButton from './OpenCloseMenuButton';
import BigButton from './BigButton';
import SmallButton from './SmallButton';
import axios from 'axios';
import server from '../server.json';
import base64 from 'react-native-base64';

// check if it is a number
function testPriceFormat(str) {
    if ( !str || /^[0-9]*$/.test(str) || /^[0-9]*\.[0-9]{2}$/.test(str) ) {
        return (true)
    } else{
        return (false)
    }
}

// this is the uploads page
export default function Upload(props) {
    const [images, setImages] = useState([]);
    const pushImage = (image) => {
        let imagesCopy = [...images];
        imagesCopy.push(image);
        setImages(imagesCopy);
    }
    const removeImage = (id) => {
        let imagesCopy = [...images];
        imagesCopy.splice(id, 1);
        setImages(imagesCopy);
    }
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [delivery, setDelivery] = useState('');
    const [showForm, setShowForm] = useState(true);
    const toggleForm = () => {
        setShowForm( showForm => !showForm )
    }
    const [uploadInProgress, setUploadInProgress] = useState(false);

    // POST to server
    const onUpload = () => {
        // check input
        if (!title){
            alert('Please provide a title.')
            return;
        }
        if (!category){
            alert('Please set at least one category, so others can find your item.')
            return;
        }
        if (!testPriceFormat(price)) {
            alert('Please enter price as a number. Examples: 13 or 17.40')
            return;
        }
        if (uploadInProgress){
            alert('Uploading... please wait...');
            return;
        }

        // create form to send
        let postForm = new FormData();
        postForm.append('title', title);
        if(description) postForm.append('description', description);
        postForm.append('category', category);
        if(location) postForm.append('location', location);
        if(price) postForm.append('price', price);
        if(delivery) postForm.append('delivery', delivery);
        images.map(image => {
            const fileNameSplit = image.split('/');
            const fileName = fileNameSplit[fileNameSplit.length - 1];
            postForm.append('images', {
                uri: image,
                name: fileName,
                type: 'image/jpeg'
            });
        });
        
        // because auth field isn't working in stupid axios. Try workarounds...
        const authHeader = 'Basic ' + base64.encode(`${props.user.username}:${props.user.password}`);
        // send POST request to server with axios
        setUploadInProgress(true);
        axios({
            method: 'post',
            url: server.address + '/products',
            data: postForm,
            headers: { 
                'Content-Type': 'multipart/form-data',
                'Authorization': authHeader
            }
            })
            .then(function (response) {
                //handle success
                console.log(response.data);
                Alert.alert(
                    "Success",
                    "Your item is now saved in the server.",
                    [
                      { text: "OK", onPress: () => console.log('ok pressed') },
                    ],
                    { cancelable: false }
                )
            })
            .catch(function (response) {
                //handle error
                console.log(response);
                alert('Upload failed.');
            })
            .finally(function () {
                setUploadInProgress(false);
            });
    }

    const createOnUploadAlert = () => {
        if(!props.user.username){
            alert('Please log in first.');
            return;
        }
        Alert.alert(
            "Upload Item",
            "Are you sure?",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Upload Canceled"),
                style: "cancel"
              },
              { text: "Yes", onPress: onUpload }
            ],
            { cancelable: false }
        );
    }
    

    // pick images from smartphone
    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if ( !permissionResult.granted ) {
            alert("Sorry! Permission to access camera roll is required!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        console.log(result);
    
        if (!result.cancelled) {
            pushImage(result.uri);
        }
    };

    return (
        <View style={styles.container} >
            <View style = {styles.topBar} >
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = { createOnUploadAlert }>
                    <Ionicons name="cloud-upload-outline" size={40} color="blue"  />
                </TouchableOpacity>
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = {() => props.setRoute('/main')}>
                    <Ionicons name="search-outline" size={40} color="blue"  />
                </TouchableOpacity>
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = {() => props.setRoute('/account') }>
                    <Ionicons name="person-outline" size={40} color="blue"  />
                </TouchableOpacity>
            </View>
            <Text style={styles.title} >Post your own item</Text>
            {(props.user.username)? <>
                <OpenCloseMenuButton
                    open = {showForm}
                    toggle = {toggleForm}
                />
                { (showForm &&<UploadForm
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    category={category}
                    setCategory={setCategory}
                    location={location}
                    setLocation={setLocation}
                    price={price}
                    setPrice={setPrice}
                    delivery={delivery}
                    setDelivery={setDelivery}
                /> )
                }
                <View style={styles.imageButtons} >
                    <SmallButton onPress={ pickImage } >Add an image</SmallButton>
                    <SmallButton onPress={ ()=>setImages([]) } >Remove Images</SmallButton>
                </View>
                <View style = {styles.imageList} >
                    {images.map( (image, index) =>
                        <TouchableOpacity onPress = { () => removeImage(index) }
                                          key={index}>
                            <Image
                                source={{ uri: image }}
                                style={{ width: 120, height: 90 }}
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.buttonWrapper} >
                    <BigButton onPress = { createOnUploadAlert } >
                        Upload
                    </BigButton>
                </View>
            </> : <>
                <Text>You must be logged in to upload items.</Text>
                <BigButton onPress={ () => props.setRoute('/account') } >To Log In</BigButton>
            </>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    topBar: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: 'silver',
        justifyContent: 'space-around',
    },
    buttonLeftRightPadding:{
        paddingLeft: 20,
        paddingRight: 20,
    },
    imageList:{
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    title:{
        fontSize: 24,
        fontWeight: 'bold',
    },
    buttonWrapper:{
        marginTop: 10,
        width: '75%',
    },
    imageButtons:{
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
});