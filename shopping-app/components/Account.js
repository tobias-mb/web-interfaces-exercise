import React, {useState, useEffect} from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import LoginView from './LoginView';
import RegisterView from './RegisterView';
import UserInfoView from './UserInfoView';
import EmailConfirmationView from './EmailConfirmationView';
import RestorePasswordView from './RestorePasswordView';
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

// login / register page
export default function Upload(props) {
    const [mode, setMode] = useState('loading');
    const [nameField, setNameField] = useState('');
    const [passwordField, setPasswordField] = useState('');
    const [emailField, setEmailField] = useState('');
    const [loadingResults, setLoadingResults] = useState(false);
    function setTesterUser () {
        setNameField('tester');
        setPasswordField('1234');
    }

    useEffect(() => {
        if(props.user.username){
            setMode('userinfo');
        }else{
            setMode('login')
        }
    },[props.user])

    // login -> POST /login
    const onLogin = () => {
        if( !nameField || !passwordField ){
            alert('Please enter your username and password.');
            return;
        }
        if( loadingResults ) {
            alert('Please be patient...');
            return;
        }
        
        const authHeader = 'Basic ' + base64.encode(`${nameField}:${passwordField}`);
        // send POST request to server with axios
        setLoadingResults(true);
        axios({
            method: 'post',
            url: server.address + '/login',
            headers: { 
                'Authorization': authHeader
            }
            })
            .then(function (response) {
                //handle success
                props.updateUser({
                    id: response.data.id,
                    username: nameField,
                    password: passwordField,
                    email: response.data.email
                });
                console.log(response.data);
            })
            .catch(function (response) {
                //handle error
                console.log(response);
                alert('Log In failed.');
            })
            .finally(function () {
                setLoadingResults(false);
            });
    }
    // register -> POST /users
    const onRegister = () => {
        if( !nameField || !passwordField || !emailField){
            alert('Please fill in all fields.');
            return;
        }
        if( !ValidateEmail(emailField) ){
            alert('Please use a valid email. You need it to activate your account.')
        }
        if( loadingResults ) {
            alert('Please be patient...');
            return;
        }
        
        // send POST request to server with axios
        setLoadingResults(true);
        axios({
            method: 'post',
            url: server.address + '/users',
            data:{
                username: nameField,
                email: emailField,
                password: passwordField
            }
            })
            .then(function (response) {
                //handle success
                setMode('emailConfirmation');
                console.log(response.data);
            })
            .catch(function (response) {
                //handle error
                console.log(response);
                alert('Something went wrong');
            })
            .finally(function () {
                setLoadingResults(false);
            });
    }

    var output = <View/>
    switch (mode){
        case 'userinfo': {
            output =  <UserInfoView
                        {...props.user}
                        updateUser = {props.updateUser}
                        setProducts = {props.setProducts}
                        setRoute = { props.setRoute }
                      />
            break;
        }
        case 'register': {
            output = <RegisterView 
                        setMode = {setMode}
                        nameField = {nameField}
                        setNameField={setNameField}
                        passwordField = {passwordField}
                        setPasswordField = {setPasswordField}
                        emailField = {emailField}
                        setEmailField={setEmailField}
                        onRegister={onRegister}
                    />
            break;
        }
        case 'login': {
            output = <LoginView
                        setMode = {setMode}
                        nameField = {nameField}
                        setNameField={setNameField}
                        passwordField = {passwordField}
                        setPasswordField = {setPasswordField}
                        onLogin = {onLogin}
                    />
            break;
        }
        case 'emailConfirmation': {
            output = <EmailConfirmationView setMode = {setMode} />
            break;
        }
        case 'restorePassword': {
            output = <RestorePasswordView setMode = {setMode} />
            break;
        }
        default: {
            output = <View/>
        }
    }

    return (
        <View style={styles.container} >
            <View style = {styles.topBar} >
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = {() => props.setRoute('/upload') }>
                    <Ionicons name="cloud-upload-outline" size={40} color="blue"  />
                </TouchableOpacity>
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = {() => props.setRoute('/main')}>
                    <Ionicons name="search-outline" size={40} color="blue"  />
                </TouchableOpacity>
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = { setTesterUser }>
                    <Ionicons name="person-outline" size={40} color="blue"  />
                </TouchableOpacity>
            </View>
            { output }
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
        paddingRight: 20
    },
});
