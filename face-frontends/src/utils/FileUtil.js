const BlobToDataURL = (blob, cb) => {
    let reader = new FileReader();
    reader.onload = function (evt) {
        let base64 = evt.target.result;
        cb(base64);
    };
    reader.readAsDataURL(blob);
};
export {BlobToDataURL}
