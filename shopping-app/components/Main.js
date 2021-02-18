import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBox from './SearchBox';
import ItemsList from './ItemsList';

// this is the "main" page = search items page
export default function Main(props) {
    const [showSearch, setShowSearch] = useState(true);
    const toggleShowSearch = () => {
        setShowSearch( showSearch => !showSearch );
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
                        onPress = {toggleShowSearch}>
                    <Ionicons name="search-outline" size={40} color="blue"  />
                </TouchableOpacity>
                <TouchableOpacity
                        style={styles.buttonLeftRightPadding}
                        onPress = {() => props.setRoute('/account') }>
                    <Ionicons name="person-outline" size={40} color="blue"  />
                </TouchableOpacity>
            </View>
            { (!showSearch && props.products.length === 0 &&
                <Text>click the icon to search</Text>) }
            { (showSearch && <SearchBox setProducts = { props.setProducts }
                                        toggleShowSearch = { toggleShowSearch } />) }
            <ItemsList  products = {props.products}
                        setRoute = { props.setRoute }/>
            
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
    }
});