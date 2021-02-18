import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Main from './components/Main';
import Upload from './components/Upload';
import Account from './components/Account';
import DetailView from './components/DetailView';

// root element
export default function App() {
  const [products, setProducts] = useState([]);
  const [route, setRoute] = useState('/main');
  const [user, setUser] = useState( {id: null, username: null, password: null, email: null} );
  const updateUser = ( obj ) => {
    let userCopy = {...user};
    for (const key in obj) {
      if (Object.hasOwnProperty.call(userCopy, key)) {
        userCopy[key] = obj[key];
      }
    }
    setUser(userCopy);
  }
  const backToMain = function () {
    setRoute('/main');
    setProducts([]);
  }

  let output = <View />;

  switch (route) {
    case '/upload': {
      output =  <Upload 
                  setRoute={setRoute}
                  user = {user}
                />;
      break;
    }
    case '/account': {
      output =  <Account
                  setRoute={setRoute}
                  user= {user}
                  updateUser = {updateUser}
                  setProducts = {setProducts} // to find own products
                />;
      break;
    }
    case (route.match(/^\/detailView/) || {} ).input : {
      let splitForID = route.split('/');
      let itemID = splitForID[splitForID.length-1];
      output =  <DetailView
                  setRoute={setRoute}
                  user = {user}
                  backToMain = {backToMain}
                  {...products.find(product => product.id == itemID)} // == is on purpose here, since it compares string == number
                />;
      break;
    }
    default: {
      output =  <Main
                  products = {products}
                  setProducts={setProducts}
                  setRoute={setRoute}
                />;
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {output}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#f5cba7aa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40
  }
});
