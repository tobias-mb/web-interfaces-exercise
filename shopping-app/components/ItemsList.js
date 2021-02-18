import React from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import ListElement from './ListElement';

// the list of items after a search request
export default function ItemsList(props) {
    return (
            <ScrollView contentContainerStyle={styles.list} >
                { props.products.map( p =>  <ListElement
                                                {...p}
                                                key={p.id}
                                                setRoute = {props.setRoute}
                                            />) }
            </ScrollView>
    )
}

const styles = StyleSheet.create({
    list: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '98%'
    },
});
