const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);
const {v4: uuidv4 } = require('uuid');

const subirArchivo = async(file = '', path = '') => {
    try {
        const {secure_url} = await cloudinary.uploader.upload(file, {public_id:`EmployeEasy/${path}/${uuidv4()}`});
        return secure_url;

    } catch (error) {
        console.log(error)
    }
};


module.exports = subirArchivo;