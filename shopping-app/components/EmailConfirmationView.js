import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import BigButton from './BigButton';

export default function EmailConfirmationView(props) {
    return (
        <View>
            <Text style={styles.title} > Email Confirmation </Text>
            <Text style={styles.text} >An Email with a confirmation link has been sent to your email address.</Text>
            <Text style={styles.text} >Please use that link to confirm your request before proceeding.</Text>
            <BigButton onPress = { () => props.setMode('login') } >OK</BigButton>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        marginTop: 20,
        marginBottom: 20,
        alignSelf: 'center'
    },
    text: {
        margin: 5,
        fontSize: 16
    }
});
