import React from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native'
import defaultPicture from '../assets/favicon.png';

// an item in the search list
export default function ListElement(props) {
    return (
        <TouchableOpacity onPress={ () => props.setRoute('/detailView/' + props.id ) } >
            <View style={styles.item} >
                { ( props.images.length > 0 )?
                    <Image style = {styles.tinyLogo} source={{ uri: props.images[0] }} /> :
                    <Image style = {styles.tinyLogo} source={ defaultPicture } />
                }
                <View style={styles.column1}  >
                    <Text style={styles.title} > {props.title} </Text>
                    <Text> {props.description} </Text>
                </View>
                <View style={styles.column2}  >
                    { (props.price) && <Text> { props.price }€ </Text> }
                    <Text> { props.posting_date.substr(0, 10) } </Text>
                    <Text> {props.location} </Text>
                </View>
            </View>
        </TouchableOpacity>
        
    )
}

const styles = StyleSheet.create({
    item: {
        borderColor: 'gray',
        borderWidth: 1,
        padding: 2,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    column1: {
        flexDirection: 'column',
        flex : 1.2
    },
    column2: {
        flexDirection: 'column',
        flex : 0.8
    },
    title: {
        fontSize: 18,
        color: 'blue',
    },
    tinyLogo: {
        height: 80,
        flex: 1,
        resizeMode: 'contain'
    },
});