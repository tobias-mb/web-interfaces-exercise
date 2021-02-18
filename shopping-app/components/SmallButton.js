import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity  } from 'react-native';

// a button. Needs an onPress prop; text inside button is child element.
export default function SmallButton(props) {
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
    button:{
        borderWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'silver',
        borderRadius: 30,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text:{
        fontSize: 14
    }
});