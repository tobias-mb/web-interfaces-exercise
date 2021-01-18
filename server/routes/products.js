var express = require('express');
var router = express.Router();
const db = require('../db');
const passport = require('passport');

function formatDate(date) { // YYYY-MM-DD format
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

router.post('/', passport.authenticate('basic', {session : false}), (req, res) => {
    let imageIDs = [];
    //put images into image table, return their ID
    Promise.all(req.body.images.map(img => {
        return db.query('insert into images_table (title, link) values($1, $2) returning id', ['title', img])
    }))
    .then(result => {
        imageIDs = result.map(r => r.rows[0].id)  //get the IDs of images
        let today = new Date();
        return db.query('insert into products_table (title, description, category, location, images, price, delivery, seller, posting_date) values($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id',
            [req.body.title, req.body.description, req.body.category, req.body.location, imageIDs.toString(), req.body.price, req.body.delivery, req.user.id, formatDate(today) ])
    })
    .then(result => {
        return Promise.all( imageIDs.map(id => {    //update the reference from images to owner posting
            return db.query('update images_table set ownerPosting=$1 where id=$2',[result.rows[0].id,id])
        }))
    })
    .then(result => {
        res.sendStatus(201);
    })
    .catch(error => {
        console.error(err);
        res.sendStatus(500);
    })
})

router.put('/:id', passport.authenticate('basic', {session : false}), (req, res) => {
    db.query('select id,seller from products_table where id=$1', [req.params.id])
    .then(result => {
        if(result.rows.length === 0){ //no matching id found
            res.sendStatus(404);
            throw new Error('item not found');
        }
        if (result.rows[0].seller !== req.user.id){ //can only change own posting
            res.sendStatus(403);
            throw new Error('not owner');
        }
        if(req.body.images){ //delete old images
            return db.query('delete from images_table where ownerPosting=$1',[result.rows[0].id])
        }else{
            return true;
        }
    })
    .then(result => {
        if(req.body.images){
            return Promise.all(req.body.images.map(img => { //insert new images
                return db.query('insert into images_table (ownerPosting, title, link) values($1, $2, $3) returning id', [req.params.id, 'title', img])
            }))
        }else{
            return true;
        }
    })
    .then(result => {
        let today = new Date();
        let columnsArray = ['title', 'description', 'category', 'location', 'price', 'delivery'];
        let sqlString = 'update products_table set posting_date=$2';
        let sqlArray = [req.params.id, formatDate(today)];
        let iter = 3;
        for(let i = 0; i < columnsArray.length; ++i){   //if req.body tells us to update that property, then add it to SQL request
            if (req.body[columnsArray[i]]){
                sqlString+=`, ${columnsArray[i]}=$${iter}`;
                sqlArray.push(req.body[columnsArray[i]])
                ++iter;
            }
        }
        if(req.body.images){    //imgahes are special since those are converter to ids before this
            var imageIDs = result.map(r => r.rows[0].id)  //get the IDs of images
            sqlString+=`, images=$${iter}`;
            sqlArray.push(imageIDs.toString());
        }
        sqlString+=' where id=$1';

        return db.query(sqlString, sqlArray)
    })
    .then(result => {
        res.sendStatus(201);
    })
    .catch(error => {
        console.error(error);
        res.sendStatus(500);
    })
})

router.delete('/:id', passport.authenticate('basic', {session : false}), (req, res) => {
    db.query('select seller,images from products_table where id=$1', [req.params.id])
    .then(result => {
        if(result.rows.length === 0){ //no matching id found
            res.sendStatus(404);
            throw new Error('item not found');
        }
        if (result.rows[0].seller !== req.user.id){ //can only change own posting
            res.sendStatus(403);
            throw new Error('not owner');
        }
        return Promise.all(result.rows[0].images.split(',').map(id => { //delete connected images
            console.log(id);
            return db.query('delete from images_table where id=$1', [id])
        }))
    })
    .then(result => {
        return db.query('delete from products_table where id=$1', [req.params.id])
    })
    .then(result => {
        res.sendStatus(204)
    })
    .catch(error => {
        console.error(error);
        res.sendStatus(500);
    })
})

router.get('/', (req, res) => {
    let sqlString = 'select * from products_table';
    let sqlArray = [];
    let iter = 1;
    if(Object.keys(req.query).length > 0){  // there are search params
        sqlString+= ' where'
        for (const key in req.query) {  // build sql request
            if (Object.hasOwnProperty.call(req.query, key)) {
                const value = req.query[key];
                let nameLike="%"+value+"%";
                if(iter > 1){
                    sqlString+= ' AND'
                }
                if(key === 'id' || key === 'seller'){   //these need to be exact
                    sqlString += ` ${key}=$${iter}`;
                    sqlArray.push(value);
                }else if(key === 'price'){  // treat it as a max price
                    sqlString += ` $${iter} > ${key}`;
                    sqlArray.push(value);
                    //SELECT city FROM cities WHERE 80 < any (temps);
                }else { // treat strings the same
                    sqlString+=` ${key} ILIKE $${iter}`;
                    sqlArray.push(nameLike);
                }
                ++iter;
            }
        }
    }
    console.log(sqlString);
    console.log(sqlArray);

    db.query(sqlString,sqlArray)
    .then(result => {
        res.json(result.rows)
    })
    .catch(error => {
        console.error(error);
        res.sendStatus(500);
    })
})

module.exports = router;