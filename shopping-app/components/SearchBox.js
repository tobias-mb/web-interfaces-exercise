import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import BigButton from './BigButton';
import axios from 'axios';
import server from '../server.json';

// check for yyyy-mm-dd date format
function testDateFormat(date) {
    if ( date === 'yyyy-mm-dd' || date === '' || /^[0-2][0-9]{3}\-[0-1][0-9]\-[0-3][0-9]$/.test(date)) {
        return (true)
    } else{
        return (false)
    }
}
// check if it is a number
function testPriceFormat(str) {
    if ( str === '' || /^[0-9]*$/.test(str) || /^[0-9]*\.[0-9]{2}$/.test(str) ) {
        return (true)
    } else{
        return (false)
    }
}

// build the search string for GET /products query
function buildSearchString(cat, loc, dat, price) {
    var searchString = '';
    let needAnd = false;
    //there is a search query
    if (    (cat !== '' && cat !== 'What are you looking for?')
            || (loc !== '' && loc !== 'City')
            || (dat !== '' && dat !== 'yyyy-mm-dd') 
            || (price !== '') ) {
        searchString += '?';
        if ( (cat !== '' && cat !== 'What are you looking for?') ) {
            if (needAnd) searchString += '&'
            searchString += 'category=' + cat;
            needAnd = true;
        }
        if ( (loc !== '' && loc !== 'City') ) {
            if (needAnd) searchString += '&'
            searchString += 'location=' + loc;
            needAnd = true;
        }
        if ( (dat !== '' && dat !== 'yyyy-mm-dd') ) {
            if (needAnd) searchString += '&'
            searchString += 'posting_date=' + dat;
            needAnd = true;
        }
        if (price !== '') {
            if (needAnd) searchString += '&'
            searchString += 'price=' + price;
            needAnd = true;
        }
    }
    return searchString;
}

// This is the search form + "search" button
export default function SearchBox(props) {

    const [category, setCategory] = useState('What are you looking for?');
    const [location, setLocation] = useState('City');
    const [date, setDate] = useState('yyyy-mm-dd');
    const [price, setPrice] = useState('');
    const [loadingResults, setLoadingResults] = useState(false);

    // send GET request to server
    const onSearchPress = () => {
        if ( !testDateFormat(date) ){
            alert("please enter date in yyyy-mm-dd format.");
            return;
        }
        if (!testPriceFormat(price)) {
            alert('Please enter price as a number. Eexamples: 13 or 17.40');
            return;
        }
        if ( loadingResults ){
            alert("please wait a bit, while results are loading...");
            return;
        }
        
        var searchString = buildSearchString(category, location, date, price);
        console.log(server.address + `/products` + searchString);
        setLoadingResults(true);
        axios({
            method: 'get',
            url: server.address + `/products` + searchString,
            })
            .then(response => {
                console.log(response.data.products);
                props.setProducts(response.data.products);
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                setLoadingResults(false);
                props.toggleShowSearch();
            });
    }

    return (
        <View style={styles.container} >
            <View style={styles.searchBar} >
                <Text style={styles.text} >Category:</Text>
                <TextInput
                    style={styles.searchField}
                    value={category}
                    onChangeText={text => setCategory(text)} >
                </TextInput>
            </View>
            <View style={styles.searchBar} >
                <Text style={styles.text} >Location:</Text>
                <TextInput
                    style={styles.searchField}
                    value={location}
                    onChangeText={text => setLocation(text)} >
                </TextInput>
            </View>
            <View style={styles.searchBar} >
                <Text style={styles.text} >Date (newer):</Text>
                <TextInput
                    style={styles.searchField}
                    value={date}
                    onChangeText={text => setDate(text)} >
                </TextInput>
            </View>
            <View style={styles.searchBar} >
                <Text style={styles.text} >Price (max):</Text>
                <TextInput
                    style={styles.searchField}
                    value={price}
                    onChangeText={text => setPrice(text)} >
                </TextInput>
            </View>
            <BigButton onPress = { onSearchPress } >
                Search
            </BigButton>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 5
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
        flex: 1,
        fontSize: 16
    },
});
