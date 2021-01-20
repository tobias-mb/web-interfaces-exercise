var express = require('express');
var router = express.Router();
const db = require('../db');
const passport = require('passport');

const fs = require('fs');
const multer  = require('multer');
const fileUpload = multer();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const cloudinaryAuth = require('../cloudinaryAuth.json');
cloudinary.config(cloudinaryAuth);
const { v4: uuidv4 } = require('uuid');

//used to upload files to Cloudinary
const streamUpload = (fileBuffer, username) => {
    if(!username){  // shouldn't happen; but makes sure public_id is always a valid string
        username = "default";
    }
    const uniqueFilename = uuidv4();
    return  new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          { public_id: `web-interfaces-exercise/${username}/${uniqueFilename}`},
          (error, result) => {
            if (result) {
              result.filename = uniqueFilename;
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
       streamifier.createReadStream(fileBuffer.buffer).pipe(stream);
    });
};
//used to delete files from Cloudinary
const fileDeleter = (fileName, username) => {
    fileName = `web-interfaces-exercise/${username}/` + fileName;
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(fileName, (error, result) => {
            if(result) {
                resolve(result);
            }else{
                reject(error);
            }
        });
    });
};
/** create new posting. Need {username, password} in auth
 * {
 *      "images": file.jpg (it's a form)
 *      "images": file.jpg
 *      "title":"a title",
 *      "description":"a desc",
 *      "category":"category tags",
 *      "location":"location",
 *      "price":19.99,
 *      "delivery":"a delivery method"
 * }
 */
router.post('/', [passport.authenticate('basic', {session : false}), fileUpload.array('images')], (req, res) => {
    if(!req.body.title){    //all other fields are optional, but title is mandatory
        res.status(400);
        res.send("post must have titlte");
        return;
    }
    var postID = 0;
    var imageIDs = [];
    //upload images to Cloudinary, save the URLs
    Promise.all(req.files.map( f => {
        return streamUpload(f, req.user.username);
    }))
    //save the image links, remember IDs
    .then(result => {
        console.log(result);
        return Promise.all(result.map(img => {
            return db.query('insert into images_table (title, link) values($1, $2) returning id', [img.filename, img.secure_url]);
        }))
    })
    .then(result => {
        imageIDs = result.map(r => r.rows[0].id)  //get the IDs of images
        return db.query('insert into products_table (title, description, category, location, images, price, delivery, seller) values($1, $2, $3, $4, $5, $6, $7, $8) returning id',
            [req.body.title, req.body.description, req.body.category, req.body.location, imageIDs.toString(), req.body.price, req.body.delivery, req.user.id ]);
    })
    .then(result => {
        if(result.rows.length > 0){
            postID = result.rows[0].id
        }
        return Promise.all( imageIDs.map(id => {    //update the reference from images to owner posting
            return db.query('update images_table set owner_posting=$1 where id=$2',[postID, id]);
        }))
    })
    .then(result => {
        res.status(201);
        res.json({
            id : postID
        });
    })
    .catch(error => {
        console.error(error);
        res.sendStatus(500);
    })
})

