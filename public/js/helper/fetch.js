// default handle data
const defaultHandleData = (res) => {
    return console.log(res);
}

// default handle error
const defaultHandleError = (err) => {
    return console.log(err);
}

// get method
const getMethod = async(url, handleData = defaultHandleData, handleError = defaultHandleError) => {
    let response, resJson;
    try {
        response = await fetch(url);
        resJson = await response.json();

        if (response.status != 200 || resJson.error) throw resJson.error;

    } catch (err) {
        return handleError(err);
    }
    return handleData(resJson);
}


// post method

const anotherMethod = async(url, method = 'POST', data, handleData = defaultHandleData, handleError = defaultHandleError) => {
    // Default options are marked with * 
    let response, resJson;
    try {
        response = await fetch(url, {
            method: method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        resJson = await response.json();
        if (response.status != 200 || resJson.error) throw resJson.error;

    } catch (err) {
        return handleError(err);
    }
    return handleData(resJson);
}