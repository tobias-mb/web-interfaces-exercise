import React from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'
import BigButton from './BigButton';

export default function LoginView(props) {
    return (
        <>
            <Text style={styles.title} >Log In</Text>
            <Text style={styles.text} >Username</Text>
            <TextInput
                value = { props.nameField }
                onChangeText={text => props.setNameField(text) }
                style={styles.inputField}
            />
            <Text style={styles.text} >Password</Text>
            <TextInput
                value = { props.passwordField }
                onChangeText={text => props.setPasswordField(text) }
                style={styles.inputField}
            />
            <View style={ styles.wideContainer }>
                <BigButton
                    onPress = { props.onLogin }
                >
                    Log In
                </BigButton>
            </View>
            <View style={ styles.wideContainer }>
                <BigButton
                    onPress={ () => props.setMode('register') }
                >
                    To Register
                </BigButton>
            </View>
            <View style={ styles.wideContainer }>
                <BigButton
                    onPress={ () => props.setMode('restorePassword') }
                >
                    Forgot Password?
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

