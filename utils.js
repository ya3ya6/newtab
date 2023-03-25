/* script() : replace script with executable: https://stackoverflow.com/questions/1197575/can-scripts-be-inserted-with-innerhtml */

function nodeScriptReplace(node) {
  if ( nodeScriptIs(node) === true ) {
    node.parentNode.replaceChild( nodeScriptClone(node) , node );
  }
  else {
    var i = -1, children = node.childNodes;
    while ( ++i < children.length ) {
      nodeScriptReplace( children[i] );
    }
  }
  return node;
}

function nodeScriptClone(node){
  var script  = document.createElement("script");
  script.text = node.innerHTML;
  var i = -1, attrs = node.attributes, attr;
  while ( ++i < attrs.length ) {                                    
    script.setAttribute( (attr = attrs[i]).name, attr.value );
  }
  return script;
}

function nodeScriptIs(node) {
  return node.tagName === 'SCRIPT';
}

(() => {
  /* cdn("bootstrap") : fetch cdns by name */
  let getCDN1 = (name, version) => {
    return new Promise((resolve, reject) => {
      let baseCDN = "https://cdn.jsdelivr.net/npm";
      fetch('https://data.jsdelivr.com/v1/packages/npm/' + name).then(res => res.json()).then(res => {
        let latest = res?.tags?.latest;
        if(!version) version = latest
        if (version){
          fetch('https://data.jsdelivr.com/v1/packages/npm/'+name+'@'+version+'/entrypoints').then(res => res.json()).then(res => {
            let entrypoints = res?.entrypoints || {};
            let {js, css} = entrypoints;
            if(js?.file === "/index.min.js") js = ""
            if(js) js = baseCDN + '/' +name+'@'+version + js.file;
            if(css) css = baseCDN + '/' +name+'@'+version + css.file;
            resolve({js: js || "", css: css || "", version: version})
          }).catch(e => {
            resolve({});
          })
        }
      }).catch(e => {
        resolve({});
      })
    });
  }

  let getCDN2 = (name, version) => {
    return new Promise((resolve, reject) => {
      fetch("https://api.cdnjs.com/libraries/" + name).then(res => res.json()).then(res => {
        let js = res.latest;
        let css = js.split("/js/").join("/css/").split(".js").join(".css")
        if(js.indexOf(".min.css") >= 0) js = js.split("/css/").join("/js/").split(".css").join(".js")
        let cdns = {js, css, version};
        resolve(cdns);
      }).catch(e => {
        resolve({});
      });
    })
  }

  let results = {}

  let cdnName = (name, version) => {
    return new Promise((resolve, reject) => {
      getCDN1(name, version).then(res => {
        results = res;
        if(!results || !results.js || !results.css){
          getCDN2(name, version).then(res => {
            results = results = {js: results.js || res.js, css: results.css || res.css, version: results.version || res.version}
            resolve(results);
         }).catch(e => {
            resolve(results);
          })
        }else{
            resolve(results);
        }
      })
    })
  }

  window.cdnName = cdnName

  window.cdn = () => {
    return fetch(`https://unpkg.com/lodash`).then(res => res.text()).then(res => eval(res))
  }
})()
