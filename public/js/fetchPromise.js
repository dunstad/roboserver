/**
 * Used by fetchPromise to make sure we resolve or throw errors as appropriate.
 * @param {Response} response 
 * @returns {Promise<Response>}
 */
function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

/**
 * Used by fetchPromise to get JSON out of a request.
 * @param {Response} response 
 * @returns {Promise<string>}
 */
function extractData(response) {
  var contentType = response.headers.get("Content-Type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  else {
    return response.text();
  }
}

/**
 * Fetches data from 'url'.
 * @param {string} url 
 * @param {object} options 
 * @returns {Promise<string>}
 */
function fetchPromise(url, options) {
  return new Promise((resolve, reject)=>{
    fetch(url, options)
    .then(status)
    .then(extractData)
    .then(resolve)
    .catch(reject);
  });
}
