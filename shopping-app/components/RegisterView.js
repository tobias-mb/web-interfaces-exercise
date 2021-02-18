import React from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'
import BigButton from './BigButton';

export default function LoginView(props) {
    return (
        <>
            <Text style={styles.title} >New User</Text>
            <Text style={styles.text} >Username</Text>
            <TextInput
                style={styles.inputField}
                value = { props.nameField }
                onChangeText={ text => props.setNameField(text) }
            />
            <Text style={styles.text} >Email</Text>
            <TextInput
                style={styles.inputField}
                value = { props.emailField }
                onChangeText={ text => props.setEmailField(text) }
            />
            <Text style={styles.text} >Password</Text>
            <TextInput
                style={styles.inputField}
                value = { props.passwordField }
                onChangeText ={ text => props.setPasswordField(text) }
            />
            <View style={ styles.wideContainer }>
                <BigButton
                    onPress={props.onRegister}
                >
                    Register
                </BigButton>
            </View>
            <View style={ styles.wideContainer }>
                <BigButton
                    onPress={() => props.setMode('login')}
                >
                    To Log In
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
    }
});