// used to change any information in a posting. new information is in req.body
router.put('/:id', [passport.authenticate('basic', {session : false}), fileUpload.array('images')], (req, res) => {
    var changeImages = false;
    if (req.files.length > 0){ // images should change
        changeImages = true;
    }
    db.query('select seller from products_table where id=$1', [req.params.id])    // product to change
    .then(result => {
        if(result.rows.length === 0){ //no matching id found
            res.status(404);
            throw new Error('item not found');
        }
        if (result.rows[0].seller !== req.user.id){ //can only change own posting
            res.status(403);
            throw new Error('not owner');
        }

        if(changeImages){ //get the filenames from the old images
            return db.query('select title from images_table where owner_posting=$1', [req.params.id]);
        }else{
            return true;
        }
    })
    .then(result => {
        if(changeImages){
            return Promise.all(result.rows.map(img => { //delete the old images from Cloudinary
                return fileDeleter(img.title, req.user.username);
            }))
        }else{
            return true;
        }
    })
    .then (result => {
        if(changeImages){    // delete the old images from db as well
            return db.query('delete from images_table where owner_posting=$1',[req.params.id])
        }else{
            return true;
        }
    })
    .then(result => {
        if(changeImages){    //new images to Cloudinary
            return Promise.all(req.files.map( f => {
                return streamUpload(f, req.user.username);
            }));
        }else{
            return true;
        }
    })
    .then(result => {
        if(changeImages){    // new links to database
            return Promise.all(result.map(img => {
                return db.query('insert into images_table (title, link, owner_posting) values($1, $2, $3) returning id', [img.filename, img.secure_url, req.params.id]);
            }));
        }else{
            return true;
        }
    })
    .then(result => {
        let today = new Date();
        let columnsArray = ['title', 'description', 'category', 'location', 'price', 'delivery'];
        let sqlString = 'update products_table set posting_date=$2';
        let sqlArray = [req.params.id, today];
        let iter = 3;
        for(let i = 0; i < columnsArray.length; ++i){   //if req.body tells us to update that property, then add it to SQL request
            if (req.body[columnsArray[i]]){
                sqlString+=`, ${columnsArray[i]}=$${iter}`;
                sqlArray.push(req.body[columnsArray[i]])
                ++iter;
            }
        }
        if(changeImages){    //images are handled differently
            var imageIDs = result.map(r => r.rows[0].id)  //get the IDs of images
            sqlString+=`, images=$${iter}`;
            sqlArray.push(imageIDs.toString());
        }
        sqlString+=' where id=$1';

        return db.query(sqlString, sqlArray)
    })
    .then(result => {
        res.sendStatus(200);
    })
    .catch(error => {
        console.error(error);
        res.send(error.message);
    })
})

//delete a posting by id
router.delete('/:id', passport.authenticate('basic', {session : false}), (req, res) => {
    db.query('select seller from products_table where id=$1', [req.params.id])
    .then(result => {
        if(result.rows.length === 0){ //no matching id found
            res.status(404);
            throw new Error('item not found');
        }
        if (result.rows[0].seller !== req.user.id){ //can only change own posting
            res.status(403);
            throw new Error('not owner');
        }

        return db.query('select title from images_table where owner_posting=$1', [req.params.id]); // get filenames of the images
    })
    .then(result => {
        return Promise.all(result.rows.map(img => { //delete the old images from Cloudinary
            return fileDeleter(img.title, req.user.username);
        }))
    })
    .then (result => {
        return db.query('delete from images_table where owner_posting=$1',[req.params.id]) // delete the old images from db as well
    })

    .then(result => {
        return db.query('delete from products_table where id=$1', [req.params.id])
    })
    .then(result => {
        res.sendStatus(204)
    })
    .catch(error => {
        console.error(error);
        res.send(error.message);
    })
})

//get postings. Specify by query params
router.get('/', (req, res) => {
    let answer = {};
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
                }else if(key === 'posting_date'){   // check for post after this
                    sqlString += ` $${iter} < ${key}`;
                    sqlArray.push(value);
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
        answer= result.rows;
        return Promise.all(answer.map(p => {    // add seller name and email information
            return db.query('select username, email from user_table where id = $1',[p.seller])
        }))
    })
    .then(result => {
        if(result.length > 0){
            for(let i=0; i<result.length; ++i){
                answer[i].seller_name = result[i].rows[0].username;
                answer[i].seller_email = result[i].rows[0].email;
            }
        }
        return Promise.all(answer.map(p => {    // replace image ids with images
            return db.query('select link from images_table where owner_posting = $1',[p.id])
        }))
    })
    .then(result => {
        if(result.length > 0){
            for(let i=0; i<result.length; ++i){
                answer[i].images = [];
                for(let j=0; j<result[i].rows.length; ++j){
                    answer[i].images.push( result[i].rows[j].link );
                }
            }
        }
        res.json(answer);
    })
    .catch(error => {
        console.error(error);
        res.status(400);
        res.send("invalid search params")
    })
})

module.exports = router;