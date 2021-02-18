import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

// this displays the text boxes for upload form
export default function UploadForm(props) {
    return (
        <View style={styles.container} >
            <View style={styles.searchBar} >
                <Text style={styles.text} >Title:</Text>
                <TextInput
                    style={styles.searchField}
                    value={props.title}
                    onChangeText={text => props.setTitle(text)} >
                </TextInput>
            </View>
            <View style={styles.searchBar} >
                <Text style={styles.text} >Description:</Text>
                <TextInput
                    style={styles.searchField}
                    value={props.description}
                    onChangeText={text => props.setDescription(text)} >
                </TextInput>
            </View>
            <View style={styles.searchBar} >
                <Text style={styles.text} >Category:</Text>
                <TextInput
                    style={styles.searchField}
                    value={props.category}
                    onChangeText={text => props.setCategory(text)} >
                </TextInput>
            </View>
            <View style={styles.searchBar} >
                <Text style={styles.text} >Location:</Text>
                <TextInput
                    style={styles.searchField}
                    value={props.location}
                    onChangeText={text => props.setLocation(text)} >
                </TextInput>
            </View>
            <View style={styles.searchBar} >
                <Text style={styles.text} >Price (in €):</Text>
                <TextInput
                    style={styles.searchField}
                    value={props.price}
                    onChangeText={text => props.setPrice(text)} >
                </TextInput>
            </View>
            <View style={styles.searchBar} >
                <Text style={styles.text} >Delivery:</Text>
                <TextInput
                    style={styles.searchField}
                    value={props.delivery}
                    onChangeText={text => props.setDelivery(text)} >
                </TextInput>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 5,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchField: {
        flex: 3,
        height: 40,
        width: 200,
        borderColor: 'gray',
        backgroundColor: 'white',
        borderWidth: 1,
        padding: 5
    },
    text: {
        flex: 1.1,
        fontSize: 16
    },
});
