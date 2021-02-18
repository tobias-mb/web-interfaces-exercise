import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/** display small arrow for open / close a form
 * needs open, toggle props */
export default function OpenCloseMenuButton(props) {
    return (
        <View>
            {(props.open)? 
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = { props.toggle }>
                    <Ionicons name="caret-up-circle-outline" size={20} color="gray"/>
                </TouchableOpacity>
                :
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = { props.toggle }>
                    <Ionicons name="caret-down-circle-outline" size={20} color="gray"/>
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    buttonLeftRightPadding:{
        paddingLeft: 10,
        paddingRight: 10,
    },
});