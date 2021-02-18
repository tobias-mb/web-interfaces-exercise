import React, {useState} from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import server from '../server.json';
import BigButton from './BigButton';

//check if something is an email address
function ValidateEmail(mail) 
{
 if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail))
  {
    return (true)
  }
    return (false)
}

export default function RestorePasswordView(props) {
    const [emailField, setEmailField] = useState('');
    const [loadingResults, setLoadingResults] = useState(false);

    // password reset -> POST /users/restore
    const onSendRequest = () => {
        if( !emailField || !ValidateEmail(emailField) ){
            alert('Please enter your email.');
            return;
        }
        if( loadingResults ) {
            alert('Please be patient...');
            return;
        } 
        // send POST request to server with axios
        setLoadingResults(true);
        axios({
            method: 'post',
            url: server.address + '/users/restore',
            data: {
                email: emailField
            }
            })
            .then(function (response) {
                //handle success
                console.log(response.data);
            })
            .catch(function (response) {
                //handle error
                console.log(response);
                alert('Something went wrong. Please check your email address.');
            })
            .finally(function () {
                setLoadingResults(false);
                props.setMode('emailConfirmation');
            });
    }

    return (
        <>
            <Text style={styles.title} >Restore Password</Text>
            <Text style={styles.text} >Your Email address</Text>
            <TextInput
                value = { emailField }
                onChangeText={text => setEmailField(text) }
                style={styles.inputField}
            />
            <Text style={styles.text2} >A confirmation link will be sent to this email address. Use that link to reset your password.</Text>
            <View style={ styles.wideContainer }>
                <BigButton
                    onPress={ onSendRequest }
                >
                    Confirm
                </BigButton>
            </View>
            <View style={ styles.wideContainer }>
                <BigButton
                    onPress={ () => props.setMode('login') }
                >
                    Cancel
                </BigButton>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
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
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        color: 'black',
        fontWeight: 'bold',
        marginBottom: 40,
        marginTop: 20
    },
    text:{
        fontSize: 18
    },
    wideContainer: {
        width: '75%',
    },
    text2:{
        fontSize: 16,
        marginLeft: 5,
        marginRight: 5
    },
    widecontainer:{
        width: '75%'
    }
})
