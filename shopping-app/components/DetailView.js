import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, TextInput } from 'react-native'
import BigButton from './BigButton';
import SmallButton from './SmallButton';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import server from '../server.json';
import base64 from 'react-native-base64';
import * as ImagePicker from 'expo-image-picker';

// check if it is a number
function testPriceFormat(str) {
    if ( !str || /^[0-9]*$/.test(str) || /^[0-9]*\.[0-9]{2}$/.test(str) ) {
        return (true)
    } else{
        return (false)
    }
}

/** the detail View. gets the correct item in props
 * It's bloated, since it can also switch to Item editing mode. 
 * I should export some of those functions probably... */
export default function DetailView(props) {
    const [loadingResults, setLoadingResults] = useState(false);
    const [bigImage, setBigImage] = useState(-1);
    const [editMode, setEditMode] = useState(false);
    const toggleEditMode = () => {
        setEditMode(editMode => ! editMode);
    }
    const [titleField, setTitleField] = useState(props.title);
    const [descriptionField, setDescriptionField] = useState(props.description);
    const [categoryField, setCategoryField] = useState(props.category);
    const [priceField, setPriceField] = useState(props.price);
    const [deliveryField, setDeliveryField] = useState(props.delivery);
    const [locationField, setLocationField] = useState(props.location);
    const [newImages, setNewImages] = useState(props.images);
    const pushImage = (image) => {
        let imagesCopy = [...newImages];
        imagesCopy.push(image);
        setNewImages(imagesCopy);
        setImageChange(true);
    }
    const removeImage = (id) => {
        let imagesCopy = [...newImages];
        imagesCopy.splice(id, 1);
        setNewImages(imagesCopy);
        setImageChange(true);
    }
    const [imageChange, setImageChange] = useState(false);

    // PUT (update item) to server
    const onUpload = () => {
        // check input
        if (!titleField){
            alert('Please provide a title.')
            return;
        }
        if (!categoryField){
            alert('Please set at least one category, so others can find your item.')
            return;
        }
        if (!testPriceFormat(priceField)) {
            console.log('priceField is: '+ priceField)
            alert('Please enter price as a number. Examples: 13 or 17.40')
            return;
        }
        if (loadingResults){
            alert('Uploading... please wait...');
            return;
        }

        // create form to send
        let postForm = new FormData();
        if(titleField != props.title) postForm.append('title', titleField);
        if(descriptionField != props.description) postForm.append('description', descriptionField);
        if(categoryField != props.category) postForm.append('category', categoryField);
        if(locationField != props.location) postForm.append('location', locationField);
        if(priceField && priceField != props.price) postForm.append('price', priceField); // extra check, since server can't handle empty string here
        if(deliveryField != props.delivery) postForm.append('delivery', deliveryField);
        if(imageChange) newImages.map(image => {
            const fileNameSplit = image.split('/');
            const fileName = fileNameSplit[fileNameSplit.length - 1];
            postForm.append('images', {
                uri: image,
                name: fileName,
                type: 'image/jpeg'
            });
        });
        
        // auth header.
        const authHeader = 'Basic ' + base64.encode(`${props.user.username}:${props.user.password}`);
        console.log(server.address + '/products/'+ props.id)
        // send PUT request to server with axios
        setLoadingResults(true);
        axios({
            method: 'put',
            url: server.address + '/products/'+ props.id,
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
                    "Your changes are now saved in the server.",
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
                setLoadingResults(false);
                props.backToMain();
            });
    }

    const createOnUploadAlert = () =>
    Alert.alert(
      "Change Item",
      "Are you sure?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Update Canceled"),
          style: "cancel"
        },
        { text: "Yes", onPress: onUpload }
      ],
      { cancelable: false }
    );

    // delete item -> DELETE \products\:id
    const deleteItemFromServer = () => {
        if (loadingResults) {
            alert('Please be patient...');
            return;
        }
        // authHeader
        const authHeader = 'Basic ' + base64.encode(`${props.user.username}:${props.user.password}`);
        setLoadingResults(true);
        axios({
            method: 'delete',
            url: server.address + '/products/'+ props.id,
            headers: { 
                'Authorization': authHeader
            }
            })
            .then(function (response) {
                //handle success
                console.log(response.data);
                Alert.alert(
                    "Success",
                    "Your item was deleted from the server.",
                    [
                      { text: "OK", onPress: () => console.log('ok pressed') },
                    ],
                    { cancelable: false }
                )
            })
            .catch(function (response) {
                //handle error
                console.log(response);
                alert('Something went wrong.');
            })
            .finally(function () {
                setLoadingResults(false);
                props.backToMain();
            });
    }

    const createOnDeleteAlert = () =>
    Alert.alert(
      "Delete Item",
      "Are you sure?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete Canceled"),
          style: "cancel"
        },
        { text: "Yes", onPress: deleteItemFromServer }
      ],
      { cancelable: false }
    );

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
            <TouchableOpacity style={{alignSelf: 'flex-start'}}
                              onPress = { !editMode? () => props.setRoute('/main') : toggleEditMode } >
                <Ionicons name="arrow-back-outline" size={40} color={'blue'} />
            </TouchableOpacity>
            {(editMode)?
                <TextInput style={[styles.inputField, styles.title]} value={titleField} onChangeText={text => setTitleField(text)} />
            :
                <Text style={styles.title} >{props.title}</Text>
            }
            {(bigImage >= 0 && !editMode &&
                <TouchableOpacity onPress = { () => setBigImage(-1) } >
                    <Image
                        source={{ uri: props.images[bigImage] }}
                        style={{ width: 320, height: 240 }}
                    />
                </TouchableOpacity>
            )}
            { !editMode?
                <ScrollView style={{flexGrow:0}} contentContainerStyle = {styles.imageList} >
                    {props.images.map( (image, index) =>
                        <TouchableOpacity onPress = { () => setBigImage(index) }
                                            key={index}>
                            <Image
                                source={{ uri: image }}
                                style={{ width: 120, height: 90 }}
                            />
                        </TouchableOpacity>
                    )}
                </ScrollView>
                :
                <ScrollView style={{flexGrow:0}} contentContainerStyle = {styles.imageList} >
                    {newImages.map( (image, index) =>
                        <TouchableOpacity onPress = { () => removeImage(index) }
                                            key={index}>
                            <Image
                                source={{ uri: image }}
                                style={{ width: 120, height: 90 }}
                            />
                        </TouchableOpacity>
                    )}
                </ScrollView>
            }
            { editMode && <View style={styles.row3} >
                    <SmallButton onPress={pickImage} >add image</SmallButton>
                    <SmallButton onPress={()=>setNewImages([])} >remove all</SmallButton>
                </View>
            }
            {(editMode)?
                <TextInput style={[styles.inputField, styles.description]} value={descriptionField} onChangeText={text => setDescriptionField(text)} />
            :
                <Text style={styles.description} >{props.description}</Text>
            }
            
            <View style={styles.row} >
                <Text style={styles.rowText1} >Categories:</Text>
                {(editMode)?
                    <TextInput style={[styles.inputField, styles.rowText2]} value={categoryField} onChangeText={text => setCategoryField(text)} />
                :
                    <Text style={styles.rowText2} >{props.category}</Text>
                }
            </View>
            <View style={styles.row} >
                <Text style={styles.rowText1} >Price:</Text>
                {(editMode)?
                    <TextInput style={[styles.inputField, styles.rowText2]} value={priceField} onChangeText={text => setPriceField(text)} />
                :
                    <Text style={styles.rowText2} >{props.price} €</Text>
                }
            </View>
            <View style={styles.row} >
                <Text style={styles.rowText1} >Delivery:</Text>
                {(editMode)?
                    <TextInput style={[styles.inputField, styles.rowText2]} value={deliveryField} onChangeText={text => setDeliveryField(text)} />
                :
                    <Text style={styles.rowText2} >{props.delivery}</Text>
                }
            </View>
            <View style={styles.row} >
                <Text style={styles.rowText1} >Location:</Text>
                {(editMode)?
                    <TextInput style={[styles.inputField, styles.rowText2]} value={locationField} onChangeText={text => setLocationField(text)} />
                :
                    <Text style={styles.rowText2} >{props.location}</Text>
                }
            </View>
            <View style={styles.row} >
                <Text style={styles.rowText1} >Date:</Text>
                <Text style={styles.rowText2} >{props.posting_date.substr(0,10)}</Text>
            </View>
            {( !editMode && <>
                <Text style={styles.sellerInformation} >Seller Information:</Text>
                <View style={styles.sellerBox} >
                    <View style={styles.row2} >
                        <Text style={styles.rowText21} >Name:</Text>
                        <Text style={styles.rowText22} >{props.seller_name}</Text>
                    </View>
                    <View style={styles.row2} >
                        <Text style={styles.rowText21} >Contact:</Text>
                        <Text style={styles.rowText22} >{props.seller_email}</Text>
                    </View>
                </View>
            </>)}
            {(props.seller === props.user.id) &&
                <View style={styles.row3} >
                    <SmallButton onPress = { toggleEditMode } title='test' >{ !editMode? 'Edit Item' : 'Cancel Edit'}</SmallButton>
                    <SmallButton onPress = { createOnDeleteAlert } title='test' >Delete Item</SmallButton> 
                </View>
            }
            {( editMode && <View style={{width: '80%'}} >
                    <BigButton onPress = { createOnUploadAlert } >Confirm Edit</BigButton>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: -40
    },
    inputField:{
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
    },
    description: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 10
    },
    imageList:{
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    row: {
        flexDirection: 'row',
        width: '80%',
        justifyContent: 'flex-start'
    },
    row2: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    row3: {
        flexDirection: 'row',
        width: '80%',
        justifyContent: 'space-around',
    },
    sellerBox:{
        flexDirection: 'column',
        width: '80%',
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 10,
        padding: 5
    },
    sellerInformation:{
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    rowText1: {
        flex: 1,
        fontSize: 16,
        fontStyle: 'italic',
    },
    rowText2: {
        flex: 2,
        fontSize: 16
    },
    rowText21: {
        flex: 1,
        fontSize: 16,
        fontStyle: 'italic',
    },
    rowText22: {
        flex: 3,
        fontSize: 16
    },
})
