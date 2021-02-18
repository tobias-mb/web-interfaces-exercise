import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity  } from 'react-native';

// a button. Needs an onPress prop; text inside button is child element.
export default function BigButton(props) {
    return (
        <TouchableOpacity
                onPress = { props.onPress } >
            <View style={ [ styles.button, { height: props.height, width: props.width }] } >
                <Text style = {styles.text}  > {props.children} </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        margin: 5,
        padding: 15,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#83caf1'
    },
    text:{
        fontSize: 18
    }
});