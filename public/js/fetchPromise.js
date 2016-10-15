function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

function extractData(response) {
  var contentType = response.headers.get("Content-Type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  else {
    return response.text();
  }
}

function fetchPromise(url, options) {
  return new Promise((resolve, reject)=>{
    fetch(url, options)
    .then(status)
    .then(extractData)
    .then(resolve)
    .catch(reject);
  });
}
