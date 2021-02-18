import React, {useState} from 'react'
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native'
import BigButton from './BigButton';
import axios from 'axios';
import server from '../server.json';
import base64 from 'react-native-base64';

//check if something is an email address
function ValidateEmail(mail) 
{
 if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail))
  {
    return (true)
  }
    return (false)
}


export default function UserInfoView(props) {
    const [changeOption, setChangeOption] = useState('');
    const [loadingResults, setLoadingResults] = useState(false);
    const [passwordField, setPasswordField] = useState('');
    const [changeField, setChangeField] = useState('');

    // send GET request to server
    const onSearchPress = () => {
        setLoadingResults(true);
        axios({
            method: 'get',
            url: server.address + '/products?seller=' + props.id
            })
            .then(response => {
                console.log(response.data.products);
                props.setProducts(response.data.products);
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                setLoadingResults(false);
                props.setRoute('/main')
            });
    }

    // change userinfo -> PUT /users
    const onChangeInformation = (toChange) => {
        if( !changeField || !passwordField ){
            alert('Missing Input.');
            return;
        }
        if( passwordField !== props.password ){
            alert('Invalid Password.');
            return;
        }
        if( toChange==='email' && !ValidateEmail(changeField) ){
            alert('Invalid Email.');
            return;
        }
        if( loadingResults ) {
            alert('Please be patient...');
            return;
        }
        
        const authHeader = 'Basic ' + base64.encode(`${props.username}:${props.password}`);
        // send PUT request to server with axios
        setLoadingResults(true);
        axios({
            method: 'put',
            url: server.address + '/users',
            headers: { 
                'Authorization': authHeader
            },
            data:{
                [toChange]: changeField
            }
            })
            .then(function (response) {
                //handle success
                props.updateUser({
                    [toChange]: changeField
                });
                console.log(response.data);
                Alert.alert(
                    "Success",
                    "Your new information is now saved in the server.",
                    [
                      { text: "OK", onPress: () => console.log('ok pressed') },
                    ],
                    { cancelable: false }
                )
                
            })
            .catch(function (response) {
                //handle error
                console.log(response);
                alert('Something went wrong');
            })
            .finally(function () {
                setLoadingResults(false);
                setChangeOption('');
            });
    }

    return (
        <>
            <Text style={styles.username} >{props.username}</Text>
            <Text style={styles.email} >{props.email}</Text>
            {( changeOption !== '' &&  <>
                <Text style={styles.text} >New {changeOption}</Text>
                <TextInput
                    style={styles.inputField}
                    value = { changeField }
                    onChangeText={ text => setChangeField(text) }
                />
                <Text style={styles.text} >Password confirmation</Text>
                <TextInput
                    style={styles.inputField}
                    value = { passwordField }
                    onChangeText={ text => setPasswordField(text) }
                />
            </> )}
            <View style={ styles.wideContainer }>
                <BigButton onPress={ onSearchPress } >All my Items</BigButton>
            </View>
            { (changeOption === '')?  <>
                <View style={ styles.wideContainer }>
                    <BigButton onPress={()=>setChangeOption('password')} >change Password</BigButton>
                </View>
                <View style={ styles.wideContainer }>
                    <BigButton onPress={()=>setChangeOption('email')} >change Email</BigButton>
                </View>
            </> : <>
                <View style={ styles.wideContainer }>
                    <BigButton onPress={()=>onChangeInformation(changeOption)} >Confirm</BigButton>
                </View>
                <View style={ styles.wideContainer }>
                    <BigButton onPress={()=>setChangeOption('')} >Cancel</BigButton>
                </View>
            </>}
            <View style={ styles.wideContainer }>
                <BigButton onPress={()=>props.updateUser( {id: null, username: null, password: null, email: null} )} >Log Out</BigButton>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    username:{
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 20,
    },
    email:{
        fontSize: 18,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    text:{
        fontSize: 16
    },
    inputField: {
        height: 40,
        width: '75%',
        borderColor: 'gray',
        backgroundColor: 'white',
        borderWidth: 1,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 30,
        fontSize: 16,
        marginBottom: 10
    },
    wideContainer:{
        width: '75%'
    }
});
